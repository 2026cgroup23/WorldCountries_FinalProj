/* ==========================================================================
   ai-finder.js  —  "Smart destination finder".
   Uses Transformers.js (a free, open-source AI module from Hugging Face) that
   runs a real sentence-embedding model (all-MiniLM-L6-v2) entirely IN THE
   BROWSER — no API key, no server. Every country is turned into a short text
   description and embedded once; the user's free-text query is embedded too,
   and countries are ranked by cosine similarity (semantic match, not keywords).

   Loaded as a normal (classic) script so it also works when the page is opened
   directly from the file system. The Transformers.js library itself is an ES
   module, so it is pulled in on demand with a dynamic import() from a CDN
   (an https URL, which browsers allow even from a file:// page).
   ========================================================================== */

const TRANSFORMERS_URL =
    "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

// Assigned once the library is dynamically imported (see ensureReady).
let pipeline = null;
let cos_sim = null;

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
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";
const RESULT_COUNT = 8;

// ---- State ----
let extractor = null;       // the AI pipeline (loaded lazily)
let countries = [];         // country list from the API
let vectors = [];           // embedding per country (same order as `countries`)
let ready = false;          // true once model + embeddings are prepared

// ---- Elements ----
const queryInput = document.getElementById("queryInput");
const findButton = document.getElementById("findButton");
const aiStatus = document.getElementById("aiStatus");
const aiError = document.getElementById("aiError");
const aiResults = document.getElementById("aiResults");
const exampleChips = document.getElementById("exampleChips");

if (currentUser) {
    initPage();
}

function initPage() {
    const name = (currentUser && currentUser.fullName) || "משתמש";
    document.getElementById("headerUserName").textContent = name;
    document.getElementById("userAvatar").textContent =
        name.trim().charAt(0).toUpperCase() || "U";

    document.getElementById("logoutButton").addEventListener("click", logout);

    findButton.addEventListener("click", findDestinations);

    exampleChips.addEventListener("click", function (event) {
        const chip = event.target.closest(".chip");
        if (!chip) {
            return;
        }
        queryInput.value = chip.dataset.q || chip.textContent.trim();
        findDestinations();
    });
}

// ---- Main action ----
async function findDestinations() {
    const query = queryInput.value.trim();

    if (query === "") {
        showError("כתבו תיאור קצר של היעד שאתם מחפשים.");
        return;
    }

    hideError();
    findButton.disabled = true;

    try {
        await ensureReady();

        setStatus("מחפש התאמות...");

        const queryVector = await embedOne(query);

        const scored = countries.map(function (country, index) {
            return {
                country: country,
                score: cos_sim(queryVector, vectors[index])
            };
        });

        scored.sort(function (a, b) { return b.score - a.score; });

        renderResults(scored.slice(0, RESULT_COUNT));
        setStatus("");
    } catch (error) {
        console.error("AI finder error:", error);
        setStatus("");
        showError(translateError(error.message));
    } finally {
        findButton.disabled = false;
    }
}

// ---- Prepare the model + country embeddings (runs once) ----
async function ensureReady() {
    if (ready) {
        return;
    }

    if (pipeline === null) {
        setStatus("טוען ספריית AI...");
        const transformers = await import(TRANSFORMERS_URL);
        pipeline = transformers.pipeline;
        cos_sim = transformers.cos_sim;
    }

    if (countries.length === 0) {
        setStatus("טוען מדינות...");
        countries = await loadCountries();
    }

    if (extractor === null) {
        setStatus("טוען מודל AI (הורדה חד-פעמית)...");
        extractor = await pipeline("feature-extraction", MODEL_NAME, {
            progress_callback: function (report) {
                if (report && report.status === "progress" && report.total) {
                    setStatus("מוריד מודל AI: " +
                        Math.round(report.progress || 0) + "%");
                }
            }
        });
    }

    setStatus("מנתח מדינות...");
    vectors = await embedCountries(countries);

    ready = true;
    setStatus("");
}

// ---- Embeddings ----
async function embedCountries(list) {
    const texts = list.map(describeCountry);
    const output = [];
    const batchSize = 32;

    for (let i = 0; i < texts.length; i += batchSize) {
        const slice = texts.slice(i, i + batchSize);

        const result = await extractor(slice, {
            pooling: "mean",
            normalize: true
        });

        const rows = result.tolist(); // [slice.length][dim]
        rows.forEach(function (row) { output.push(row); });

        setStatus("מנתח מדינות... " +
            Math.min(i + batchSize, texts.length) + "/" + texts.length);
    }

    return output;
}

async function embedOne(text) {
    const result = await extractor(text, {
        pooling: "mean",
        normalize: true
    });
    return Array.from(result.data);
}

// Build a short English description per country so the model has rich signal
// to match natural-language queries (climate is derived from the latitude).
function describeCountry(country) {
    const parts = [];

    parts.push(country.commonName || "A country");

    if (country.continentName) {
        parts.push("located in " + country.continentName);
    }

    if (country.region) {
        parts.push("region: " + country.region +
            (country.subregion ? " (" + country.subregion + ")" : ""));
    }

    if (country.capital) {
        parts.push("capital city " + country.capital);
    }

    parts.push(populationBand(country.population));
    parts.push(areaBand(country.area));
    parts.push(climateBand(country.latitude));

    return parts.join(", ") + ".";
}

function populationBand(population) {
    const value = Number(population) || 0;
    if (value < 1000000) return "a very small population";
    if (value < 10000000) return "a small population";
    if (value < 50000000) return "a medium population";
    if (value < 150000000) return "a large population";
    return "a huge population";
}

function areaBand(area) {
    const value = Number(area) || 0;
    if (value < 10000) return "a tiny territory";
    if (value < 100000) return "a small country by area";
    if (value < 1000000) return "a mid-sized country by area";
    return "a vast country by area";
}

function climateBand(latitude) {
    const lat = Number(latitude);
    if (!Number.isFinite(lat)) {
        return "";
    }

    const hemisphere = lat >= 0 ? "northern hemisphere" : "southern hemisphere";
    const abs = Math.abs(lat);

    let climate;
    if (abs < 23.5) {
        climate = "tropical warm climate";
    } else if (abs < 35) {
        climate = "subtropical climate";
    } else if (abs < 55) {
        climate = "temperate climate";
    } else {
        climate = "cold polar climate";
    }

    return climate + ", " + hemisphere;
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

// ---- Rendering ----
function renderResults(items) {
    aiResults.innerHTML = "";

    items.forEach(function (item, index) {
        aiResults.appendChild(createCard(item, index + 1));
    });
}

function createCard(item, rank) {
    const country = item.country;
    const percent = Math.max(0, Math.min(100, Math.round(item.score * 100)));

    const card = document.createElement("article");
    card.className = "ai-card";

    const flag = country.flagUrl
        ? '<img class="ai-card-flag" src="' + escapeHtml(country.flagUrl) +
          '" alt="דגל ' + escapeHtml(country.commonName) + '">'
        : '<div class="ai-card-flag"></div>';

    card.innerHTML =
        flag +
        '<div class="ai-card-body">' +
        '<span class="ai-card-rank">#' + rank + "</span>" +
        "<h3>" + escapeHtml(country.commonName) + "</h3>" +
        '<span class="ai-card-sub">' +
        escapeHtml(translateContinent(country.continentName)) +
        (country.capital ? " · " + escapeHtml(country.capital) : "") +
        "</span>" +
        '<span class="match-label">התאמה: ' + percent + "%</span>" +
        '<div class="match-bar"><div class="match-fill" style="width:' +
        percent + '%"></div></div>' +
        '<a href="country-details.html?countryId=' +
        Number(country.countryId) + '">לפרטי המדינה</a>' +
        "</div>";

    return card;
}

// ---- Helpers ----
function setStatus(text) {
    aiStatus.textContent = text;
}

function showError(message) {
    aiError.textContent = message;
    aiError.hidden = false;
}

function hideError() {
    aiError.hidden = true;
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
        return "לא ניתן להתחבר. ודא שה-API פועל ושיש חיבור אינטרנט (להורדת המודל).";
    }
    return value || "אירעה שגיאה בהפעלת ה-AI.";
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
