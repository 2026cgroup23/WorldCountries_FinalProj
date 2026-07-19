/* ==========================================================================
   geo-game.js  —  "Locate the Country" (GeoGuessr-style) single-player game.
   The player is shown a country name + flag and clicks on the world map where
   they think it is. Points are awarded by the great-circle distance between the
   click and the country's real coordinates. Scores are personal (localStorage)
   and also sent best-effort to the database (QuizAttempts).
   ========================================================================== */

// ---- Auth guard ----
const currentUserString = localStorage.getItem("currentUser");
const isLoggedIn = localStorage.getItem("isLoggedIn");

let currentUser = null;

if (!currentUserString || isLoggedIn !== "true") {
    window.location.replace("login.html");
} else {
    try {
        currentUser = JSON.parse(currentUserString);
    } catch (error) {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isLoggedIn");
        window.location.replace("login.html");
    }
}

const countriesApiUrl = "https://localhost:7296/api/Countries";
const quizGameApiUrl = "https://localhost:7296/api/QuizGame";
const BEST_KEY = "quizBest_locate";

// ---- Difficulty ----
const DIFFICULTY = {
    easy: { rounds: 5, time: 25, scale: 2200, topByPopulation: 80 },
    medium: { rounds: 5, time: 20, scale: 1600, topByPopulation: 0 },
    hard: { rounds: 7, time: 15, scale: 1100, topByPopulation: 0 }
};

const MAX_ROUND_POINTS = 1000;

// ---- State ----
let allCountries = [];
let pool = [];
let settings = DIFFICULTY.medium;

let map = null;
let guessLayer = null;

let target = null;
let roundIndex = 0;
let score = 0;

let timeLeft = 0;
let timerId = null;
let acceptingClick = false;

// ---- Elements ----
const screenStart = document.getElementById("screenStart");
const screenGame = document.getElementById("screenGame");
const screenEnd = document.getElementById("screenEnd");

const difficultySelect = document.getElementById("difficultySelect");
const startButton = document.getElementById("startButton");
const startMessage = document.getElementById("startMessage");
const bestScoreStart = document.getElementById("bestScoreStart");

const scoreValue = document.getElementById("scoreValue");
const roundValue = document.getElementById("roundValue");
const timerFill = document.getElementById("timerFill");
const timerText = document.getElementById("timerText");

const targetFlag = document.getElementById("targetFlag");
const targetName = document.getElementById("targetName");
const targetHint = document.getElementById("targetHint");

const roundResult = document.getElementById("roundResult");
const roundResultText = document.getElementById("roundResultText");
const nextButton = document.getElementById("nextButton");

const finalScore = document.getElementById("finalScore");
const finalSummary = document.getElementById("finalSummary");
const recordWrap = document.getElementById("recordWrap");
const playAgainButton = document.getElementById("playAgainButton");

initPage();

function initPage() {
    showUser();
    bestScoreStart.textContent = formatNumber(getBestScore());

    document.getElementById("logoutButton").addEventListener("click", logout);
    startButton.addEventListener("click", startGame);
    playAgainButton.addEventListener("click", backToStart);
    nextButton.addEventListener("click", nextRound);
}

function showUser() {
    const name = (currentUser && currentUser.fullName) || "משתמש";
    document.getElementById("headerUserName").textContent = name;
    document.getElementById("userAvatar").textContent =
        name.trim().charAt(0).toUpperCase() || "U";
}

// ---- Start ----
async function startGame() {
    startMessage.textContent = "";
    startButton.disabled = true;
    startButton.textContent = "טוען מדינות...";

    settings = DIFFICULTY[difficultySelect.value] || DIFFICULTY.medium;

    try {
        if (allCountries.length === 0) {
            allCountries = await loadCountries();
        }

        pool = buildPool();

        if (pool.length < settings.rounds) {
            throw new Error("אין מספיק מדינות עם קואורדינטות כדי לשחק.");
        }

        pool = shuffle(pool).slice(0, settings.rounds);

        score = 0;
        roundIndex = 0;

        updateScore();
        showScreen(screenGame);

        if (map === null) {
            buildMap();
        } else {
            setTimeout(function () { map.invalidateSize(); }, 50);
        }

        startRound();
    } catch (error) {
        startMessage.textContent = translateError(error.message);
        showScreen(screenStart);
    } finally {
        startButton.disabled = false;
        startButton.textContent = "התחל משחק";
    }
}

async function loadCountries() {
    let response;

    try {
        response = await fetch(
            countriesApiUrl + "?sortBy=name&sortDirection=asc",
            { headers: { "Accept": "application/json" } }
        );
    } catch (networkError) {
        console.error("Geo game network error:", networkError);
        throw new Error("Failed to fetch");
    }

    const data = await readResponseBody(response);

    if (!response.ok) {
        throw new Error(getMessage(data) || "טעינת המדינות נכשלה.");
    }

    return Array.isArray(data.countries) ? data.countries : [];
}

function buildPool() {
    let list = allCountries.filter(function (c) {
        return (
            c.commonName &&
            c.flagUrl &&
            Number.isFinite(Number(c.latitude)) &&
            Number.isFinite(Number(c.longitude))
        );
    });

    if (settings.topByPopulation > 0) {
        list = list
            .slice()
            .sort(function (a, b) { return b.population - a.population; })
            .slice(0, settings.topByPopulation);
    }

    return list;
}

// ---- Map ----
function buildMap() {
    map = L.map("geoMap", {
        worldCopyJump: true,
        minZoom: 1
    }).setView([25, 10], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
        noWrap: false
    }).addTo(map);

    guessLayer = L.layerGroup().addTo(map);

    map.on("click", onMapClick);

    setTimeout(function () { map.invalidateSize(); }, 60);
}

// ---- Round flow ----
function startRound() {
    target = pool[roundIndex];

    guessLayer.clearLayers();
    map.setView([25, 10], 2);

    roundResult.hidden = true;
    acceptingClick = true;

    targetFlag.src = target.flagUrl;
    targetFlag.alt = "דגל " + target.commonName;
    targetName.textContent = target.commonName;
    targetHint.textContent = target.continentName
        ? translateContinent(target.continentName)
        : "";

    roundValue.textContent = (roundIndex + 1) + " / " + settings.rounds;

    timeLeft = settings.time;
    updateTimer();
    startTimer();
}

function onMapClick(event) {
    if (!acceptingClick) {
        return;
    }
    acceptingClick = false;
    stopTimer();

    resolveRound(event.latlng.lat, event.latlng.lng);
}

function resolveRound(guessLat, guessLng) {
    const realLat = Number(target.latitude);
    const realLng = Number(target.longitude);

    const distance = haversine(guessLat, guessLng, realLat, realLng);
    const points = Math.round(
        MAX_ROUND_POINTS * Math.exp(-distance / settings.scale)
    );

    score += points;
    updateScore();

    drawResult(guessLat, guessLng, realLat, realLng);

    roundResultText.textContent =
        "📍 " + formatNumber(Math.round(distance)) + " ק\"מ מהמדינה · +" +
        formatNumber(points) + " נקודות";

    finishRoundUi();
}

function timeOut() {
    // No guess in time -> zero points, just reveal the real location.
    acceptingClick = false;
    stopTimer();

    const realLat = Number(target.latitude);
    const realLng = Number(target.longitude);

    guessLayer.clearLayers();
    guessLayer.addLayer(pin(realLat, realLng, "🎯"));
    map.setView([realLat, realLng], 4);

    roundResultText.textContent = "⏰ הזמן נגמר! 0 נקודות (" + target.commonName + ")";

    finishRoundUi();
}

function drawResult(guessLat, guessLng, realLat, realLng) {
    guessLayer.addLayer(pin(guessLat, guessLng, "📍"));
    guessLayer.addLayer(pin(realLat, realLng, "🎯"));

    L.polyline(
        [[guessLat, guessLng], [realLat, realLng]],
        { color: "#38bdf8", weight: 2, dashArray: "6 6" }
    ).addTo(guessLayer);

    const bounds = L.latLngBounds(
        [guessLat, guessLng],
        [realLat, realLng]
    );
    map.fitBounds(bounds.pad(0.4));
}

function finishRoundUi() {
    const isLast = roundIndex + 1 >= settings.rounds;
    nextButton.textContent = isLast ? "לסיכום" : "הסבב הבא";
    roundResult.hidden = false;
}

function nextRound() {
    roundIndex += 1;

    if (roundIndex >= settings.rounds) {
        endGame();
        return;
    }

    startRound();
}

// ---- Map marker helper ----
function pin(lat, lng, emoji) {
    const icon = L.divIcon({
        className: "",
        html: '<div class="geo-pin">' + emoji + "</div>",
        iconSize: [26, 26],
        iconAnchor: [13, 24]
    });

    return L.marker([lat, lng], { icon: icon });
}

// ---- Timer ----
function startTimer() {
    stopTimer();
    timerId = setInterval(function () {
        timeLeft -= 1;
        updateTimer();
        if (timeLeft <= 0) {
            timeOut();
        }
    }, 1000);
}

function stopTimer() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
}

function updateTimer() {
    const shown = Math.max(timeLeft, 0);
    const percent = Math.max(0, Math.min(100, (shown / settings.time) * 100));

    timerFill.style.width = percent + "%";
    timerText.textContent = "0:" + String(shown).padStart(2, "0");

    timerFill.classList.remove("warn", "danger");
    if (shown <= 4) {
        timerFill.classList.add("danger");
    } else if (shown <= 8) {
        timerFill.classList.add("warn");
    }
}

function updateScore() {
    scoreValue.textContent = formatNumber(score);
}

// ---- End ----
function endGame() {
    stopTimer();

    finalScore.textContent = formatNumber(score);

    const maxPossible = settings.rounds * MAX_ROUND_POINTS;
    finalSummary.textContent =
        "צברת " + formatNumber(score) + " מתוך " +
        formatNumber(maxPossible) + " נקודות אפשריות ב-" +
        settings.rounds + " סבבים.";

    const isRecord = saveBestScore(score);
    recordWrap.hidden = !isRecord;

    submitAttempt();

    showScreen(screenEnd);
}

function backToStart() {
    bestScoreStart.textContent = formatNumber(getBestScore());
    showScreen(screenStart);
}

function showScreen(targetScreen) {
    [screenStart, screenGame, screenEnd].forEach(function (screen) {
        screen.hidden = screen !== targetScreen;
    });
}

// ---- Save result to DB (best-effort) ----
function submitAttempt() {
    const userId = currentUser && currentUser.userId;
    if (!userId) {
        return;
    }

    fetch(quizGameApiUrl + "/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: userId,
            game: "locate",
            score: score,
            correctAnswers: 0,
            totalQuestions: settings.rounds,
            timeTakenSeconds: settings.time * settings.rounds
        })
    }).catch(function (error) {
        console.warn("שמירת התוצאה נכשלה (לא חוסם):", error);
    });
}

// ---- Personal best ----
function getBestScore() {
    const value = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) ? value : 0;
}

function saveBestScore(value) {
    if (value > getBestScore()) {
        localStorage.setItem(BEST_KEY, String(value));
        return true;
    }
    return false;
}

// ---- Geo / helpers ----
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371; // km
    const toRad = function (d) { return (d * Math.PI) / 180; };

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function shuffle(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
    return a;
}

function translateContinent(name) {
    const value = String(name || "").trim().toLowerCase();
    const translations = {
        africa: "אפריקה",
        asia: "אסיה",
        europe: "אירופה",
        "north america": "אמריקה הצפונית",
        "south america": "אמריקה הדרומית",
        oceania: "אוקיאניה",
        antarctica: "אנטארקטיקה"
    };
    return translations[value] || name || "";
}

function formatNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString("he-IL") : "0";
}

function getMessage(data) {
    if (typeof data === "string") {
        return data;
    }
    return (data && data.message) || "";
}

async function readResponseBody(response) {
    const text = await response.text();
    if (text === "") {
        return {};
    }
    try {
        return JSON.parse(text);
    } catch (error) {
        return { message: text };
    }
}

function translateError(message) {
    const value = String(message || "");
    if (value.includes("Failed to fetch") || value.includes("NetworkError")) {
        return "לא ניתן להתחבר לשרת. ודא שה-API פועל ושאישרת את תעודת ה-HTTPS.";
    }
    return value || "אירעה שגיאה לא צפויה.";
}

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    window.location.replace("login.html");
}
