const currentUserString =localStorage.getItem("currentUser");

const isLoggedIn = localStorage.getItem("isLoggedIn");

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


const countriesApiUrl = "https://localhost:7296/api/Countries";

const preferencesApiUrl = "https://localhost:7296/api/Preferences";

let countries = [];
let continents = [];

let searchTimer = null;
let messageTimer = null;

let editingCountryId = null;
let pendingDeleteCountry = null;

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


const adminCountriesSection =
    document.getElementById(
        "adminCountriesSection"
    );

const addCountryButton =
    document.getElementById(
        "addCountryButton"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const continentFilter =
    document.getElementById(
        "continentFilter"
    );

const sortFilter =
    document.getElementById(
        "sortFilter"
    );

const refreshButton =
    document.getElementById(
        "refreshButton"
    );

const clearFiltersButton =
    document.getElementById(
        "clearFiltersButton"
    );

const countriesGrid =
    document.getElementById(
        "countriesGrid"
    );

const loadingState =
    document.getElementById(
        "loadingState"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );

const resultsCount =
    document.getElementById(
        "resultsCount"
    );

const totalCountries =
    document.getElementById(
        "totalCountries"
    );

const activeFiltersCount =
    document.getElementById(
        "activeFiltersCount"
    );

const pageMessage =
    document.getElementById(
        "pageMessage"
    );

const countryFormModal =
    document.getElementById(
        "countryFormModal"
    );

const countryForm =
    document.getElementById(
        "countryForm"
    );

const countryFormLabel =
    document.getElementById(
        "countryFormLabel"
    );

const countryFormTitle =
    document.getElementById(
        "countryFormTitle"
    );

const countryFormSubtitle =
    document.getElementById(
        "countryFormSubtitle"
    );

const closeCountryFormButton =
    document.getElementById(
        "closeCountryFormButton"
    );

const cancelCountryFormButton =
    document.getElementById(
        "cancelCountryFormButton"
    );

const saveCountryButton =
    document.getElementById(
        "saveCountryButton"
    );

const countryFormMessage =
    document.getElementById(
        "countryFormMessage"
    );

const countryCommonNameInput =
    document.getElementById(
        "countryCommonNameInput"
    );

const countryOfficialNameInput =
    document.getElementById(
        "countryOfficialNameInput"
    );

const countryCca2Input =
    document.getElementById(
        "countryCca2Input"
    );

const countryCca3Input =
    document.getElementById(
        "countryCca3Input"
    );

const countryCapitalInput =
    document.getElementById(
        "countryCapitalInput"
    );

const countryContinentInput =
    document.getElementById(
        "countryContinentInput"
    );

const countryRegionInput =
    document.getElementById(
        "countryRegionInput"
    );

const countrySubregionInput =
    document.getElementById(
        "countrySubregionInput"
    );

const countryPopulationInput =
    document.getElementById(
        "countryPopulationInput"
    );

const countryAreaInput =
    document.getElementById(
        "countryAreaInput"
    );

const countryFlagUrlInput =
    document.getElementById(
        "countryFlagUrlInput"
    );

const countryGoogleMapsInput =
    document.getElementById(
        "countryGoogleMapsInput"
    );

const countryLatitudeInput =
    document.getElementById(
        "countryLatitudeInput"
    );

const countryLongitudeInput =
    document.getElementById(
        "countryLongitudeInput"
    );

const countryIndependentInput =
    document.getElementById(
        "countryIndependentInput"
    );


const deleteCountryModal =
    document.getElementById(
        "deleteCountryModal"
    );

const deleteCountryText =
    document.getElementById(
        "deleteCountryText"
    );

const cancelDeleteCountryButton =
    document.getElementById(
        "cancelDeleteCountryButton"
    );

const approveDeleteCountryButton =
    document.getElementById(
        "approveDeleteCountryButton"
    );


initializePage();

async function initializePage() {
    showUserInformation();
    configureAdminDisplay();
    addEvents();

    await Promise.all([
        loadContinents(),
        loadCountries()
    ]);
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
    const isAdmin =
        isAdminUser();

    adminLink.hidden =
        !isAdmin;

    adminCountriesSection.hidden =
        !isAdmin;
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

    searchInput.addEventListener(
        "input",
        function () {
            clearTimeout(
                searchTimer
            );

            searchTimer = setTimeout(
                loadCountries,
                350
            );
        }
    );

    continentFilter.addEventListener(
        "change",
        loadCountries
    );

    sortFilter.addEventListener(
        "change",
        loadCountries
    );

    refreshButton.addEventListener(
        "click",
        async function () {
            await loadCountries(
                true
            );
        }
    );

    clearFiltersButton.addEventListener(
        "click",
        clearFilters
    );

    countriesGrid.addEventListener(
        "click",
        handleCountryCardAction
    );

    addCountryButton.addEventListener(
        "click",
        openCreateCountryModal
    );

    countryForm.addEventListener(
        "submit",
        saveCountry
    );

    closeCountryFormButton.addEventListener(
        "click",
        closeCountryFormModal
    );

    cancelCountryFormButton.addEventListener(
        "click",
        closeCountryFormModal
    );

    document
        .querySelector(
            "[data-close-country-form]"
        )
        .addEventListener(
            "click",
            closeCountryFormModal
        );

    cancelDeleteCountryButton.addEventListener(
        "click",
        closeDeleteCountryModal
    );

    approveDeleteCountryButton.addEventListener(
        "click",
        deleteCountry
    );

    document
        .querySelector(
            "[data-close-delete-modal]"
        )
        .addEventListener(
            "click",
            closeDeleteCountryModal
        );

    document.addEventListener(
        "keydown",
        function (event) {
            if (event.key !== "Escape") {
                return;
            }

            if (!countryFormModal.hidden) {
                closeCountryFormModal();
            }

            if (!deleteCountryModal.hidden) {
                closeDeleteCountryModal();
            }
        }
    );

    countryCca2Input.addEventListener(
        "input",
        function () {
            countryCca2Input.value =
                countryCca2Input.value
                    .toUpperCase()
                    .replace(
                        /[^A-Z]/g,
                        ""
                    )
                    .slice(
                        0,
                        2
                    );
        }
    );

    countryCca3Input.addEventListener(
        "input",
        function () {
            countryCca3Input.value =
                countryCca3Input.value
                    .toUpperCase()
                    .replace(
                        /[^A-Z]/g,
                        ""
                    )
                    .slice(
                        0,
                        3
                    );
        }
    );
}

async function loadContinents() {
    try {
        const response = await fetch(
            `${preferencesApiUrl}/continents`,
            {
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
                "טעינת היבשות נכשלה."
            );
        }

        continents =
            Array.isArray(data)
                ? data
                : [];

        fillContinents();
    } catch (error) {
        console.error(
            "Load continents error:",
            error
        );

        showPageMessage(
            translateMessage(
                error.message
            ),
            "error"
        );
    }
}

function fillContinents() {
    continentFilter.innerHTML = `
        <option value="">
            כל היבשות
        </option>
    `;

    countryContinentInput.innerHTML = `
        <option value="">
            בחר יבשת
        </option>
    `;

    continents.forEach(
        function (continent) {
            const continentId =
                continent.continentId;

            const continentName =
                continent.continentName;

            const filterOption =
                document.createElement(
                    "option"
                );

            filterOption.value =
                continentId;

            filterOption.textContent =
                translateContinent(
                    continentName
                );

            continentFilter.appendChild(
                filterOption
            );

            const formOption =
                document.createElement(
                    "option"
                );

            formOption.value =
                continentId;

            formOption.textContent =
                translateContinent(
                    continentName
                );

            countryContinentInput.appendChild(
                formOption
            );
        }
    );
}

async function loadCountries(
    showSuccessMessage = false
) {
    showLoading();
    clearPageMessage();

    const query =
        buildCountriesQuery();

    try {
        const response = await fetch(
            `${countriesApiUrl}?${query}`,
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
                "טעינת המדינות נכשלה."
            );
        }

        countries =
            Array.isArray(
                data.countries
            )
                ? data.countries
                : [];

        renderCountries();
        updateStatistics();

        if (showSuccessMessage) {
            showPageMessage(
                "רשימת המדינות עודכנה בהצלחה.",
                "success"
            );
        }
    } catch (error) {
        console.error(
            "Load countries error:",
            error
        );

        countries = [];

        renderCountries();
        updateStatistics();

        showPageMessage(
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
function buildCountriesQuery() {
    const parameters =
        new URLSearchParams();

    const searchText =
        searchInput.value.trim();

    const continentId =
        continentFilter.value;

    const sorting =
        getSortingValues();

    if (searchText !== "") {
        parameters.set(
            "searchText",
            searchText
        );
    }

    if (continentId !== "") {
        parameters.set(
            "continentId",
            continentId
        );
    }

    parameters.set(
        "sortBy",
        sorting.sortBy
    );

    parameters.set(
        "sortDirection",
        sorting.sortDirection
    );

    return parameters.toString();
}
function getSortingValues() {
    const selectedValue =
        sortFilter.value;

    const separatorIndex =
        selectedValue.lastIndexOf(
            "-"
        );

    return {
        sortBy:
            selectedValue.substring(
                0,
                separatorIndex
            ),

        sortDirection:
            selectedValue.substring(
                separatorIndex + 1
            )
    };
}

function renderCountries() {
    countriesGrid.innerHTML = "";

    resultsCount.textContent =
        getResultsText(
            countries.length
        );

    if (countries.length === 0) {
        countriesGrid.hidden = true;
        emptyState.hidden = false;

        return;
    }

    countriesGrid.hidden = false;
    emptyState.hidden = true;

    countries.forEach(
        function (country) {
            countriesGrid.appendChild(
                createCountryCard(
                    country
                )
            );
        }
    );
}
function createCountryCard(country) {
    const card =
        document.createElement(
            "article"
        );

    card.className =
        "country-card";

    const countryId =
        Number(
            getCountryValue(
                country,
                [
                    "countryId",
                    "id"
                ],
                0
            )
        );

    const commonName =
        getCountryValue(
            country,
            [
                "commonName",
                "name"
            ],
            "מדינה ללא שם"
        );

    const officialName =
        getCountryValue(
            country,
            [
                "officialName"
            ],
            commonName
        );

    const capital =
        getCountryValue(
            country,
            [
                "capital"
            ],
            "לא הוגדרה"
        );

    const continent =
        getCountryValue(
            country,
            [
                "continentName",
                "continent"
            ],
            "לא הוגדרה"
        );

    const population =
        Number(
            getCountryValue(
                country,
                [
                    "population"
                ],
                0
            )
        );

    const area =
        Number(
            getCountryValue(
                country,
                [
                    "area"
                ],
                0
            )
        );

    const flagUrl =
        getCountryValue(
            country,
            [
                "flagUrl",
                "flagPngUrl",
                "flag"
            ],
            ""
        );

    const cca3 =
        getCountryValue(
            country,
            [
                "cca3"
            ],
            ""
        );

    const adminActions =
        isAdminUser()
            ? `
                <div class="country-admin-actions">

                    <button
                        type="button"
                        class="country-admin-button edit-country-button"
                        data-action="edit"
                        data-country-id="${countryId}"
                    >
                        ✏️ עריכה
                    </button>

                    <button
                        type="button"
                        class="country-admin-button delete-country-button"
                        data-action="delete"
                        data-country-id="${countryId}"
                    >
                        🗑️ מחיקה
                    </button>

                </div>
            `
            : "";

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

            <button
                type="button"
                class="country-card-action"
                data-action="view"
                data-country-id="${countryId}"
                ${countryId ? "" : "disabled"}
            >
                צפייה בפרטי המדינה
            </button>

            ${adminActions}

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
function handleCountryCardAction(
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
        showPageMessage(
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

    if (!isAdminUser()) {
        showPageMessage(
            "הפעולה מותרת למנהל בלבד.",
            "error"
        );

        return;
    }

    const country =
        countries.find(
            function (item) {
                return (
                    Number(
                        getCountryValue(
                            item,
                            [
                                "countryId",
                                "id"
                            ],
                            0
                        )
                    ) === countryId
                );
            }
        );

    if (!country) {
        showPageMessage(
            "המדינה לא נמצאה ברשימה.",
            "error"
        );

        return;
    }

    if (action === "edit") {
        openEditCountryModal(
            country
        );

        return;
    }

    if (action === "delete") {
        openDeleteCountryModal(
            country
        );
    }
}

function openCreateCountryModal() {
    if (!isAdminUser()) {
        return;
    }

    editingCountryId = null;

    resetCountryForm();

    countryFormLabel.textContent =
        "יצירת מדינה חדשה";

    countryFormTitle.textContent =
        "הוספת מדינה";

    countryFormSubtitle.textContent =
        "מלא את פרטי המדינה החדשה.";

    saveCountryButton.textContent =
        "הוסף מדינה";

    openCountryFormModal();
}

function openEditCountryModal(
    country
) {
    if (!isAdminUser()) {
        return;
    }

    editingCountryId =
        Number(
            getCountryValue(
                country,
                [
                    "countryId",
                    "id"
                ],
                0
            )
        );

    fillCountryForm(
        country
    );

    countryFormLabel.textContent =
        "עדכון מדינה קיימת";

    countryFormTitle.textContent =
        "עריכת מדינה";

    countryFormSubtitle.textContent =
        "עדכן את הנתונים ושמור את השינויים.";

    saveCountryButton.textContent =
        "שמור שינויים";

    openCountryFormModal();
}

function fillCountryForm(country) {
    countryCommonNameInput.value =
        getCountryValue(
            country,
            [
                "commonName",
                "name"
            ],
            ""
        );

    countryOfficialNameInput.value =
        getCountryValue(
            country,
            [
                "officialName"
            ],
            ""
        );

    countryCca2Input.value =
        getCountryValue(
            country,
            [
                "cca2"
            ],
            ""
        );

    countryCca3Input.value =
        getCountryValue(
            country,
            [
                "cca3"
            ],
            ""
        );

    countryCapitalInput.value =
        getCountryValue(
            country,
            [
                "capital"
            ],
            ""
        );

    countryContinentInput.value =
        getCountryValue(
            country,
            [
                "continentId"
            ],
            ""
        );

    countryRegionInput.value =
        getCountryValue(
            country,
            [
                "region"
            ],
            ""
        );

    countrySubregionInput.value =
        getCountryValue(
            country,
            [
                "subregion"
            ],
            ""
        );

    countryPopulationInput.value =
        getCountryValue(
            country,
            [
                "population"
            ],
            0
        );

    countryAreaInput.value =
        getCountryValue(
            country,
            [
                "area"
            ],
            0
        );

    countryFlagUrlInput.value =
        getCountryValue(
            country,
            [
                "flagUrl",
                "flagPngUrl",
                "flag"
            ],
            ""
        );

    countryGoogleMapsInput.value =
        getCountryValue(
            country,
            [
                "googleMapsUrl",
                "mapsUrl"
            ],
            ""
        );

    countryLatitudeInput.value =
        getCountryValue(
            country,
            [
                "latitude",
                "lat"
            ],
            ""
        );

    countryLongitudeInput.value =
        getCountryValue(
            country,
            [
                "longitude",
                "lng"
            ],
            ""
        );

    const isIndependent =
        getCountryValue(
            country,
            [
                "isIndependent",
                "independent"
            ],
            null
        );

    if (isIndependent === true) {
        countryIndependentInput.value =
            "true";
    } else if (
        isIndependent === false
    ) {
        countryIndependentInput.value =
            "false";
    } else {
        countryIndependentInput.value =
            "";
    }

    clearModalMessage();
}

async function saveCountry(event) {
    event.preventDefault();

    if (!isAdminUser()) {
        showModalMessage(
            "הפעולה מותרת למנהל בלבד.",
            "error"
        );

        return;
    }

    clearModalMessage();

    const request =
        getCountryRequest();

    const validationMessage =
        validateCountryRequest(
            request
        );

    if (validationMessage) {
        showModalMessage(
            validationMessage,
            "error"
        );

        return;
    }

    const isEditing =
        Number.isInteger(
            editingCountryId
        ) &&
        editingCountryId > 0;

    setCountryFormLoading(
        true
    );

    try {
        const response = await fetch(
            isEditing
                ? `${countriesApiUrl}/${editingCountryId}`
                : countriesApiUrl,
            {
                method:
                    isEditing
                        ? "PUT"
                        : "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    request
                )
            }
        );

        const data =
            await readResponseBody(
                response
            );

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                (
                    isEditing
                        ? "עדכון המדינה נכשל."
                        : "הוספת המדינה נכשלה."
                )
            );
        }

        closeCountryFormModal();

        await loadCountries();

        showPageMessage(
            isEditing
                ? "המדינה עודכנה בהצלחה."
                : "המדינה נוספה בהצלחה.",
            "success"
        );
    } catch (error) {
        console.error(
            "Save country error:",
            error
        );

        showModalMessage(
            translateMessage(
                error.message
            ),
            "error"
        );
    } finally {
        setCountryFormLoading(
            false
        );
    }
}


function getCountryRequest() {
    return {
        cca2:
            getNullableString(
                countryCca2Input.value
            ),

        cca3:
            countryCca3Input.value
                .trim()
                .toUpperCase(),

        commonName:
            countryCommonNameInput.value
                .trim(),

        officialName:
            getNullableString(
                countryOfficialNameInput.value
            ),

        capital:
            getNullableString(
                countryCapitalInput.value
            ),

        continentId:
            getNullableNumber(
                countryContinentInput.value
            ),

        region:
            getNullableString(
                countryRegionInput.value
            ),

        subregion:
            getNullableString(
                countrySubregionInput.value
            ),

        population:
            Number(
                countryPopulationInput.value
            ),

        area:
            Number(
                countryAreaInput.value
            ),

        flagUrl:
            getNullableString(
                countryFlagUrlInput.value
            ),

        googleMapsUrl:
            getNullableString(
                countryGoogleMapsInput.value
            ),

        latitude:
            getNullableNumber(
                countryLatitudeInput.value
            ),

        longitude:
            getNullableNumber(
                countryLongitudeInput.value
            ),

        isIndependent:
            getNullableBoolean(
                countryIndependentInput.value
            )
    };
}
function validateCountryRequest(
    request
) {
    if (
        request.commonName === ""
    ) {
        return "יש להזין את שם המדינה.";
    }

    if (
        request.cca3 === ""
    ) {
        return "יש להזין קוד CCA3.";
    }

    if (
        request.cca3.length !== 3
    ) {
        return "קוד CCA3 חייב להכיל בדיוק 3 אותיות באנגלית.";
    }

    if (
        request.cca2 !== null &&
        request.cca2.length !== 2
    ) {
        return "קוד CCA2 חייב להכיל בדיוק 2 אותיות באנגלית.";
    }

    if (
        !Number.isFinite(
            request.population
        ) ||
        request.population < 0
    ) {
        return "האוכלוסייה חייבת להיות מספר שאינו שלילי.";
    }

    if (
        !Number.isInteger(
            request.population
        )
    ) {
        return "האוכלוסייה חייבת להיות מספר שלם.";
    }

    if (
        !Number.isFinite(
            request.area
        ) ||
        request.area < 0
    ) {
        return "השטח חייב להיות מספר שאינו שלילי.";
    }

    if (
        request.latitude !== null &&
        (
            request.latitude < -90 ||
            request.latitude > 90
        )
    ) {
        return "קו הרוחב חייב להיות בין ‎-90 ל־90.";
    }

    if (
        request.longitude !== null &&
        (
            request.longitude < -180 ||
            request.longitude > 180
        )
    ) {
        return "קו האורך חייב להיות בין ‎-180 ל־180.";
    }

    return "";
}

function openDeleteCountryModal(
    country
) {
    if (!isAdminUser()) {
        return;
    }

    pendingDeleteCountry =
        country;

    const countryName =
        getCountryValue(
            country,
            [
                "commonName",
                "name"
            ],
            "המדינה"
        );

    deleteCountryText.textContent =
        `האם למחוק לצמיתות את ${countryName}?`;

    deleteCountryModal.hidden =
        false;

    document.body.style.overflow =
        "hidden";
}


function closeDeleteCountryModal() {
    deleteCountryModal.hidden =
        true;

    pendingDeleteCountry =
        null;

    approveDeleteCountryButton.disabled =
        false;

    cancelDeleteCountryButton.disabled =
        false;

    approveDeleteCountryButton.textContent =
        "מחק מדינה";

    document.body.style.overflow =
        "";
}


async function deleteCountry() {
    if (
        !isAdminUser() ||
        !pendingDeleteCountry
    ) {
        return;
    }

    const countryId =
        Number(
            getCountryValue(
                pendingDeleteCountry,
                [
                    "countryId",
                    "id"
                ],
                0
            )
        );

    if (
        !Number.isInteger(countryId) ||
        countryId <= 0
    ) {
        closeDeleteCountryModal();

        showPageMessage(
            "מזהה המדינה אינו תקין.",
            "error"
        );

        return;
    }

    approveDeleteCountryButton.disabled =
        true;

    cancelDeleteCountryButton.disabled =
        true;

    approveDeleteCountryButton.textContent =
        "מוחק...";

    try {
        const response = await fetch(
            `${countriesApiUrl}/${countryId}`,
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
                "מחיקת המדינה נכשלה."
            );
        }

        closeDeleteCountryModal();

        await loadCountries();

        showPageMessage(
            "המדינה נמחקה בהצלחה.",
            "success"
        );
    } catch (error) {
        console.error(
            "Delete country error:",
            error
        );

        approveDeleteCountryButton.disabled =
            false;

        cancelDeleteCountryButton.disabled =
            false;

        approveDeleteCountryButton.textContent =
            "מחק מדינה";

        showPageMessage(
            translateMessage(
                error.message
            ),
            "error"
        );

        closeDeleteCountryModal();
    }
}

function openCountryFormModal() {
    countryFormModal.hidden =
        false;

    document.body.style.overflow =
        "hidden";

    setTimeout(
        function () {
            countryCommonNameInput.focus();
        },
        50
    );
}


function closeCountryFormModal() {
    countryFormModal.hidden =
        true;

    editingCountryId =
        null;

    resetCountryForm();

    document.body.style.overflow =
        "";
}


function resetCountryForm() {
    countryForm.reset();

    countryPopulationInput.value =
        "0";

    countryAreaInput.value =
        "0";

    countryIndependentInput.value =
        "";

    countryContinentInput.value =
        "";

    clearModalMessage();

    setCountryFormLoading(
        false
    );
}


function setCountryFormLoading(
    isLoading
) {
    saveCountryButton.disabled =
        isLoading;

    cancelCountryFormButton.disabled =
        isLoading;

    closeCountryFormButton.disabled =
        isLoading;

    if (isLoading) {
        saveCountryButton.textContent =
            editingCountryId
                ? "שומר שינויים..."
                : "מוסיף מדינה...";

        return;
    }

    saveCountryButton.textContent =
        editingCountryId
            ? "שמור שינויים"
            : "הוסף מדינה";
}
function clearFilters() {
    searchInput.value = "";

    continentFilter.value = "";

    sortFilter.value =
        "name-asc";

    loadCountries();
}


function updateStatistics() {
    totalCountries.textContent =
        countries.length.toString();

    let activeFilters = 0;

    if (
        searchInput.value.trim() !== ""
    ) {
        activeFilters++;
    }

    if (
        continentFilter.value !== ""
    ) {
        activeFilters++;
    }

    if (
        sortFilter.value !== "name-asc"
    ) {
        activeFilters++;
    }

    activeFiltersCount.textContent =
        activeFilters.toString();
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
    refreshButton.disabled =
        isLoading;

    refreshButton.innerHTML =
        isLoading
            ? "טוען..."
            : `
                <span aria-hidden="true">
                    ↻
                </span>

                רענון
            `;
}

function showPageMessage(
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
        clearPageMessage,
        5000
    );
}


function clearPageMessage() {
    pageMessage.textContent = "";

    pageMessage.className =
        "page-message";
}


function showModalMessage(
    message,
    type
) {
    countryFormMessage.textContent =
        message;

    countryFormMessage.className =
        `modal-message ${type}`;
}


function clearModalMessage() {
    countryFormMessage.textContent =
        "";

    countryFormMessage.className =
        "modal-message";
}

function getCountryValue(
    object,
    possibleNames,
    defaultValue
) {
    if (!object) {
        return defaultValue;
    }

    for (
        let index = 0;
        index < possibleNames.length;
        index++
    ) {
        const propertyName =
            possibleNames[index];

        const value =
            object[propertyName];

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            return value;
        }
    }

    return defaultValue;
}


function getNullableString(value) {
    const text =
        String(value || "")
            .trim();

    return text === ""
        ? null
        : text;
}

function getNullableNumber(value) {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return null;
    }

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}

function getNullableBoolean(value) {
    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    return null;
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


function getResultsText(count) {
    if (count === 1) {
        return "תוצאה אחת";
    }

    return `${count} תוצאות`;
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
            "Country was not found"
        )
    ) {
        return "המדינה לא נמצאה.";
    }

    if (
        value.toLowerCase().includes(
            "duplicate"
        ) ||
        value.toLowerCase().includes(
            "unique"
        )
    ) {
        return "כבר קיימת מדינה עם הקוד או השם שהוזנו.";
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