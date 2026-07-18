const currentUserString =
    localStorage.getItem(
        "currentUser"
    );

const isLoggedIn =
    localStorage.getItem(
        "isLoggedIn"
    );

if (
    !currentUserString ||
    isLoggedIn !== "true"
) {
    window.location.replace(
        "login.html"
    );
}

let currentUser = null;

try {
    currentUser =
        JSON.parse(
            currentUserString
        );
} catch (error) {
    clearLoginData();

    window.location.replace(
        "login.html"
    );
}

const countriesApiUrl =
    "https://localhost:7296/api/Countries";

const userCountryListsApiUrl =
    "https://localhost:7296/api/UserCountryLists";

const sharesApiUrl =
    "https://localhost:7296/api/Shares";

const urlParameters =
    new URLSearchParams(
        window.location.search
    );

const countryId =
    Number(
        urlParameters.get("id") ??
        urlParameters.get("countryId")
    );

let currentCountry = null;

let currentListType = null;

let countryShares = [];

let messageTimer = null;

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

const pageMessage =
    document.getElementById(
        "pageMessage"
    );

const loadingState =
    document.getElementById(
        "loadingState"
    );

const errorState =
    document.getElementById(
        "errorState"
    );

const errorStateText =
    document.getElementById(
        "errorStateText"
    );

const countryContent =
    document.getElementById(
        "countryContent"
    );

const countryCode =
    document.getElementById(
        "countryCode"
    );

const independenceBadge =
    document.getElementById(
        "independenceBadge"
    );

const countryContinent =
    document.getElementById(
        "countryContinent"
    );

const countryName =
    document.getElementById(
        "countryName"
    );

const countryOfficialName =
    document.getElementById(
        "countryOfficialName"
    );

const countryFlag =
    document.getElementById(
        "countryFlag"
    );

const missingFlag =
    document.getElementById(
        "missingFlag"
    );

const visitedButton =
    document.getElementById(
        "visitedButton"
    );

const wishButton =
    document.getElementById(
        "wishButton"
    );

const visitedButtonText =
    document.getElementById(
        "visitedButtonText"
    );

const wishButtonText =
    document.getElementById(
        "wishButtonText"
    );

const visitedButtonIcon =
    document.getElementById(
        "visitedButtonIcon"
    );

const wishButtonIcon =
    document.getElementById(
        "wishButtonIcon"
    );

const countryCapital =
    document.getElementById(
        "countryCapital"
    );

const countryPopulation =
    document.getElementById(
        "countryPopulation"
    );

const countryArea =
    document.getElementById(
        "countryArea"
    );

const countryRegion =
    document.getElementById(
        "countryRegion"
    );

const countryCca2 =
    document.getElementById(
        "countryCca2"
    );

const countryCca3 =
    document.getElementById(
        "countryCca3"
    );

const countryContinentDetail =
    document.getElementById(
        "countryContinentDetail"
    );

const countryRegionDetail =
    document.getElementById(
        "countryRegionDetail"
    );

const countrySubregion =
    document.getElementById(
        "countrySubregion"
    );

const countryIndependent =
    document.getElementById(
        "countryIndependent"
    );

const countryLatitude =
    document.getElementById(
        "countryLatitude"
    );

const countryLongitude =
    document.getElementById(
        "countryLongitude"
    );

const mapCoordinatesText =
    document.getElementById(
        "mapCoordinatesText"
    );

const googleMapsLink =
    document.getElementById(
        "googleMapsLink"
    );

const languagesList =
    document.getElementById(
        "languagesList"
    );

const languagesEmptyState =
    document.getElementById(
        "languagesEmptyState"
    );

const currenciesList =
    document.getElementById(
        "currenciesList"
    );

const currenciesEmptyState =
    document.getElementById(
        "currenciesEmptyState"
    );

const countrySharesCount =
    document.getElementById(
        "countrySharesCount"
    );

const allCountrySharesLink =
    document.getElementById(
        "allCountrySharesLink"
    );

const createCountryShareLink =
    document.getElementById(
        "createCountryShareLink"
    );

const countrySharesLoading =
    document.getElementById(
        "countrySharesLoading"
    );

const countrySharesGrid =
    document.getElementById(
        "countrySharesGrid"
    );

const countrySharesEmpty =
    document.getElementById(
        "countrySharesEmpty"
    );

initializePage();

async function initializePage() {
    showUserInformation();

    configureAdminDisplay();

    addEvents();

    if (
        !Number.isInteger(countryId) ||
        countryId <= 0
    ) {
        showErrorState(
            "לא התקבל מזהה מדינה תקין."
        );

        return;
    }

    const countryLoaded =
        await loadCountry();

    if (!countryLoaded) {
        return;
    }

    await Promise.allSettled([
        loadCountryListStatus(),
        loadCountryShares()
    ]);
}

function showUserInformation() {
    const fullName =
        currentUser?.fullName ??
        currentUser?.FullName ??
        "משתמש";

    headerUserName.textContent =
        fullName;

    headerUserRole.textContent =
        isAdminUser()
            ? "Admin"
            : "User";

    userAvatar.textContent =
        getInitial(
            fullName
        );
}


function isAdminUser() {
    const roleId =
        Number(
            currentUser?.roleId ??
            currentUser?.RoleId
        );

    const roleName =
        String(
            currentUser?.roleName ??
            currentUser?.RoleName ??
            ""
        )
            .trim()
            .toLowerCase();

    return (
        roleId === 2 ||
        roleName === "admin"
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

    countryFlag.addEventListener(
        "error",
        showMissingFlag
    );

    visitedButton.addEventListener(
        "click",
        function () {
            handleListButtonClick(1);
        }
    );

    wishButton.addEventListener(
        "click",
        function () {
            handleListButtonClick(2);
        }
    );

    countrySharesGrid.addEventListener(
        "click",
        handleCountryShareAction
    );
}

async function loadCountry() {
    showLoadingState();

    try {
        const response = await fetch(
            `${countriesApiUrl}/${countryId}`,
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
                "Country was not found."
            );
        }

        currentCountry =
            data.country ??
            data.Country ??
            data;

        if (
            !currentCountry ||
            Array.isArray(currentCountry)
        ) {
            throw new Error(
                "Country was not found."
            );
        }

        renderCountry();

        showCountryContent();

        return true;
    } catch (error) {
        console.error(
            "Load country error:",
            error
        );

        showErrorState(
            translateMessage(
                error.message
            )
        );

        return false;
    }
}

async function loadCountryListStatus() {
    setListButtonsLoading(true);

    const currentUserId =
        getCurrentUserId();

    try {
        const response = await fetch(
            `${userCountryListsApiUrl}/${currentUserId}/countries/${countryId}`,
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
                "טעינת מצב הרשימה נכשלה."
            );
        }

        const isSaved =
            data.isSaved ??
            data.IsSaved ??
            false;

        const listType =
            data.listType ??
            data.ListType;

        currentListType =
            isSaved === true
                ? Number(listType)
                : null;
    } catch (error) {
        console.error(
            "Load list status error:",
            error
        );

        currentListType =
            null;
    } finally {
        setListButtonsLoading(false);
    }
}

async function handleListButtonClick(
    requestedListType
) {
    setListButtonsLoading(true);

    try {
        if (
            currentListType ===
            requestedListType
        ) {
            await removeCountryFromLists();
        } else {
            await saveCountryToList(
                requestedListType
            );
        }
    } catch (error) {
        showMessage(
            translateListMessage(
                error.message
            ),
            "error"
        );
    } finally {
        setListButtonsLoading(false);
    }
}


async function saveCountryToList(
    requestedListType
) {
    const response = await fetch(
        userCountryListsApiUrl,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                userId:
                    getCurrentUserId(),

                countryId:
                    countryId,

                listType:
                    requestedListType
            })
        }
    );

    const data =
        await readResponseBody(
            response
        );

    if (!response.ok) {
        throw new Error(
            getMessage(data) ||
            "שמירת המדינה ברשימה נכשלה."
        );
    }

    currentListType =
        requestedListType;

    updateListButtons();

    showMessage(
        requestedListType === 1
            ? "המדינה נוספה לרשימת המדינות שביקרת בהן."
            : "המדינה נוספה לרשימת המדינות שברצונך לבקר בהן.",
        "success"
    );
}


async function removeCountryFromLists() {
    const response = await fetch(
        `${userCountryListsApiUrl}/${getCurrentUserId()}/${countryId}`,
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
            "הסרת המדינה מהרשימה נכשלה."
        );
    }

    currentListType =
        null;

    updateListButtons();

    showMessage(
        "המדינה הוסרה מהרשימות שלך.",
        "success"
    );
}


function updateListButtons() {
    visitedButton.classList.remove(
        "selected"
    );

    wishButton.classList.remove(
        "selected"
    );

    visitedButtonText.textContent =
        "ביקרתי במדינה";

    wishButtonText.textContent =
        "רוצה לבקר";

    visitedButtonIcon.textContent =
        "✓";

    wishButtonIcon.textContent =
        "♡";

    if (currentListType === 1) {
        visitedButton.classList.add(
            "selected"
        );

        visitedButtonText.textContent =
            "סומן שביקרתי";

        return;
    }

    if (currentListType === 2) {
        wishButton.classList.add(
            "selected"
        );

        wishButtonText.textContent =
            "נמצא ברשימת הרצונות";

        wishButtonIcon.textContent =
            "♥";
    }
}


function setListButtonsLoading(
    isLoading
) {
    visitedButton.disabled =
        isLoading;

    wishButton.disabled =
        isLoading;

    if (isLoading) {
        visitedButtonText.textContent =
            "טוען...";

        wishButtonText.textContent =
            "טוען...";

        return;
    }

    updateListButtons();
}

function renderCountry() {
    const commonName =
        getValue(
            currentCountry,
            [
                "commonName",
                "CommonName",
                "name",
                "Name"
            ],
            "מדינה ללא שם"
        );

    const officialName =
        getValue(
            currentCountry,
            [
                "officialName",
                "OfficialName"
            ],
            commonName
        );

    const cca2 =
        getValue(
            currentCountry,
            [
                "cca2",
                "Cca2"
            ],
            "לא הוגדר"
        );

    const cca3 =
        getValue(
            currentCountry,
            [
                "cca3",
                "Cca3"
            ],
            "לא הוגדר"
        );

    const capital =
        getValue(
            currentCountry,
            [
                "capital",
                "Capital"
            ],
            "לא הוגדרה"
        );

    const continent =
        getValue(
            currentCountry,
            [
                "continent",
                "Continent",
                "continentName",
                "ContinentName"
            ],
            "לא הוגדרה"
        );

    const region =
        getValue(
            currentCountry,
            [
                "region",
                "Region"
            ],
            "לא הוגדר"
        );

    const subregion =
        getValue(
            currentCountry,
            [
                "subregion",
                "Subregion"
            ],
            "לא הוגדר"
        );

    const population =
        Number(
            getValue(
                currentCountry,
                [
                    "population",
                    "Population"
                ],
                0
            )
        );

    const area =
        Number(
            getValue(
                currentCountry,
                [
                    "area",
                    "Area"
                ],
                0
            )
        );

    const flagUrl =
        getValue(
            currentCountry,
            [
                "flagUrl",
                "FlagUrl",
                "flagPngUrl",
                "FlagPngUrl"
            ],
            ""
        );

    const latitude =
        Number(
            getValue(
                currentCountry,
                [
                    "latitude",
                    "Latitude",
                    "lat",
                    "Lat"
                ],
                NaN
            )
        );

    const longitude =
        Number(
            getValue(
                currentCountry,
                [
                    "longitude",
                    "Longitude",
                    "lng",
                    "Lng"
                ],
                NaN
            )
        );

    const googleMapsUrl =
        getValue(
            currentCountry,
            [
                "googleMapsUrl",
                "GoogleMapsUrl",
                "mapsUrl",
                "MapsUrl"
            ],
            ""
        );

    const isIndependent =
        getValue(
            currentCountry,
            [
                "isIndependent",
                "IsIndependent",
                "independent",
                "Independent"
            ],
            null
        );

    const languages =
        getArrayValue(
            currentCountry,
            [
                "languages",
                "Languages",
                "countryLanguages",
                "CountryLanguages"
            ]
        );

    const currencies =
        getArrayValue(
            currentCountry,
            [
                "currencies",
                "Currencies",
                "countryCurrencies",
                "CountryCurrencies"
            ]
        );

    document.title =
        `${commonName} | World Countries`;

    countryName.textContent =
        commonName;

    countryOfficialName.textContent =
        officialName;

    countryCode.textContent =
        cca3;

    countryContinent.textContent =
        translateContinent(
            continent
        );

    countryCapital.textContent =
        capital;

    countryPopulation.textContent =
        formatNumber(
            population
        );

    countryArea.textContent =
        formatArea(
            area
        );

    countryRegion.textContent =
        translateRegion(
            region
        );

    countryCca2.textContent =
        cca2;

    countryCca3.textContent =
        cca3;

    countryContinentDetail.textContent =
        translateContinent(
            continent
        );

    countryRegionDetail.textContent =
        translateRegion(
            region
        );

    countrySubregion.textContent =
        translateSubregion(
            subregion
        );

    configureIndependence(
        isIndependent
    );

    configureFlag(
        flagUrl,
        commonName
    );

    configureLocation(
        latitude,
        longitude,
        googleMapsUrl
    );

    renderLanguages(
        languages
    );

    renderCurrencies(
        currencies
    );
}

function configureIndependence(
    value
) {
    const isIndependent =
        value === true ||
        value === 1 ||
        String(value)
            .toLowerCase() === "true";

    if (isIndependent) {
        independenceBadge.textContent =
            "מדינה עצמאית";

        countryIndependent.textContent =
            "כן";

        return;
    }

    independenceBadge.textContent =
        "טריטוריה / לא עצמאית";

    independenceBadge.classList.add(
        "not-independent"
    );

    countryIndependent.textContent =
        "לא";
}


function configureFlag(
    flagUrl,
    commonName
) {
    if (!flagUrl) {
        showMissingFlag();

        return;
    }

    countryFlag.hidden =
        false;

    missingFlag.hidden =
        true;

    countryFlag.src =
        flagUrl;

    countryFlag.alt =
        `דגל ${commonName}`;
}


function showMissingFlag() {
    countryFlag.hidden =
        true;

    missingFlag.hidden =
        false;
}


function configureLocation(
    latitude,
    longitude,
    googleMapsUrl
) {
    const hasLatitude =
        Number.isFinite(latitude);

    const hasLongitude =
        Number.isFinite(longitude);

    countryLatitude.textContent =
        hasLatitude
            ? formatCoordinate(latitude)
            : "לא ידוע";

    countryLongitude.textContent =
        hasLongitude
            ? formatCoordinate(longitude)
            : "לא ידוע";

    if (
        hasLatitude &&
        hasLongitude
    ) {
        mapCoordinatesText.textContent =
            `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
    } else {
        mapCoordinatesText.textContent =
            "לא נמצאו קואורדינטות למדינה זו.";
    }

    const mapUrl =
        googleMapsUrl ||
        (
            hasLatitude &&
                hasLongitude
                ? `https://www.google.com/maps?q=${latitude},${longitude}`
                : ""
        );

    if (mapUrl) {
        googleMapsLink.href =
            mapUrl;

        googleMapsLink.classList.remove(
            "disabled"
        );

        return;
    }

    googleMapsLink.href =
        "#";

    googleMapsLink.classList.add(
        "disabled"
    );
}
function renderLanguages(
    languages
) {
    languagesList.innerHTML =
        "";

    languagesEmptyState.hidden =
        languages.length > 0;

    languages.forEach(
        function (language) {
            const name =
                getValue(
                    language,
                    [
                        "languageName",
                        "LanguageName",
                        "name",
                        "Name"
                    ],
                    "שפה ללא שם"
                );

            const code =
                getValue(
                    language,
                    [
                        "languageCode",
                        "LanguageCode",
                        "code",
                        "Code"
                    ],
                    ""
                );

            const item =
                document.createElement(
                    "article"
                );

            item.className =
                "item-card";

            item.innerHTML = `
                <div class="item-main">

                    <span class="item-symbol">
                        🗣️
                    </span>

                    <div>

                        <strong>
                            ${escapeHtml(name)}
                        </strong>

                        <small>
                            שפה במדינה
                        </small>

                    </div>

                </div>

                ${code
                    ? `
                            <span class="item-code">
                                ${escapeHtml(code)}
                            </span>
                        `
                    : ""
                }
            `;

            languagesList.appendChild(
                item
            );
        }
    );
}


function renderCurrencies(
    currencies
) {
    currenciesList.innerHTML =
        "";

    currenciesEmptyState.hidden =
        currencies.length > 0;

    currencies.forEach(
        function (currency) {
            const name =
                getValue(
                    currency,
                    [
                        "currencyName",
                        "CurrencyName",
                        "name",
                        "Name"
                    ],
                    "מטבע ללא שם"
                );

            const code =
                getValue(
                    currency,
                    [
                        "currencyCode",
                        "CurrencyCode",
                        "code",
                        "Code"
                    ],
                    ""
                );

            const symbol =
                getValue(
                    currency,
                    [
                        "currencySymbol",
                        "CurrencySymbol",
                        "symbol",
                        "Symbol"
                    ],
                    "¤"
                );

            const item =
                document.createElement(
                    "article"
                );

            item.className =
                "item-card";

            item.innerHTML = `
                <div class="item-main">

                    <span class="item-symbol">
                        ${escapeHtml(symbol)}
                    </span>

                    <div>

                        <strong>
                            ${escapeHtml(name)}
                        </strong>

                        <small>
                            מטבע רשמי
                        </small>

                    </div>

                </div>

                ${code
                    ? `
                            <span class="item-code">
                                ${escapeHtml(code)}
                            </span>
                        `
                    : ""
                }
            `;

            currenciesList.appendChild(
                item
            );
        }
    );
}

async function loadCountryShares() {
    showCountrySharesLoading();

    allCountrySharesLink.href =
        `shares.html?countryId=${countryId}`;

    createCountryShareLink.href =
        `shares.html?countryId=${countryId}&mode=create`;

    try {
        const requestUrl =
            sharesApiUrl;

        console.log(
            "Shares request URL:",
            requestUrl
        );

        console.log(
            "Current country ID:",
            countryId
        );

        const response = await fetch(
            requestUrl,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                },

                cache:
                    "no-store"
            }
        );

        const data =
            await readResponseBody(
                response
            );

        console.log(
            "Shares API status:",
            response.status
        );

        console.log(
            "Shares API response:",
            data
        );

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(
                    data,
                    response.status
                )
            );
        }

        const allShares =
            extractSharesArray(
                data
            );

        countryShares =
            allShares.filter(
                function (share) {
                    const shareCountryId =
                        Number(
                            share.countryId ??
                            share.CountryId
                        );

                    return (
                        Number.isInteger(
                            shareCountryId
                        ) &&
                        shareCountryId ===
                        Number(countryId)
                    );
                }
            );

        countryShares.sort(
            function (
                firstShare,
                secondShare
            ) {
                return (
                    getShareTime(
                        secondShare
                    ) -
                    getShareTime(
                        firstShare
                    )
                );
            }
        );

        console.log(
            "All shares:",
            allShares
        );

        console.log(
            "Country shares:",
            countryShares
        );

        renderCountryShares();
    } catch (error) {
        console.error(
            "Load country shares error:",
            error
        );

        countryShares = [];

        renderCountryShares();

        showMessage(
            translateShareMessage(
                error.message
            ),
            "error"
        );
    }
}

function extractSharesArray(
    data
) {
    if (Array.isArray(data)) {
        return data;
    }

    const possibleArrays = [
        data?.shares,
        data?.Shares,
        data?.items,
        data?.Items,
        data?.data,
        data?.Data,
        data?.result,
        data?.Result
    ];

    for (
        let index = 0;
        index < possibleArrays.length;
        index++
    ) {
        if (
            Array.isArray(
                possibleArrays[index]
            )
        ) {
            return possibleArrays[index];
        }
    }

    return [];
}

function renderCountryShares() {
    countrySharesGrid.innerHTML =
        "";

    countrySharesCount.textContent =
        getSharesCountText(
            countryShares.length
        );

    countrySharesLoading.hidden =
        true;

    if (
        countryShares.length === 0
    ) {
        countrySharesGrid.hidden =
            true;

        countrySharesEmpty.hidden =
            false;

        return;
    }

    countrySharesEmpty.hidden =
        true;

    countrySharesGrid.hidden =
        false;

    countryShares.forEach(
        function (share) {
            countrySharesGrid.appendChild(
                createCountryShareCard(
                    share
                )
            );
        }
    );
}


function createCountryShareCard(
    share
) {
    const card =
        document.createElement(
            "article"
        );

    card.className =
        "country-share-card";

    const shareId =
        Number(
            share.shareId ??
            share.ShareId
        );

    const userId =
        Number(
            share.userId ??
            share.UserId
        );

    const fullName =
        share.fullName ??
        share.FullName ??
        share.userName ??
        share.UserName ??
        "משתמש";

    const shareType =
        share.shareType ??
        share.ShareType;

    const content =
        share.content ??
        share.Content ??
        "";

    const rating =
        Number(
            share.rating ??
            share.Rating ??
            0
        );

    const createdAt =
        share.createdAt ??
        share.CreatedAt;

    const updatedAt =
        share.updatedAt ??
        share.UpdatedAt;

    const canManage =
        canManageCountryShare({
            userId: userId
        });

    card.innerHTML = `
        <div class="country-share-top">

            <span class="country-share-type">
                ${escapeHtml(
        getShareTypeText(
            shareType
        )
    )}
            </span>

            <span class="country-share-rating">
                ${escapeHtml(
        getShareStars(
            rating
        )
    )}
            </span>

        </div>

        <p class="country-share-content">
            ${escapeHtml(content)}
        </p>

        <div class="country-share-footer">

            <span class="country-share-avatar">
                ${escapeHtml(
        getInitial(
            fullName
        )
    )}
            </span>

            <div class="country-share-user">

                <strong>
                    ${escapeHtml(fullName)}
                </strong>

                <small>
                    ${escapeHtml(
        formatShareDate(
            createdAt
        )
    )}

                    ${updatedAt
            ? " · נערך"
            : ""
        }
                </small>

            </div>

        </div>

        ${canManage
            ? `
                    <div class="country-share-actions">

                        <button
                            type="button"
                            class="country-share-action country-share-edit"
                            data-share-action="edit"
                            data-share-id="${shareId}"
                        >
                            עריכת השיתוף
                        </button>

                        <button
                            type="button"
                            class="country-share-action country-share-delete"
                            data-share-action="delete"
                            data-share-id="${shareId}"
                        >
                            מחיקת השיתוף
                        </button>

                    </div>
                `
            : ""
        }
    `;

    return card;
}

function canManageCountryShare(
    share
) {
    if (isAdminUser()) {
        return true;
    }

    return (
        canCurrentUserShare() &&
        Number(share.userId) ===
        getCurrentUserId()
    );
}


function canCurrentUserShare() {
    const value =
        currentUser?.canShare ??
        currentUser?.CanShare;

    return (
        value === true ||
        value === 1 ||
        String(value)
            .toLowerCase() === "true"
    );
}

function handleCountryShareAction(
    event
) {
    const button =
        event.target.closest(
            "[data-share-action]"
        );

    if (!button) {
        return;
    }

    const shareId =
        Number(
            button.dataset.shareId
        );

    const action =
        button.dataset.shareAction;

    if (action === "edit") {
        window.location.href =
            `shares.html?editShareId=${shareId}`;

        return;
    }

    if (action === "delete") {
        deleteCountryShare(
            shareId
        );
    }
}


async function deleteCountryShare(
    shareId
) {
    const confirmed =
        window.confirm(
            "האם אתה בטוח שברצונך למחוק את השיתוף?"
        );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${sharesApiUrl}/${shareId}?actorUserId=${getCurrentUserId()}`,
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
                "מחיקת השיתוף נכשלה."
            );
        }

        countryShares =
            countryShares.filter(
                function (share) {
                    return (
                        Number(
                            share.shareId ??
                            share.ShareId
                        ) !== shareId
                    );
                }
            );

        renderCountryShares();

        showMessage(
            "השיתוף נמחק בהצלחה.",
            "success"
        );
    } catch (error) {
        showMessage(
            translateShareMessage(
                error.message
            ),
            "error"
        );
    }
}

function showCountrySharesLoading() {
    countrySharesLoading.hidden =
        false;

    countrySharesGrid.hidden =
        true;

    countrySharesEmpty.hidden =
        true;
}


function getSharesCountText(
    count
) {
    if (count === 0) {
        return "אין שיתופים";
    }

    if (count === 1) {
        return "שיתוף אחד";
    }

    return `${count} שיתופים`;
}


function getShareTypeText(
    shareType
) {
    const values = {
        1: "חוויה",
        2: "המלצה",
        3: "טיפ"
    };

    const numericType =
        Number(shareType);

    if (values[numericType]) {
        return values[numericType];
    }

    const textType =
        String(
            shareType ?? ""
        )
            .trim()
            .toLowerCase();

    if (textType === "experience") {
        return "חוויה";
    }

    if (
        textType === "recommendation"
    ) {
        return "המלצה";
    }

    if (textType === "tip") {
        return "טיפ";
    }

    return "שיתוף";
}


function getShareStars(
    rating
) {
    if (
        !Number.isFinite(rating) ||
        rating <= 0
    ) {
        return "ללא דירוג";
    }

    const normalizedRating =
        Math.min(
            5,
            Math.max(
                1,
                Math.round(rating)
            )
        );

    return (
        "★".repeat(
            normalizedRating
        ) +
        "☆".repeat(
            5 - normalizedRating
        )
    );
}


function formatShareDate(
    value
) {
    if (!value) {
        return "תאריך לא ידוע";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "תאריך לא ידוע";
    }

    return date.toLocaleDateString(
        "he-IL",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


function getShareTime(
    share
) {
    const value =
        share.createdAt ??
        share.CreatedAt ??
        0;

    const time =
        new Date(value)
            .getTime();

    return Number.isNaN(time)
        ? 0
        : time;
}

function showLoadingState() {
    loadingState.hidden =
        false;

    errorState.hidden =
        true;

    countryContent.hidden =
        true;
}


function showCountryContent() {
    loadingState.hidden =
        true;

    errorState.hidden =
        true;

    countryContent.hidden =
        false;
}


function showErrorState(
    message
) {
    loadingState.hidden =
        true;

    countryContent.hidden =
        true;

    errorState.hidden =
        false;

    errorStateText.textContent =
        message;
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

    messageTimer =
        setTimeout(
            clearMessage,
            5000
        );
}


function clearMessage() {
    pageMessage.textContent =
        "";

    pageMessage.className =
        "page-message";
}

function getCurrentUserId() {
    return Number(
        currentUser?.userId ??
        currentUser?.UserId
    );
}


function getValue(
    object,
    names,
    defaultValue
) {
    if (!object) {
        return defaultValue;
    }

    for (
        let index = 0;
        index < names.length;
        index++
    ) {
        const value =
            object[names[index]];

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


function getArrayValue(
    object,
    names
) {
    for (
        let index = 0;
        index < names.length;
        index++
    ) {
        const value =
            object?.[names[index]];

        if (Array.isArray(value)) {
            return value;
        }
    }

    return [];
}


function formatNumber(
    value
) {
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


function formatArea(
    value
) {
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


function formatCoordinate(
    value
) {
    return Number(value)
        .toLocaleString(
            "he-IL",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
            }
        );
}


function translateContinent(
    name
) {
    const translations = {
        africa: "אפריקה",
        asia: "אסיה",
        europe: "אירופה",
        oceania: "אוקיאניה",
        antarctica: "אנטארקטיקה",
        "north america":
            "אמריקה הצפונית",
        "south america":
            "אמריקה הדרומית"
    };

    const key =
        String(name ?? "")
            .trim()
            .toLowerCase();

    return (
        translations[key] ||
        name ||
        "לא הוגדרה"
    );
}


function translateRegion(
    name
) {
    const translations = {
        africa: "אפריקה",
        americas: "אמריקה",
        asia: "אסיה",
        europe: "אירופה",
        oceania: "אוקיאניה",
        antarctic: "אנטארקטיקה"
    };

    const key =
        String(name ?? "")
            .trim()
            .toLowerCase();

    return (
        translations[key] ||
        name ||
        "לא הוגדר"
    );
}


function translateSubregion(
    name
) {
    const translations = {
        caribbean:
            "האיים הקריביים",

        "north america":
            "אמריקה הצפונית",

        "south america":
            "אמריקה הדרומית",

        "western europe":
            "מערב אירופה",

        "eastern europe":
            "מזרח אירופה",

        "northern europe":
            "צפון אירופה",

        "southern europe":
            "דרום אירופה",

        "western asia":
            "מערב אסיה",

        "eastern asia":
            "מזרח אסיה",

        "southern asia":
            "דרום אסיה",

        "south-eastern asia":
            "דרום־מזרח אסיה",

        "central asia":
            "מרכז אסיה",

        "northern africa":
            "צפון אפריקה",

        "western africa":
            "מערב אפריקה",

        "eastern africa":
            "מזרח אפריקה",

        "middle africa":
            "מרכז אפריקה",

        "southern africa":
            "דרום אפריקה"
    };

    const key =
        String(name ?? "")
            .trim()
            .toLowerCase();

    return (
        translations[key] ||
        name ||
        "לא הוגדר"
    );
}


function translateMessage(
    message
) {
    const value =
        String(message ?? "");

    if (
        value.includes(
            "Failed to fetch"
        )
    ) {
        return "לא ניתן להתחבר לשרת. ודא שהשרת פועל.";
    }

    if (
        value.includes(
            "Country was not found"
        )
    ) {
        return "המדינה המבוקשת לא נמצאה.";
    }

    return (
        value ||
        "אירעה שגיאה לא צפויה."
    );
}


function translateListMessage(
    message
) {
    const value =
        String(message ?? "");

    if (
        value.includes(
            "Failed to fetch"
        )
    ) {
        return "לא ניתן להתחבר לשרת.";
    }

    return (
        value ||
        "עדכון הרשימה נכשל."
    );
}


function translateShareMessage(
    message
) {
    const value =
        String(message ?? "");

    if (
        value.includes(
            "Failed to fetch"
        )
    ) {
        return "לא ניתן להתחבר לשרת לצורך טעינת השיתופים.";
    }

    if (
        value.includes(
            "Share was not found"
        )
    ) {
        return "השיתוף לא נמצא.";
    }

    if (
        value.includes(
            "not allowed"
        )
    ) {
        return "אין לך הרשאה לבצע פעולה זו.";
    }

    return (
        value ||
        "טעינת השיתופים נכשלה."
    );
}


function getInitial(
    fullName
) {
    const name =
        String(fullName ?? "")
            .trim();

    return name
        ? name.charAt(0).toUpperCase()
        : "U";
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


function getMessage(
    data
) {
    if (
        typeof data === "string"
    ) {
        return data;
    }

    return (
        data?.message ??
        data?.Message ??
        ""
    );
}


async function readResponseBody(
    response
) {
    const text =
        await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        return {
            message: text
        };
    }
}


function escapeHtml(
    value
) {
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
function getApiErrorMessage(
    data,
    status
) {
    if (
        typeof data === "string" &&
        data.trim() !== ""
    ) {
        return data;
    }

    const directMessage =
        data?.message ??
        data?.Message ??
        data?.title ??
        data?.Title;

    if (directMessage) {
        return directMessage;
    }

    const errors =
        data?.errors ??
        data?.Errors;

    if (
        errors &&
        typeof errors === "object"
    ) {
        const errorMessages =
            Object.values(errors)
                .flat()
                .filter(Boolean);

        if (
            errorMessages.length > 0
        ) {
            return errorMessages.join(
                " "
            );
        }
    }

    return `טעינת השיתופים נכשלה. קוד שגיאה: ${status}`;
}