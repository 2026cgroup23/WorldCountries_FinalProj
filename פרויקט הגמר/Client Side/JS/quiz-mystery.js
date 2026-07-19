/* ==========================================================================
   quiz-mystery.js  —  "Mystery Country" progressive-clue single-player game.
   Pool comes from GET /api/Countries; each round fetches GET /api/Countries/{id}
   to add currency & language clues. Scores are personal (localStorage only).
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
const BEST_KEY = "quizBest_mystery";

// ---- Difficulty ----
const DIFFICULTY = {
    easy: { time: 60, clueCount: 7, interval: 5000, showFlag: true, wrongPenalty: 50, topByPopulation: 60 },
    medium: { time: 50, clueCount: 6, interval: 4000, showFlag: true, wrongPenalty: 50, topByPopulation: 0 },
    hard: { time: 45, clueCount: 5, interval: 3000, showFlag: false, wrongPenalty: 100, topByPopulation: 0 }
};

const START_POTENTIAL = 700;
const CLUE_COST = 100;
const MIN_POTENTIAL = 50;
const SOLVE_BONUS = 50;
const SHERLOCK_BONUS = 150;
const SOLVE_TIME_BONUS = 8;

// ---- State ----
let allCountries = [];
let pool = [];
let settings = DIFFICULTY.medium;

let secret = null;
let clues = [];
let revealedCount = 0;
let potential = START_POTENTIAL;

let score = 0;
let solved = 0;
let roundsPlayed = 0;

let timeLeft = 0;
let timerId = null;
let clueTimerId = null;
let roundActive = false;

// ---- Elements ----
const screenStart = document.getElementById("screenStart");
const screenGame = document.getElementById("screenGame");
const screenEnd = document.getElementById("screenEnd");

const difficultySelect = document.getElementById("difficultySelect");
const startButton = document.getElementById("startButton");
const startMessage = document.getElementById("startMessage");
const bestScoreStart = document.getElementById("bestScoreStart");

const scoreValue = document.getElementById("scoreValue");
const solvedValue = document.getElementById("solvedValue");
const timerFill = document.getElementById("timerFill");
const timerText = document.getElementById("timerText");

const potentialValue = document.getElementById("potentialValue");
const clueList = document.getElementById("clueList");
const loadingClue = document.getElementById("loadingClue");

const guessForm = document.getElementById("guessForm");
const guessInput = document.getElementById("guessInput");
const countryNames = document.getElementById("countryNames");
const submitButton = document.getElementById("submitButton");

const revealButton = document.getElementById("revealButton");
const skipButton = document.getElementById("skipButton");
const roundFeedback = document.getElementById("roundFeedback");

const finalScore = document.getElementById("finalScore");
const finalSolved = document.getElementById("finalSolved");
const recordWrap = document.getElementById("recordWrap");
const playAgainButton = document.getElementById("playAgainButton");

initPage();

function initPage() {
    showUser();
    bestScoreStart.textContent = formatNumber(getBestScore());

    document.getElementById("logoutButton").addEventListener("click", logout);

    startButton.addEventListener("click", startGame);
    playAgainButton.addEventListener("click", backToStart);

    guessForm.addEventListener("submit", function (event) {
        event.preventDefault();
        submitGuess();
    });

    revealButton.addEventListener("click", function () {
        if (roundActive && revealedCount < clues.length) {
            revealNextClue(true);
        }
    });

    skipButton.addEventListener("click", skipRound);
}

function showUser() {
    const name = (currentUser && currentUser.fullName) || "משתמש";
    document.getElementById("headerUserName").textContent = name;
    document.getElementById("userAvatar").textContent =
        name.trim().charAt(0).toUpperCase() || "U";
}

// ---- Start / load ----
async function startGame() {
    startMessage.textContent = "";
    startButton.disabled = true;
    startButton.textContent = "טוען מדינות...";

    settings = DIFFICULTY[difficultySelect.value] || DIFFICULTY.medium;

    try {
        if (allCountries.length === 0) {
            allCountries = await loadCountries();
            fillCountryNames();
        }

        pool = buildPool();

        if (pool.length < 5) {
            throw new Error("אין מספיק נתוני מדינות כדי לשחק.");
        }

        score = 0;
        solved = 0;
        roundsPlayed = 0;
        timeLeft = settings.time;

        updateScore();
        updateTimer();

        showScreen(screenGame);
        startTimer();

        nextMystery();
    } catch (error) {
        startMessage.textContent = translateError(error.message);
        showScreen(screenStart);
        stopTimer();
    } finally {
        startButton.disabled = false;
        startButton.textContent = "התחל משחק";
    }
}

async function loadCountries() {
    let response;

    try {
        response = await fetch(countriesApiUrl + "?sortBy=name&sortDirection=asc", {
            headers: { "Accept": "application/json" }
        });
    } catch (networkError) {
        console.error("Quiz load countries network error:", networkError);
        throw new Error(
            "לא ניתן להתחבר לשרת (" + countriesApiUrl + "). " +
            "ודא שה-API פועל ושאישרת את תעודת ה-HTTPS בדפדפן."
        );
    }

    const data = await readResponseBody(response);

    if (!response.ok) {
        console.error("Quiz load countries HTTP error:", response.status, data);
        throw new Error(
            (getMessage(data) || "טעינת המדינות נכשלה.") +
            " (קוד " + response.status + ")"
        );
    }

    const list = Array.isArray(data.countries) ? data.countries : [];
    console.log("Quiz loaded countries:", list.length);
    return list;
}

function buildPool() {
    let list = allCountries.filter(function (c) {
        return c.commonName && Number(c.population) > 0;
    });

    if (settings.topByPopulation > 0) {
        list = list
            .slice()
            .sort(function (a, b) { return b.population - a.population; })
            .slice(0, settings.topByPopulation);
    }

    return list;
}

function fillCountryNames() {
    const seen = {};
    countryNames.innerHTML = "";

    allCountries.forEach(function (c) {
        const name = c.commonName;
        if (name && !seen[name]) {
            seen[name] = true;
            const option = document.createElement("option");
            option.value = name;
            countryNames.appendChild(option);
        }
    });
}

// ---- A single mystery round ----
// Clues are built entirely from the country-list data we already loaded,
// so there is no extra per-country request (and no chance of a 400).
function nextMystery() {
    stopClueTimer();

    clueList.innerHTML = "";
    roundFeedback.textContent = "";
    roundFeedback.className = "feedback";
    guessInput.value = "";

    if (loadingClue) {
        loadingClue.hidden = true;
    }

    secret = pickRandom(pool);
    clues = buildClues(secret);
    revealedCount = 0;
    potential = START_POTENTIAL;
    roundsPlayed += 1;

    setControlsEnabled(true);
    updatePotential();

    roundActive = true;

    // Reveal the first clue immediately, then drip the rest on a timer.
    revealNextClue(false);
    startClueTimer();

    guessInput.focus();
}

function buildClues(country) {
    const list = [];

    // Ordered hardest -> easiest; the flag (biggest giveaway) comes last.
    list.push({
        icon: "🌍",
        label: "יבשת",
        value: translateContinent(country.continentName)
    });

    if (country.region) {
        list.push({
            icon: "🗺️",
            label: "אזור",
            value: country.region + (country.subregion ? " · " + country.subregion : "")
        });
    }

    if (country.isIndependent === true || country.isIndependent === false) {
        list.push({
            icon: "🏳️",
            label: "עצמאות",
            value: country.isIndependent ? "מדינה עצמאית" : "טריטוריה תלויה"
        });
    }

    list.push({
        icon: "👥",
        label: "אוכלוסייה",
        value: formatNumber(country.population)
    });

    list.push({
        icon: "📐",
        label: "שטח",
        value: formatArea(country.area)
    });

    if (country.capital) {
        list.push({
            icon: "🏛️",
            label: "עיר בירה",
            value: country.capital
        });
    }

    if (settings.showFlag && country.flagUrl) {
        list.push({
            icon: "🚩",
            label: "דגל",
            isFlag: true,
            value: country.flagUrl
        });
    }

    return list.slice(0, settings.clueCount);
}

function revealNextClue(chargeCost) {
    if (revealedCount >= clues.length) {
        return;
    }

    const clue = clues[revealedCount];
    revealedCount += 1;

    // The first clue is free; each additional clue lowers the potential.
    if (revealedCount > 1) {
        potential = Math.max(MIN_POTENTIAL, potential - CLUE_COST);
        updatePotential();
    }

    clueList.appendChild(createClueElement(clue, revealedCount));

    if (revealedCount >= clues.length) {
        stopClueTimer();
        revealButton.disabled = true;
    }
}

function createClueElement(clue, index) {
    const element = document.createElement("div");
    element.className = "clue";

    const valueHtml = clue.isFlag
        ? '<img class="clue-flag" src="' + escapeHtml(clue.value) + '" alt="דגל">'
        : '<span class="clue-value">' + escapeHtml(clue.value) + "</span>";

    element.innerHTML =
        '<span class="clue-icon" aria-hidden="true">' + clue.icon + "</span>" +
        '<span class="clue-body">' +
        '<span class="clue-label">רמז ' + index + " · " + escapeHtml(clue.label) + "</span>" +
        valueHtml +
        "</span>";

    return element;
}

// ---- Guessing ----
function submitGuess() {
    if (!roundActive) {
        return;
    }

    const guess = normalize(guessInput.value);

    if (guess === "") {
        return;
    }

    if (matchesSecret(guess)) {
        handleSolve();
    } else {
        handleWrongGuess();
    }
}

function matchesSecret(guess) {
    const names = [secret.commonName, secret.officialName];
    return names.some(function (name) {
        return name && normalize(name) === guess;
    });
}

function handleSolve() {
    roundActive = false;
    stopClueTimer();

    let earned = Math.max(MIN_POTENTIAL, potential) + SOLVE_BONUS;

    const sherlock = revealedCount <= 2;
    if (sherlock) {
        earned += SHERLOCK_BONUS;
    }

    score += earned;
    solved += 1;
    timeLeft += SOLVE_TIME_BONUS;

    updateScore();
    updateTimer();

    roundFeedback.textContent = sherlock
        ? "🕵️ שרלוק! +" + earned + " נקודות (" + secret.commonName + ")"
        : "נכון! +" + earned + " נקודות (" + secret.commonName + ")";
    roundFeedback.className = "feedback good";

    setControlsEnabled(false);
    setTimeout(function () {
        if (!screenGame.hidden) {
            nextMystery();
        }
    }, 1200);
}

function handleWrongGuess() {
    potential = Math.max(MIN_POTENTIAL, potential - settings.wrongPenalty);
    updatePotential();

    roundFeedback.textContent = "לא נכון... נסה שוב או חשוף רמז.";
    roundFeedback.className = "feedback bad";

    guessInput.select();
}

function skipRound() {
    if (!roundActive) {
        return;
    }
    roundActive = false;
    stopClueTimer();

    roundFeedback.textContent = "התשובה הייתה: " + secret.commonName;
    roundFeedback.className = "feedback bad";

    setControlsEnabled(false);
    setTimeout(function () {
        if (!screenGame.hidden) {
            nextMystery();
        }
    }, 1200);
}

function setControlsEnabled(enabled) {
    guessInput.disabled = !enabled;
    submitButton.disabled = !enabled;
    skipButton.disabled = !enabled;
    revealButton.disabled = !enabled || revealedCount >= clues.length;
}

// ---- Clue drip timer ----
function startClueTimer() {
    stopClueTimer();
    clueTimerId = setInterval(function () {
        if (revealedCount < clues.length) {
            revealNextClue(false);
        } else {
            stopClueTimer();
        }
    }, settings.interval);
}

function stopClueTimer() {
    if (clueTimerId) {
        clearInterval(clueTimerId);
        clueTimerId = null;
    }
}

// ---- Main timer ----
function startTimer() {
    stopTimer();
    timerId = setInterval(function () {
        timeLeft -= 1;
        updateTimer();
        if (timeLeft <= 0) {
            endGame();
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

    const minutes = Math.floor(shown / 60);
    const seconds = shown % 60;
    timerText.textContent = minutes + ":" + String(seconds).padStart(2, "0");

    timerFill.classList.remove("warn", "danger");
    if (shown <= 5) {
        timerFill.classList.add("danger");
    } else if (shown <= 10) {
        timerFill.classList.add("warn");
    }
}

function updateScore() {
    scoreValue.textContent = formatNumber(score);
    solvedValue.textContent = String(solved);
}

function updatePotential() {
    potentialValue.textContent = String(Math.max(MIN_POTENTIAL, potential));
}

// ---- End ----
function endGame() {
    stopTimer();
    stopClueTimer();
    roundActive = false;

    finalScore.textContent = formatNumber(score);
    finalSolved.textContent = String(solved);

    const isRecord = saveBestScore(score);
    recordWrap.hidden = !isRecord;

    submitAttempt();

    showScreen(screenEnd);
}

// ---- Save the result to the database (best-effort, never blocks the UI) ----
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
            game: "mystery",
            score: score,
            correctAnswers: solved,
            totalQuestions: Math.max(1, roundsPlayed),
            timeTakenSeconds: settings.time
        })
    }).catch(function (error) {
        console.warn("שמירת התוצאה נכשלה (לא חוסם):", error);
    });
}

function backToStart() {
    bestScoreStart.textContent = formatNumber(getBestScore());
    showScreen(screenStart);
}

function showScreen(target) {
    [screenStart, screenGame, screenEnd].forEach(function (screen) {
        screen.hidden = screen !== target;
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

// ---- Helpers ----
function normalize(value) {
    return String(value || "").trim().toLowerCase();
}

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function formatNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return "0";
    }
    return number.toLocaleString("he-IL");
}

function formatArea(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return "0";
    }
    return number.toLocaleString("he-IL", { maximumFractionDigits: 0 }) + " קמ״ר";
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
    return translations[value] || name || "לא ידועה";
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
        return "לא ניתן להתחבר לשרת. ודא שהשרת פועל.";
    }
    return value || "אירעה שגיאה לא צפויה.";
}

function escapeHtml(value) {
    return String(value == null ? "" : value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    window.location.replace("login.html");
}
