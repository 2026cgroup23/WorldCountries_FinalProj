/* ==========================================================================
   map.js  —  Interactive world map (Leaflet).
   Shows every country that has coordinates as a marker coloured by continent,
   with a popup (flag / capital / population / link). A toggle limits the view
   to the countries the logged-in user saved in "הרשימות שלי".
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
const userCountryListsApiUrl = "https://localhost:7296/api/UserCountryLists";

// Continent -> colour (English names as returned by the API).
const CONTINENT_COLORS = {
    africa: "#f59e0b",
    asia: "#ef4444",
    europe: "#3b82f6",
    "north america": "#10b981",
    "south america": "#a855f7",
    oceania: "#06b6d4",
    antarctica: "#94a3b8"
};

const DEFAULT_COLOR = "#64748b";

// ---- State ----
let map = null;
let markersLayer = null;
let allCountries = [];
let savedIds = new Set();

// ---- Elements ----
const continentSelect = document.getElementById("continentSelect");
const savedOnly = document.getElementById("savedOnly");
const mapStatus = document.getElementById("mapStatus");
const mapMessage = document.getElementById("mapMessage");
const mapLegend = document.getElementById("mapLegend");

initPage();

async function initPage() {
    showUser();

    document.getElementById("logoutButton").addEventListener("click", logout);
    continentSelect.addEventListener("change", renderMarkers);
    savedOnly.addEventListener("change", renderMarkers);

    buildMap();
    buildLegend();

    try {
        const results = await Promise.all([
            loadCountries(),
            loadSavedIds()
        ]);

        allCountries = results[0];
        savedIds = results[1];

        fillContinents();
        renderMarkers();
    } catch (error) {
        showError(translateError(error.message));
        mapStatus.textContent = "טעינת הנתונים נכשלה.";
    }
}

function showUser() {
    const name = (currentUser && currentUser.fullName) || "משתמש";
    document.getElementById("headerUserName").textContent = name;
    document.getElementById("userAvatar").textContent =
        name.trim().charAt(0).toUpperCase() || "U";
}

// ---- Map setup ----
function buildMap() {
    map = L.map("worldMap", {
        worldCopyJump: true,
        minZoom: 2
    }).setView([25, 10], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
}

function buildLegend() {
    const names = {
        africa: "אפריקה",
        asia: "אסיה",
        europe: "אירופה",
        "north america": "אמריקה הצפונית",
        "south america": "אמריקה הדרומית",
        oceania: "אוקיאניה",
        antarctica: "אנטארקטיקה"
    };

    let html = "";

    Object.keys(CONTINENT_COLORS).forEach(function (key) {
        html +=
            '<span class="legend-item">' +
            '<span class="legend-dot" style="background:' +
            CONTINENT_COLORS[key] + '"></span>' +
            names[key] +
            "</span>";
    });

    html +=
        '<span class="legend-item">' +
        '<span class="legend-dot saved"></span>מדינה שנשמרה</span>';

    mapLegend.innerHTML = html;
}

// ---- Data ----
async function loadCountries() {
    const response = await fetch(
        countriesApiUrl + "?sortBy=name&sortDirection=asc",
        { headers: { "Accept": "application/json" } }
    );

    const data = await readResponseBody(response);

    if (!response.ok) {
        throw new Error(getMessage(data) || "טעינת המדינות נכשלה.");
    }

    return Array.isArray(data.countries) ? data.countries : [];
}

async function loadSavedIds() {
    // Saved countries are optional; never let a failure here block the map.
    const userId = currentUser && currentUser.userId;
    if (!userId) {
        return new Set();
    }

    try {
        const response = await fetch(
            userCountryListsApiUrl + "/" + userId,
            { headers: { "Accept": "application/json" } }
        );

        const data = await readResponseBody(response);

        if (!response.ok) {
            return new Set();
        }

        const ids = new Set();
        (data.countries || []).forEach(function (item) {
            ids.add(Number(item.countryId));
        });
        return ids;
    } catch (error) {
        console.warn("Load saved countries failed (non-blocking):", error);
        return new Set();
    }
}

function fillContinents() {
    const seen = {};

    allCountries.forEach(function (c) {
        const name = c.continentName;
        if (name && !seen[name]) {
            seen[name] = true;
            const option = document.createElement("option");
            option.value = name;
            option.textContent = translateContinent(name);
            continentSelect.appendChild(option);
        }
    });
}

// ---- Rendering ----
function renderMarkers() {
    markersLayer.clearLayers();

    const continentFilter = continentSelect.value;
    const onlySaved = savedOnly.checked;

    let shown = 0;

    allCountries.forEach(function (country) {
        const lat = Number(country.latitude);
        const lng = Number(country.longitude);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return;
        }

        if (continentFilter && country.continentName !== continentFilter) {
            return;
        }

        const isSaved = savedIds.has(Number(country.countryId));

        if (onlySaved && !isSaved) {
            return;
        }

        markersLayer.addLayer(createMarker(country, lat, lng, isSaved));
        shown += 1;
    });

    mapStatus.textContent = "מציג " + shown + " מדינות" +
        (onlySaved ? " שנשמרו" : "") + ".";
}

function createMarker(country, lat, lng, isSaved) {
    const color = colorFor(country.continentName);

    const marker = L.circleMarker([lat, lng], {
        radius: isSaved ? 8 : 5,
        color: isSaved ? "#fbbf24" : "#ffffff",
        weight: isSaved ? 3 : 1,
        fillColor: color,
        fillOpacity: 0.85
    });

    marker.bindPopup(buildPopup(country), { closeButton: true });
    return marker;
}

function buildPopup(country) {
    const id = Number(country.countryId);
    const flag = country.flagUrl
        ? '<img src="' + escapeHtml(country.flagUrl) + '" alt="דגל">'
        : "";

    const capital = country.capital
        ? '<div class="row">🏛️ ' + escapeHtml(country.capital) + "</div>"
        : "";

    return (
        '<div class="map-popup">' +
        flag +
        "<h3>" + escapeHtml(country.commonName) + "</h3>" +
        '<div class="row">' + escapeHtml(translateContinent(country.continentName)) + "</div>" +
        capital +
        '<div class="row">👥 ' + formatNumber(country.population) + "</div>" +
        '<a href="country-details.html?countryId=' + id + '">לפרטי המדינה</a>' +
        "</div>"
    );
}

function colorFor(continentName) {
    const key = String(continentName || "").trim().toLowerCase();
    return CONTINENT_COLORS[key] || DEFAULT_COLOR;
}

// ---- Helpers ----
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

function showError(message) {
    mapMessage.textContent = message;
    mapMessage.hidden = false;
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
