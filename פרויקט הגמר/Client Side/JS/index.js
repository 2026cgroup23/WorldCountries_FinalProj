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

let currentUser;

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


const usersApiUrl =
    "https://localhost:7296/api/Users";

const sharesApiUrl =
    "https://localhost:7296/api/Shares";

const latestSharesLimit = 6;

const greetingText =
    document.getElementById(
        "greetingText"
    );

const welcomeUserName =
    document.getElementById(
        "welcomeUserName"
    );

const headerUserName =
    document.getElementById(
        "headerUserName"
    );

const headerUserRole =
    document.getElementById(
        "headerUserRole"
    );

const userAvatar =
    document.getElementById(
        "userAvatar"
    );

const connectedUserEmail =
    document.getElementById(
        "connectedUserEmail"
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

const mobileMenuButton =
    document.getElementById(
        "mobileMenuButton"
    );

const mainNavigation =
    document.getElementById(
        "mainNavigation"
    );

const adminSection =
    document.getElementById(
        "adminSection"
    );

const adminLink =
    document.getElementById(
        "adminLink"
    );

const userStatusCard =
    document.getElementById(
        "userStatusCard"
    );

const statusIcon =
    document.getElementById(
        "statusIcon"
    );

const accountStatusTitle =
    document.getElementById(
        "accountStatusTitle"
    );

const accountStatusBadge =
    document.getElementById(
        "accountStatusBadge"
    );

const sharePermissionCard =
    document.getElementById(
        "sharePermissionCard"
    );

const sharePermissionIcon =
    document.getElementById(
        "sharePermissionIcon"
    );

const sharePermissionTitle =
    document.getElementById(
        "sharePermissionTitle"
    );

const sharePermissionText =
    document.getElementById(
        "sharePermissionText"
    );

const sharePermissionBadge =
    document.getElementById(
        "sharePermissionBadge"
    );

const sharesActionCard =
    document.getElementById(
        "sharesActionCard"
    );

const sharesActionDescription =
    document.getElementById(
        "sharesActionDescription"
    );

const sharesActionLink =
    document.getElementById(
        "sharesActionLink"
    );

const pageMessage =
    document.getElementById(
        "pageMessage"
    );

const latestSharesLoading =
    document.getElementById(
        "latestSharesLoading"
    );

const latestSharesGrid =
    document.getElementById(
        "latestSharesGrid"
    );

const latestSharesEmpty =
    document.getElementById(
        "latestSharesEmpty"
    );

const latestSharesError =
    document.getElementById(
        "latestSharesError"
    );

const latestSharesErrorText =
    document.getElementById(
        "latestSharesErrorText"
    );

const retryLatestSharesButton =
    document.getElementById(
        "retryLatestSharesButton"
    );

let messageTimer = null;


initializePage();

async function initializePage() {
    addEvents();

    showGreeting();

    const userPromise =
        loadCurrentUserFromServer();

    const sharesPromise =
        loadLatestShares();

    const loadedSuccessfully =
        await userPromise;

    if (!loadedSuccessfully) {
        showUserData();

        configureAdminDisplay();

        configureAccountStatus();

        configureSharePermission();
    }

    await sharesPromise;
}

async function loadCurrentUserFromServer() {
    const currentUserId =
        Number(
            currentUser?.userId ??
            currentUser?.UserId
        );

    if (
        !Number.isInteger(
            currentUserId
        ) ||
        currentUserId <= 0
    ) {
        logout();

        return false;
    }

    try {
        const response =
            await fetch(
                `${usersApiUrl}/${currentUserId}`,
                {
                    method:
                        "GET",

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

        const user =
            data.user ??
            data.User;

        if (
            !response.ok ||
            !user
        ) {
            if (
                response.status === 404 ||
                response.status === 401
            ) {
                logout();
            }

            return false;
        }

        currentUser =
            user;

        saveCurrentUser();

        const isLocked =
            currentUser.isLocked === true ||
            currentUser.IsLocked === true;

        if (isLocked) {
            showLockedAccountAndLogout();

            return true;
        }

        showUserData();

        configureAdminDisplay();

        configureAccountStatus();

        configureSharePermission();

        return true;
    } catch (error) {
        console.error(
            "Load current user error:",
            error
        );

        showPageMessage(
            "לא ניתן לרענן את פרטי המשתמש מהשרת. מוצגים הנתונים האחרונים שנשמרו.",
            "error"
        );

        return false;
    }
}

function showUserData() {
    const fullName =
        currentUser?.fullName ??
        currentUser?.FullName ??
        "משתמש";

    const email =
        currentUser?.email ??
        currentUser?.Email ??
        "לא הוגדר";

    const roleName =
        isAdminUser()
            ? "Admin"
            : "User";

    welcomeUserName.textContent =
        fullName;

    headerUserName.textContent =
        fullName;

    connectedUserEmail.textContent =
        email;

    headerUserRole.textContent =
        roleName;

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
    const isAdmin =
        isAdminUser();

    adminSection.hidden =
        !isAdmin;

    adminLink.hidden =
        !isAdmin;
}

function configureAccountStatus() {
    const isLocked =
        currentUser?.isLocked === true ||
        currentUser?.IsLocked === true;

    if (isLocked) {
        accountStatusTitle.textContent =
            "החשבון שלך נעול";

        accountStatusBadge.textContent =
            "נעול";

        statusIcon.textContent =
            "🔒";

        userStatusCard.classList.add(
            "locked"
        );

        return;
    }

    accountStatusTitle.textContent =
        "החשבון שלך מחובר";

    accountStatusBadge.textContent =
        "פעיל";

    statusIcon.textContent =
        "✦";

    userStatusCard.classList.remove(
        "locked"
    );
}

function configureSharePermission() {
    const canShareValue =
        currentUser?.canShare ??
        currentUser?.CanShare;

    const canShare =
        canShareValue !== false &&
        canShareValue !== 0 &&
        String(
            canShareValue
        )
            .trim()
            .toLowerCase() !== "false";

    if (canShare) {
        sharePermissionTitle.textContent =
            "הרשאת שיתוף פעילה";

        sharePermissionText.textContent =
            "באפשרותך לפרסם מחשבות, המלצות וביקורות.";

        sharePermissionBadge.textContent =
            "מאושר";

        sharePermissionIcon.textContent =
            "💬";

        sharePermissionCard.classList.remove(
            "blocked"
        );

        sharesActionCard.classList.remove(
            "sharing-blocked"
        );

        sharesActionDescription.textContent =
            "קרא המלצות, ביקורות ומחשבות של משתמשים אחרים.";

        sharesActionLink.textContent =
            "לצפייה בשיתופים";

        return;
    }

    sharePermissionTitle.textContent =
        "הרשאת השיתוף שלך חסומה";

    sharePermissionText.textContent =
        "באפשרותך לצפות בשיתופים, אך לא לפרסם תוכן חדש.";

    sharePermissionBadge.textContent =
        "חסום";

    sharePermissionIcon.textContent =
        "🚫";

    sharePermissionCard.classList.add(
        "blocked"
    );

    sharesActionCard.classList.add(
        "sharing-blocked"
    );

    sharesActionDescription.textContent =
        "באפשרותך לקרוא שיתופים של אחרים, אך לא לפרסם תוכן חדש.";

    sharesActionLink.textContent =
        "לצפייה בלבד";
}

function showGreeting() {
    const currentHour =
        new Date()
            .getHours();

    let greeting =
        "שלום";

    if (
        currentHour >= 5 &&
        currentHour < 12
    ) {
        greeting =
            "בוקר טוב";
    } else if (
        currentHour >= 12 &&
        currentHour < 17
    ) {
        greeting =
            "צהריים טובים";
    } else if (
        currentHour >= 17 &&
        currentHour < 21
    ) {
        greeting =
            "ערב טוב";
    } else {
        greeting =
            "לילה טוב";
    }

    greetingText.textContent =
        greeting;
}

function addEvents() {
    userMenuButton.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();

            userDropdown.classList.toggle(
                "open"
            );

            const isOpen =
                userDropdown.classList.contains(
                    "open"
                );

            userMenuButton.setAttribute(
                "aria-expanded",
                isOpen.toString()
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

    retryLatestSharesButton.addEventListener(
        "click",
        loadLatestShares
    );

    latestSharesGrid.addEventListener(
        "error",
        handleLatestShareImageError,
        true
    );

    window.addEventListener(
        "resize",
        function () {
            if (
                window.innerWidth > 900
            ) {
                mainNavigation.classList.remove(
                    "open"
                );
            }
        }
    );
}

async function loadLatestShares() {
    showLatestSharesLoading();

    try {
        const requestUrl =
            `${sharesApiUrl}?sortDirection=desc`;

        console.log(
            "Latest shares request URL:",
            requestUrl
        );

        const response =
            await fetch(
                requestUrl,
                {
                    method:
                        "GET",

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
            "Latest shares API status:",
            response.status
        );

        console.log(
            "Latest shares API response:",
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

        console.log(
            "All extracted shares:",
            allShares
        );

        const latestShares =
            allShares
                .slice()
                .sort(
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
                )
                .slice(
                    0,
                    latestSharesLimit
                );

        console.log(
            "Latest six shares:",
            latestShares
        );

        renderLatestShares(
            latestShares
        );
    } catch (error) {
        console.error(
            "Load latest shares error:",
            error
        );

        latestSharesErrorText.textContent =
            translateShareMessage(
                error.message
            );

        showLatestSharesError();
    }
}

function extractSharesArray(
    data
) {
    if (
        Array.isArray(
            data
        )
    ) {
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
        const possibleArray =
            possibleArrays[index];

        if (
            Array.isArray(
                possibleArray
            )
        ) {
            return possibleArray;
        }
    }

    return [];
}

function renderLatestShares(
    latestShares
) {
    latestSharesGrid.innerHTML =
        "";

    latestSharesLoading.hidden =
        true;

    latestSharesError.hidden =
        true;

    if (
        latestShares.length === 0
    ) {
        latestSharesGrid.hidden =
            true;

        latestSharesEmpty.hidden =
            false;

        return;
    }

    latestSharesEmpty.hidden =
        true;

    latestSharesGrid.hidden =
        false;

    latestShares.forEach(
        function (share) {
            const card =
                createLatestShareCard(
                    share
                );

            latestSharesGrid.appendChild(
                card
            );
        }
    );
}
function createLatestShareCard(
    share
) {
    const card =
        document.createElement(
            "article"
        );

    card.className =
        "latest-share-card";

    const shareId =
        Number(
            share.shareId ??
            share.ShareId ??
            0
        );

    const countryId =
        Number(
            share.countryId ??
            share.CountryId ??
            0
        );

    const fullName =
        share.fullName ??
        share.FullName ??
        share.userName ??
        share.UserName ??
        "משתמש";

    const countryName =
        share.commonName ??
        share.CommonName ??
        share.countryName ??
        share.CountryName ??
        "מדינה";

    const flagUrl =
        share.flagUrl ??
        share.FlagUrl ??
        "";

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

    let shareLink =
        "shares.html";

    if (
        Number.isInteger(
            countryId
        ) &&
        countryId > 0
    ) {
        shareLink =
            `country-details.html?id=${countryId}`;
    } else if (
        Number.isInteger(
            shareId
        ) &&
        shareId > 0
    ) {
        shareLink =
            `shares.html?shareId=${shareId}`;
    }

    card.innerHTML = `
        <div class="latest-share-card-top">

            <span class="latest-share-type">
                ${escapeHtml(
        getShareTypeText(
            shareType
        )
    )}
            </span>

            <span class="latest-share-date">
                ${escapeHtml(
        formatLatestShareDate(
            createdAt
        )
    )}

                ${updatedAt
            ? " · נערך"
            : ""
        }
            </span>

        </div>

        <div class="latest-share-country-row">

            <div class="latest-share-country-icon">

                ${flagUrl
            ? `
                        <img
                            class="latest-share-country-flag"
                            src="${escapeHtml(
                flagUrl
            )}"
                            alt="דגל ${escapeHtml(
                countryName
            )}"
                            loading="lazy"
                        >

                        <span
                            class="latest-share-missing-flag"
                            hidden
                            aria-hidden="true"
                        >
                            🌍
                        </span>
                    `
            : `
                        <span
                            class="latest-share-missing-flag"
                            aria-hidden="true"
                        >
                            🌍
                        </span>
                    `
        }

            </div>

            <h3 title="${escapeHtml(
            countryName
        )}">
                ${escapeHtml(
            countryName
        )}
            </h3>

        </div>

        <div
            class="latest-share-rating"
            aria-label="${escapeHtml(
            getRatingAccessibilityText(
                rating
            )
        )}"
        >
            ${createLatestShareStars(
            rating
        )}
        </div>

        <p class="latest-share-content">
            ${escapeHtml(
            getShortShareContent(
                content
            )
        )}
        </p>

        <div class="latest-share-footer">

            <div class="latest-share-user">

                <span class="latest-share-avatar">
                    ${escapeHtml(
            getInitial(
                fullName
            )
        )}
                </span>

                <span class="latest-share-user-details">

                    <small>
                        פורסם על ידי
                    </small>

                    <strong title="${escapeHtml(
            fullName
        )}">
                        ${escapeHtml(
            fullName
        )}
                    </strong>

                </span>

            </div>

            <a
                href="${escapeHtml(
            shareLink
        )}"
                class="latest-share-link"
            >
                קרא עוד
            </a>

        </div>
    `;

    return card;
}

function handleLatestShareImageError(
    event
) {
    const image =
        event.target;

    if (
        !image.classList.contains(
            "latest-share-country-flag"
        )
    ) {
        return;
    }

    image.hidden =
        true;

    const fallback =
        image.nextElementSibling;

    if (
        fallback &&
        fallback.classList.contains(
            "latest-share-missing-flag"
        )
    ) {
        fallback.hidden =
            false;
    }
}

function showLatestSharesLoading() {
    latestSharesLoading.hidden =
        false;

    latestSharesGrid.hidden =
        true;

    latestSharesEmpty.hidden =
        true;

    latestSharesError.hidden =
        true;
}


function showLatestSharesError() {
    latestSharesLoading.hidden =
        true;

    latestSharesGrid.hidden =
        true;

    latestSharesEmpty.hidden =
        true;

    latestSharesError.hidden =
        false;
}

function getShareTypeText(
    shareType
) {
    const values = {
        1:
            "חוויה",

        2:
            "המלצה",

        3:
            "טיפ"
    };

    const numericType =
        Number(
            shareType
        );

    if (
        values[numericType]
    ) {
        return values[numericType];
    }

    const textType =
        String(
            shareType ?? ""
        )
            .trim()
            .toLowerCase();

    if (
        textType ===
        "experience"
    ) {
        return "חוויה";
    }

    if (
        textType ===
        "recommendation"
    ) {
        return "המלצה";
    }

    if (
        textType ===
        "tip"
    ) {
        return "טיפ";
    }

    return "שיתוף";
}


function createLatestShareStars(
    rating
) {
    if (
        !Number.isFinite(
            rating
        ) ||
        rating <= 0
    ) {
        return `
            <span class="no-rating">
                ללא דירוג
            </span>
        `;
    }

    const normalizedRating =
        Math.min(
            5,
            Math.max(
                1,
                Math.round(
                    rating
                )
            )
        );

    let stars =
        "";

    for (
        let index = 1;
        index <= 5;
        index++
    ) {
        if (
            index <=
            normalizedRating
        ) {
            stars += `
                <span
                    class="filled-star"
                    aria-hidden="true"
                >
                    ★
                </span>
            `;
        } else {
            stars += `
                <span
                    class="empty-star"
                    aria-hidden="true"
                >
                    ☆
                </span>
            `;
        }
    }

    return stars;
}


function getRatingAccessibilityText(
    rating
) {
    if (
        !Number.isFinite(
            rating
        ) ||
        rating <= 0
    ) {
        return "ללא דירוג";
    }

    const normalizedRating =
        Math.min(
            5,
            Math.max(
                1,
                Math.round(
                    rating
                )
            )
        );

    return (
        `דירוג ${normalizedRating} מתוך 5`
    );
}


function getShortShareContent(
    content
) {
    const value =
        String(
            content ?? ""
        )
            .trim();

    if (!value) {
        return "לא נוסף תוכן לשיתוף.";
    }

    const maximumLength =
        160;

    if (
        value.length <=
        maximumLength
    ) {
        return value;
    }

    return (
        value.substring(
            0,
            maximumLength
        ) +
        "..."
    );
}


function formatLatestShareDate(
    value
) {
    if (!value) {
        return "תאריך לא ידוע";
    }

    const date =
        new Date(
            value
        );

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
            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"
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
        new Date(
            value
        )
            .getTime();

    return Number.isNaN(
        time
    )
        ? 0
        : time;
}


function translateShareMessage(
    message
) {
    const value =
        String(
            message ?? ""
        );

    if (
        value.includes(
            "Failed to fetch"
        ) ||
        value.includes(
            "NetworkError"
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

    return (
        value ||
        "טעינת השיתופים נכשלה."
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
            Object.values(
                errors
            )
                .flat()
                .filter(
                    Boolean
                );

        if (
            errorMessages.length > 0
        ) {
            return errorMessages.join(
                " "
            );
        }
    }

    return (
        `טעינת השיתופים נכשלה. קוד שגיאה: ${status}`
    );
}


   // LOCKED ACCOUNT

function showLockedAccountAndLogout() {
    configureAccountStatus();

    showPageMessage(
        "החשבון שלך ננעל על ידי מנהל המערכת. תועבר למסך ההתחברות.",
        "error"
    );

    setTimeout(
        function () {
            logout();
        },
        2500
    );
}


function showPageMessage(
    message,
    type
) {
    if (!pageMessage) {
        return;
    }

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
            clearPageMessage,
            5000
        );
}


function clearPageMessage() {
    if (!pageMessage) {
        return;
    }

    pageMessage.textContent =
        "";

    pageMessage.className =
        "page-message";
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


function getInitial(
    fullName
) {
    const trimmedName =
        String(
            fullName ?? ""
        )
            .trim();

    if (
        trimmedName === ""
    ) {
        return "U";
    }

    return trimmedName
        .charAt(0)
        .toUpperCase();
}


function escapeHtml(
    value
) {
    return String(
        value ?? ""
    )
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
            "\"",
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function saveCurrentUser() {
    localStorage.setItem(
        "currentUser",
        JSON.stringify(
            currentUser
        )
    );
}


async function readResponseBody(
    response
) {
    const responseText =
        await response.text();

    if (
        responseText === ""
    ) {
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


function clearLoginData() {
    localStorage.removeItem(
        "currentUser"
    );

    localStorage.removeItem(
        "isLoggedIn"
    );
}


function logout() {
    clearLoginData();

    window.location.replace(
        "login.html"
    );
}