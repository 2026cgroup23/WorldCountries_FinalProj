const currentUserString =
    localStorage.getItem("currentUser");

const isLoggedIn =
    localStorage.getItem("isLoggedIn");

if (
    !currentUserString ||
    isLoggedIn !== "true"
) {
    window.location.replace(
        "login.html"
    );
}

let currentUser;

try {
    currentUser =
        JSON.parse(currentUserString);
} catch (error) {
    clearLoginData();

    window.location.replace(
        "login.html"
    );
}


const userCountryListsApiUrl = "https://localhost:7296/api/UserCountryLists";

let allSavedCountries = [];
let displayedCountries = [];

let selectedListType =
    "all";

let pendingRemoveCountry =
    null;

let messageTimer =
    null;

const mainNavigation =
    document.getElementById(
        "mainNavigation"
    );

const mobileMenuButton =
    document.getElementById(
        "mobileMenuButton"
    );

const userMenuButton =
    document.getElementById(
        "userMenuButton"
    );

const userDropdown =
    document.getElementById(
        "userDropdown"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const userAvatar =
    document.getElementById(
        "userAvatar"
    );

const headerUserName =
    document.getElementById(
        "headerUserName"
    );

const headerUserRole =
    document.getElementById(
        "headerUserRole"
    );

const adminLink =
    document.getElementById(
        "adminLink"
    );

const totalSavedCountries =
    document.getElementById(
        "totalSavedCountries"
    );

const visitedCountriesCount =
    document.getElementById(
        "visitedCountriesCount"
    );

const wishlistCountriesCount =
    document.getElementById(
        "wishlistCountriesCount"
    );

const allTab =
    document.getElementById(
        "allTab"
    );

const visitedTab =
    document.getElementById(
        "visitedTab"
    );

const wishlistTab =
    document.getElementById(
        "wishlistTab"
    );

const allTabCount =
    document.getElementById(
        "allTabCount"
    );

const visitedTabCount =
    document.getElementById(
        "visitedTabCount"
    );

const wishlistTabCount =
    document.getElementById(
        "wishlistTabCount"
    );

const refreshListsButton =
    document.getElementById(
        "refreshListsButton"
    );

const currentListTitle =
    document.getElementById(
        "currentListTitle"
    );

const resultsCount =
    document.getElementById(
        "resultsCount"
    );

const loadingState =
    document.getElementById(
        "loadingState"
    );

const countriesGrid =
    document.getElementById(
        "countriesGrid"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const emptyStateIcon =
    document.getElementById(
        "emptyStateIcon"
    );

const emptyStateTitle =
    document.getElementById(
        "emptyStateTitle"
    );

const emptyStateText =
    document.getElementById(
        "emptyStateText"
    );

const pageMessage =
    document.getElementById(
        "pageMessage"
    );


/* =========================================================
   REMOVE MODAL
========================================================= */

const removeModal =
    document.getElementById(
        "removeModal"
    );

const removeModalOverlay =
    document.getElementById(
        "removeModalOverlay"
    );

const removeModalText =
    document.getElementById(
        "removeModalText"
    );

const cancelRemoveButton =
    document.getElementById(
        "cancelRemoveButton"
    );

const approveRemoveButton =
    document.getElementById(
        "approveRemoveButton"
    );

initializePage();

async function initializePage() {
    showUserInformation();
    configureAdminDisplay();
    addEvents();

    await loadUserLists();
}

function showUserInformation() {
    const fullName =
        currentUser.fullName ||
        "משתמש";

    headerUserName.textContent =
        fullName;

    headerUserRole.textContent =
        isAdminUser()
            ? "Admin"
            : "User";

    userAvatar.textContent =
        getInitial(fullName);
}


function isAdminUser() {
    return (
        Number(currentUser.roleId) === 2 ||
        String(
            currentUser.roleName || ""
        )
            .trim()
            .toLowerCase() === "admin"
    );
}


function configureAdminDisplay() {
    adminLink.hidden =
        !isAdminUser();
}

function addEvents() {
    userMenuButton.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();

            userDropdown.classList.toggle(
                "open"
            );

            userMenuButton.setAttribute(
                "aria-expanded",
                userDropdown.classList
                    .contains("open")
                    .toString()
            );
        }
    );

    mobileMenuButton.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();

            mainNavigation.classList.toggle(
                "open"
            );
        }
    );

    logoutButton.addEventListener(
        "click",
        logout
    );

    document.addEventListener(
        "click",
        closeMenus
    );

    userDropdown.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();
        }
    );

    mainNavigation.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();
        }
    );

    window.addEventListener(
        "resize",
        function () {
            if (window.innerWidth > 950) {
                mainNavigation.classList.remove(
                    "open"
                );
            }
        }
    );

    allTab.addEventListener(
        "click",
        function () {
            selectListType(
                "all"
            );
        }
    );

    visitedTab.addEventListener(
        "click",
        function () {
            selectListType(
                "1"
            );
        }
    );

    wishlistTab.addEventListener(
        "click",
        function () {
            selectListType(
                "2"
            );
        }
    );

    refreshListsButton.addEventListener(
        "click",
        async function () {
            await loadUserLists(
                true
            );
        }
    );

    countriesGrid.addEventListener(
        "click",
        handleCountryAction
    );

    cancelRemoveButton.addEventListener(
        "click",
        closeRemoveModal
    );

    approveRemoveButton.addEventListener(
        "click",
        removeCountryFromList
    );

    removeModalOverlay.addEventListener(
        "click",
        closeRemoveModal
    );

    document.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Escape" &&
                !removeModal.hidden
            ) {
                closeRemoveModal();
            }
        }
    );
}

async function loadUserLists(
    showSuccessMessage = false
) {
    showLoading();
    clearMessage();

    try {
        const response = await fetch(
            `${userCountryListsApiUrl}/${currentUser.userId}`,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );

        const data =
            await readResponseBody(
                response
            );

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "טעינת הרשימות נכשלה."
            );
        }

        allSavedCountries =
            Array.isArray(
                data.countries
            )
                ? data.countries
                : [];

        updateCounts();
        applySelectedList();

        if (showSuccessMessage) {
            showMessage(
                "הרשימות עודכנו בהצלחה.",
                "success"
            );
        }
    } catch (error) {
        console.error(
            "Load lists error:",
            error
        );

        allSavedCountries = [];
        displayedCountries = [];

        updateCounts();
        renderCountries();

        showMessage(
            translateMessage(
                error.message
            ),
            "error"
        );
    } finally {
        hideLoading();

        setRefreshLoading(
            false
        );
    }
}

function selectListType(
    listType
) {
    selectedListType =
        listType;

    allTab.classList.remove(
        "active"
    );

    visitedTab.classList.remove(
        "active"
    );

    wishlistTab.classList.remove(
        "active"
    );

    allTab.setAttribute(
        "aria-selected",
        "false"
    );

    visitedTab.setAttribute(
        "aria-selected",
        "false"
    );

    wishlistTab.setAttribute(
        "aria-selected",
        "false"
    );

    if (listType === "1") {
        visitedTab.classList.add(
            "active"
        );

        visitedTab.setAttribute(
            "aria-selected",
            "true"
        );
    } else if (
        listType === "2"
    ) {
        wishlistTab.classList.add(
            "active"
        );

        wishlistTab.setAttribute(
            "aria-selected",
            "true"
        );
    } else {
        allTab.classList.add(
            "active"
        );

        allTab.setAttribute(
            "aria-selected",
            "true"
        );
    }

    applySelectedList();
}


function applySelectedList() {
    if (selectedListType === "1") {
        displayedCountries =
            allSavedCountries.filter(
                function (country) {
                    return (
                        Number(
                            country.listType
                        ) === 1
                    );
                }
            );

        currentListTitle.textContent =
            "מדינות שביקרתי בהן";
    } else if (
        selectedListType === "2"
    ) {
        displayedCountries =
            allSavedCountries.filter(
                function (country) {
                    return (
                        Number(
                            country.listType
                        ) === 2
                    );
                }
            );

        currentListTitle.textContent =
            "מדינות שאני רוצה לבקר בהן";
    } else {
        displayedCountries =
            [...allSavedCountries];

        currentListTitle.textContent =
            "כל המדינות השמורות";
    }

    renderCountries();
}

function updateCounts() {
    const visitedCount =
        allSavedCountries.filter(
            function (country) {
                return (
                    Number(
                        country.listType
                    ) === 1
                );
            }
        ).length;

    const wishlistCount =
        allSavedCountries.filter(
            function (country) {
                return (
                    Number(
                        country.listType
                    ) === 2
                );
            }
        ).length;

    totalSavedCountries.textContent =
        allSavedCountries.length.toString();

    visitedCountriesCount.textContent =
        visitedCount.toString();

    wishlistCountriesCount.textContent =
        wishlistCount.toString();

    allTabCount.textContent =
        allSavedCountries.length.toString();

    visitedTabCount.textContent =
        visitedCount.toString();

    wishlistTabCount.textContent =
        wishlistCount.toString();
}

function renderCountries() {
    countriesGrid.innerHTML = "";

    resultsCount.textContent =
        getResultsText(
            displayedCountries.length
        );

    if (
        displayedCountries.length === 0
    ) {
        countriesGrid.hidden =
            true;

        emptyState.hidden =
            false;

        configureEmptyState();

        return;
    }

    countriesGrid.hidden =
        false;

    emptyState.hidden =
        true;

    displayedCountries.forEach(
        function (country) {
            countriesGrid.appendChild(
                createCountryCard(
                    country
                )
            );
        }
    );
}


function createCountryCard(
    country
) {
    const card =
        document.createElement(
            "article"
        );

    card.className =
        "country-card";

    const countryId =
        Number(
            country.countryId || 0
        );

    const commonName =
        country.commonName ||
        "מדינה ללא שם";

    const officialName =
        country.officialName ||
        commonName;

    const capital =
        country.capital ||
        "לא הוגדרה";

    const continent =
        country.continentName ||
        "לא הוגדרה";

    const population =
        Number(
            country.population || 0
        );

    const area =
        Number(
            country.area || 0
        );

    const flagUrl =
        country.flagUrl || "";

    const cca3 =
        country.cca3 || "";

    const listType =
        Number(
            country.listType
        );

    const listTypeClass =
        listType === 1
            ? "visited"
            : "wishlist";

    const listTypeText =
        listType === 1
            ? "✓ ביקרתי"
            : "♡ רוצה לבקר";

    card.innerHTML = `
        <div class="country-flag-wrapper">

            ${flagUrl
            ? `
                        <img
                            class="country-flag"
                            src="${escapeHtml(flagUrl)}"
                            alt="דגל ${escapeHtml(commonName)}"
                            loading="lazy"
                        >
                    `
            : `
                        <div class="country-flag missing-flag">
                            🌍
                        </div>
                    `
        }

            ${cca3
            ? `
                        <span class="country-code">
                            ${escapeHtml(cca3)}
                        </span>
                    `
            : ""
        }

            <span class="list-type-badge ${listTypeClass}">
                ${listTypeText}
            </span>

        </div>

        <div class="country-content">

            <span class="country-continent">
                ${escapeHtml(
            translateContinent(
                continent
            )
        )}
            </span>

            <h3 class="country-name">
                ${escapeHtml(commonName)}
            </h3>

            <p class="country-official-name">
                ${escapeHtml(officialName)}
            </p>

            <div class="country-details">

                <div class="country-detail">

                    <span>
                        🏛️ עיר בירה
                    </span>

                    <strong>
                        ${escapeHtml(capital)}
                    </strong>

                </div>

                <div class="country-detail">

                    <span>
                        👥 אוכלוסייה
                    </span>

                    <strong>
                        ${formatNumber(population)}
                    </strong>

                </div>

                <div class="country-detail">

                    <span>
                        📐 שטח
                    </span>

                    <strong>
                        ${formatArea(area)}
                    </strong>

                </div>

            </div>

            <div class="country-actions">

                <button
                    type="button"
                    class="view-country-button"
                    data-action="view"
                    data-country-id="${countryId}"
                >
                    👁 פרטי המדינה
                </button>

                <button
                    type="button"
                    class="remove-country-button"
                    data-action="remove"
                    data-country-id="${countryId}"
                    aria-label="הסרת ${escapeHtml(commonName)} מהרשימה"
                    title="הסרה מהרשימה"
                >
                    🗑️
                </button>

            </div>

        </div>
    `;

    const image =
        card.querySelector(
            "img"
        );

    if (image) {
        image.addEventListener(
            "error",
            function () {
                image.replaceWith(
                    createMissingFlag()
                );
            }
        );
    }

    return card;
}


function createMissingFlag() {
    const placeholder =
        document.createElement(
            "div"
        );

    placeholder.className =
        "country-flag missing-flag";

    placeholder.textContent =
        "🌍";

    return placeholder;
}

function handleCountryAction(
    event
) {
    const button =
        event.target.closest(
            "button[data-action]"
        );

    if (!button) {
        return;
    }

    const action =
        button.dataset.action;

    const countryId =
        Number(
            button.dataset.countryId
        );

    if (
        !Number.isInteger(countryId) ||
        countryId <= 0
    ) {
        showMessage(
            "מזהה המדינה אינו תקין.",
            "error"
        );

        return;
    }

    if (action === "view") {
        window.location.href =
            `country-details.html?id=${countryId}`;

        return;
    }

    if (action === "remove") {
        const country =
            allSavedCountries.find(
                function (item) {
                    return (
                        Number(
                            item.countryId
                        ) === countryId
                    );
                }
            );

        if (!country) {
            showMessage(
                "המדינה לא נמצאה ברשימה.",
                "error"
            );

            return;
        }

        openRemoveModal(
            country
        );
    }
}

function openRemoveModal(
    country
) {
    pendingRemoveCountry =
        country;

    const countryName =
        country.commonName ||
        "המדינה";

    removeModalText.textContent =
        `האם להסיר את ${countryName} מהרשימות שלך?`;

    removeModal.hidden =
        false;

    document.body.style.overflow =
        "hidden";
}


function closeRemoveModal() {
    removeModal.hidden =
        true;

    pendingRemoveCountry =
        null;

    cancelRemoveButton.disabled =
        false;

    approveRemoveButton.disabled =
        false;

    approveRemoveButton.textContent =
        "הסר מהרשימה";

    document.body.style.overflow =
        "";
}


async function removeCountryFromList() {
    if (!pendingRemoveCountry) {
        return;
    }

    const countryId =
        Number(
            pendingRemoveCountry.countryId
        );

    cancelRemoveButton.disabled =
        true;

    approveRemoveButton.disabled =
        true;

    approveRemoveButton.textContent =
        "מסיר...";

    try {
        const response = await fetch(
            `${userCountryListsApiUrl}/${currentUser.userId}/${countryId}`,
            {
                method: "DELETE",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );

        const data =
            await readResponseBody(
                response
            );

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "הסרת המדינה נכשלה."
            );
        }

        closeRemoveModal();

        allSavedCountries =
            allSavedCountries.filter(
                function (country) {
                    return (
                        Number(
                            country.countryId
                        ) !== countryId
                    );
                }
            );

        updateCounts();
        applySelectedList();

        showMessage(
            "המדינה הוסרה מהרשימה בהצלחה.",
            "success"
        );
    } catch (error) {
        console.error(
            "Remove country error:",
            error
        );

        cancelRemoveButton.disabled =
            false;

        approveRemoveButton.disabled =
            false;

        approveRemoveButton.textContent =
            "הסר מהרשימה";

        showMessage(
            translateMessage(
                error.message
            ),
            "error"
        );
    }
}

function configureEmptyState() {
    if (selectedListType === "1") {
        emptyStateIcon.textContent =
            "🧳";

        emptyStateTitle.textContent =
            "עדיין לא סימנת מדינות שביקרת בהן";

        emptyStateText.textContent =
            "פתח מדינה וסמן שביקרת בה.";

        return;
    }

    if (selectedListType === "2") {
        emptyStateIcon.textContent =
            "✈️";

        emptyStateTitle.textContent =
            "רשימת היעדים שלך עדיין ריקה";

        emptyStateText.textContent =
            "פתח מדינה וסמן שתרצה לבקר בה.";

        return;
    }

    emptyStateIcon.textContent =
        "🗺️";

    emptyStateTitle.textContent =
        "עדיין לא שמרת מדינות";

    emptyStateText.textContent =
        "גלה מדינות והוסף אותן לרשימות האישיות שלך.";
}

function showLoading() {
    setRefreshLoading(
        true
    );

    loadingState.hidden =
        false;

    countriesGrid.hidden =
        true;

    emptyState.hidden =
        true;

    resultsCount.textContent =
        "טוען...";
}


function hideLoading() {
    loadingState.hidden =
        true;
}


function setRefreshLoading(
    isLoading
) {
    refreshListsButton.disabled =
        isLoading;

    refreshListsButton.innerHTML =
        isLoading
            ? "טוען..."
            : `
                <span aria-hidden="true">
                    ↻
                </span>

                רענון
            `;
}

function showMessage(
    message,
    type
) {
    if (messageTimer) {
        clearTimeout(
            messageTimer
        );
    }

    pageMessage.textContent =
        message;

    pageMessage.className =
        `page-message ${type}`;

    messageTimer = setTimeout(
        clearMessage,
        5000
    );
}


function clearMessage() {
    pageMessage.textContent = "";

    pageMessage.className =
        "page-message";
}

function getResultsText(count) {
    if (count === 1) {
        return "תוצאה אחת";
    }

    return `${count} תוצאות`;
}


function formatNumber(value) {
    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {
        return "לא ידוע";
    }

    return value.toLocaleString(
        "he-IL"
    );
}


function formatArea(value) {
    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {
        return "לא ידוע";
    }

    return `${value.toLocaleString(
        "he-IL",
        {
            maximumFractionDigits: 2
        }
    )} קמ״ר`;
}


function translateContinent(name) {
    const value =
        String(name || "")
            .trim()
            .toLowerCase();

    const translations = {
        africa:
            "אפריקה",

        asia:
            "אסיה",

        europe:
            "אירופה",

        "north america":
            "אמריקה הצפונית",

        "south america":
            "אמריקה הדרומית",

        oceania:
            "אוקיאניה",

        antarctica:
            "אנטארקטיקה"
    };

    return (
        translations[value] ||
        name ||
        "לא הוגדרה"
    );
}


function translateMessage(message) {
    const value =
        String(message || "");

    if (
        value.includes(
            "Failed to fetch"
        ) ||
        value.includes(
            "NetworkError"
        )
    ) {
        return "לא ניתן להתחבר לשרת. ודא שהשרת פועל.";
    }

    if (
        value.includes(
            "Country was not found in the user list"
        )
    ) {
        return "המדינה כבר אינה קיימת ברשימה.";
    }

    return (
        value ||
        "אירעה שגיאה לא צפויה."
    );
}


function getInitial(fullName) {
    const name =
        String(fullName || "")
            .trim();

    return name === ""
        ? "U"
        : name
            .charAt(0)
            .toUpperCase();
}


function closeMenus() {
    userDropdown.classList.remove(
        "open"
    );

    mainNavigation.classList.remove(
        "open"
    );

    userMenuButton.setAttribute(
        "aria-expanded",
        "false"
    );
}


function logout() {
    clearLoginData();

    window.location.replace(
        "login.html"
    );
}


function clearLoginData() {
    localStorage.removeItem(
        "currentUser"
    );

    localStorage.removeItem(
        "isLoggedIn"
    );
}


function getMessage(data) {
    if (
        typeof data === "string"
    ) {
        return data;
    }

    return data?.message || "";
}


async function readResponseBody(
    response
) {
    const responseText =
        await response.text();

    if (responseText === "") {
        return {};
    }

    try {
        return JSON.parse(
            responseText
        );
    } catch (error) {
        return {
            message:
                responseText
        };
    }
}


function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}