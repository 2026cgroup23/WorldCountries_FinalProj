/* ==========================================================================
   quiz-clash.js  —  "Country Clash" (Higher / Lower) single-player game.
   Uses only the existing GET /api/Countries endpoint. Scores are personal
   and stored in this browser's localStorage (no server, no multiplayer).
   ========================================================================== */

// ---- Auth guard (same pattern as the rest of the site) ----
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
const BEST_KEY = "quizBest_clash";

// ---- Difficulty settings ----
const DIFFICULTY = {
    easy: { time: 45, gap: 0.25, topByPopulation: 100 },
    medium: { time: 45, gap: 0.12, topByPopulation: 0 },
    hard: { time: 35, gap: 0.08, topByPopulation: 0 }
};

// ---- The comparable statistics ----
const STATS = {
    population: {
        question: "לאיזו מדינה יש אוכלוסייה גדולה יותר?",
        get: function (c) { return Number(c.population) || 0; },
        format: formatNumber
    },
    area: {
        question: "לאיזו מדינה יש שטח גדול יותר?",
        get: function (c) { return Number(c.area) || 0; },
        format: formatArea
    }
};

const STAT_KEYS = ["population", "area"];

// ---- State ----
let allCountries = [];
let pool = [];
let settings = DIFFICULTY.medium;

let champion = null;
let challenger = null;
let currentStat = "population";

let score = 0;
let streak = 0;
let bestStreak = 0;
let rounds = 0;

let timeLeft = 0;
let timerId = null;
let answering = false;

// ---- Elements ----
const screenStart = document.getElementById("screenStart");
const screenGame = document.getElementById("screenGame");
const screenEnd = document.getElementById("screenEnd");

const difficultySelect = document.getElementById("difficultySelect");
const startButton = document.getElementById("startButton");
const startMessage = document.getElementById("startMessage");
const bestScoreStart = document.getElementById("bestScoreStart");

const scoreValue = document.getElementById("scoreValue");
const streakValue = document.getElementById("streakValue");
const timerFill = document.getElementById("timerFill");
const timerText = document.getElementById("timerText");
const statLabel = document.getElementById("statLabel");

const championCard = document.getElementById("championCard");
const championFlag = document.getElementById("championFlag");
const championName = document.getElementById("championName");
const championValue = document.getElementById("championValue");

const challengerCard = document.getElementById("challengerCard");
const challengerFlag = document.getElementById("challengerFlag");
const challengerName = document.getElementById("challengerName");
const challengerValue = document.getElementById("challengerValue");
const higherButton = document.getElementById("higherButton");
const lowerButton = document.getElementById("lowerButton");

const roundFeedback = document.getElementById("roundFeedback");

const finalScore = document.getElementById("finalScore");
const finalStreak = document.getElementById("finalStreak");
const recordWrap = document.getElementById("recordWrap");
const playAgainButton = document.getElementById("playAgainButton");

initPage();

function initPage() {
    showUser();
    bestScoreStart.textContent = formatNumber(getBestScore());

    document.getElementById("logoutButton")
        .addEventListener("click", logout);

    startButton.addEventListener("click", startGame);
    playAgainButton.addEventListener("click", backToStart);

    higherButton.addEventListener("click", function () { answer("higher"); });
    lowerButton.addEventListener("click", function () { answer("lower"); });

    document.addEventListener("keydown", function (event) {
        if (screenGame.hidden || answering) {
            return;
        }
        if (event.key === "ArrowUp") { answer("higher"); }
        if (event.key === "ArrowDown") { answer("lower"); }
    });
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
        }

        pool = buildPool();

        if (pool.length < 4) {
            throw new Error("אין מספיק נתוני מדינות כדי לשחק.");
        }

        score = 0;
        streak = 0;
        bestStreak = 0;
        rounds = 0;
        timeLeft = settings.time;

        updateScore();
        updateTimer();

        currentStat = pickRandom(STAT_KEYS);
        champion = pickRandom(pool);
        challenger = pickChallenger(champion, currentStat);

        renderRound(false);

        showScreen(screenGame);
        startTimer();
    } catch (error) {
        startMessage.textContent = translateError(error.message);
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
    // Keep only countries that have both a flag and a positive value.
    let list = allCountries.filter(function (c) {
        return (
            c.flagUrl &&
            Number(c.population) > 0 &&
            Number(c.area) > 0 &&
            c.commonName
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

// ---- Round ----
function pickChallenger(against, statKey) {
    const stat = STATS[statKey];
    const baseValue = stat.get(against);

    // Try to find an opponent with a "fair" gap so there is a clear answer.
    for (let attempt = 0; attempt < 60; attempt++) {
        const candidate = pickRandom(pool);

        if (candidate === against) {
            continue;
        }

        const value = stat.get(candidate);
        const larger = Math.max(value, baseValue);

        if (larger === 0) {
            continue;
        }

        const ratio = Math.abs(value - baseValue) / larger;

        if (ratio >= settings.gap) {
            return candidate;
        }
    }

    // Fallback: any different country.
    let fallback = pickRandom(pool);
    while (fallback === against && pool.length > 1) {
        fallback = pickRandom(pool);
    }
    return fallback;
}

function renderRound(animateChampion) {
    const stat = STATS[currentStat];

    statLabel.textContent = stat.question;

    championName.textContent = champion.commonName;
    championFlag.src = champion.flagUrl;
    championFlag.alt = "דגל " + champion.commonName;
    championValue.textContent = stat.format(stat.get(champion));

    challengerName.textContent = challenger.commonName;
    challengerFlag.src = challenger.flagUrl;
    challengerFlag.alt = "דגל " + challenger.commonName;
    challengerValue.textContent = "?";
    challengerValue.classList.add("hidden-value");

    championCard.classList.remove("correct", "wrong");
    challengerCard.classList.remove("correct", "wrong");

    setChoiceEnabled(true);
    answering = false;
}

function answer(choice) {
    if (answering) {
        return;
    }
    answering = true;
    rounds += 1;
    setChoiceEnabled(false);

    const stat = STATS[currentStat];
    const championVal = stat.get(champion);
    const challengerVal = stat.get(challenger);

    const isHigher = challengerVal > championVal;
    const correct =
        (choice === "higher" && isHigher) ||
        (choice === "lower" && !isHigher);

    // Reveal the challenger's real value with a count-up animation.
    challengerValue.classList.remove("hidden-value");
    countUp(challengerValue, challengerVal, stat.format);

    if (correct) {
        handleCorrect();
    } else {
        handleWrong();
    }

    // Small pause so the player sees the reveal, then continue.
    setTimeout(nextRound, 1100);
}

function handleCorrect() {
    const gained = Math.round(100 * (1 + streak * 0.1));
    score += gained;
    streak += 1;

    if (streak > bestStreak) {
        bestStreak = streak;
    }

    // Every 5-streak grants +3 seconds.
    if (streak % 5 === 0) {
        timeLeft += 3;
        updateTimer();
    }

    challengerCard.classList.add("correct");
    roundFeedback.textContent = "נכון! +" + gained + " נקודות";
    roundFeedback.className = "feedback good";

    updateScore();
}

function handleWrong() {
    streak = 0;
    challengerCard.classList.add("wrong");
    roundFeedback.textContent = "טעות! הרצף התאפס.";
    roundFeedback.className = "feedback bad";

    updateScore();
}

function nextRound() {
    if (screenGame.hidden) {
        return;
    }

    // Winner of the comparison becomes the next champion.
    const stat = STATS[currentStat];
    if (stat.get(challenger) >= stat.get(champion)) {
        champion = challenger;
    }

    currentStat = pickRandom(STAT_KEYS);
    challenger = pickChallenger(champion, currentStat);

    roundFeedback.textContent = "";
    roundFeedback.className = "feedback";

    renderRound(true);
}

function setChoiceEnabled(enabled) {
    higherButton.disabled = !enabled;
    lowerButton.disabled = !enabled;
}

// ---- Timer ----
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
    timerText.textContent = "0:" + String(shown).padStart(2, "0");

    timerFill.classList.remove("warn", "danger");
    if (shown <= 5) {
        timerFill.classList.add("danger");
    } else if (shown <= 10) {
        timerFill.classList.add("warn");
    }
}

function updateScore() {
    scoreValue.textContent = formatNumber(score);
    streakValue.textContent = String(streak);
}

// ---- End ----
function endGame() {
    stopTimer();

    finalScore.textContent = formatNumber(score);
    finalStreak.textContent = String(bestStreak);

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
            game: "clash",
            score: score,
            correctAnswers: bestStreak,
            totalQuestions: Math.max(1, rounds),
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

// ---- Screens ----
function showScreen(target) {
    [screenStart, screenGame, screenEnd].forEach(function (screen) {
        screen.hidden = screen !== target;
    });
}

// ---- Count-up animation ----
function countUp(element, target, format) {
    const duration = 650;
    const start = performance.now();

    function frame(now) {
        const progress = Math.min(1, (now - start) / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        element.textContent = format(value);
        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            element.textContent = format(target);
        }
    }

    requestAnimationFrame(frame);
}

// ---- Personal best (localStorage) ----
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

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    window.location.replace("login.html");
}
