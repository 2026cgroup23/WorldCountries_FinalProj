/* ==========================================================================
   quizzes.js  —  Quiz hub. Shows the two games and the player's personal
   best score for each (from this browser's localStorage).
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

initPage();

function initPage() {
    const name = (currentUser && currentUser.fullName) || "משתמש";
    document.getElementById("headerUserName").textContent = name;
    document.getElementById("userAvatar").textContent =
        name.trim().charAt(0).toUpperCase() || "U";

    document.getElementById("logoutButton").addEventListener("click", logout);

    document.getElementById("bestClash").textContent =
        formatNumber(getBestScore("quizBest_clash"));

    document.getElementById("bestMystery").textContent =
        formatNumber(getBestScore("quizBest_mystery"));
}

function getBestScore(key) {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) ? value : 0;
}

function formatNumber(value) {
    return Number(value).toLocaleString("he-IL");
}

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    window.location.replace("login.html");
}
