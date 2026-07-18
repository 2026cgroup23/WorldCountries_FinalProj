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

const sharesApiUrl =
    "https://localhost:7296/api/Shares";

const countriesApiUrl =
    "https://localhost:7296/api/Countries";

const usersApiUrl =
    "https://localhost:7296/api/Users";

let shares = [];
let countries = [];

let editingShareId = null;
let pendingDeleteShare = null;
let selectedRating = null;

let searchTimer = null;
let messageTimer = null;

const mainNavigation =
    document.getElementById("mainNavigation");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const userMenuButton =
    document.getElementById("userMenuButton");

const userDropdown =
    document.getElementById("userDropdown");

const logoutButton =
    document.getElementById("logoutButton");

const userAvatar =
    document.getElementById("userAvatar");

const headerUserName =
    document.getElementById("headerUserName");

const headerUserRole =
    document.getElementById("headerUserRole");

const adminLink =
    document.getElementById("adminLink");

const allowedSharePanel =
    document.getElementById("allowedSharePanel");

const blockedSharePanel =
    document.getElementById("blockedSharePanel");

const openCreateShareButton =
    document.getElementById("openCreateShareButton");

const searchInput =
    document.getElementById("searchInput");

const countryFilter =
    document.getElementById("countryFilter");

const shareTypeFilter =
    document.getElementById("shareTypeFilter");

const ratingFilter =
    document.getElementById("ratingFilter");

const sortDirectionFilter =
    document.getElementById("sortDirectionFilter");

const clearFiltersButton =
    document.getElementById("clearFiltersButton");

const refreshSharesButton =
    document.getElementById("refreshSharesButton");

const totalSharesCount =
    document.getElementById("totalSharesCount");

const sharedCountriesCount =
    document.getElementById("sharedCountriesCount");

const averageRating =
    document.getElementById("averageRating");

const resultsCount =
    document.getElementById("resultsCount");

const loadingState =
    document.getElementById("loadingState");

const sharesGrid =
    document.getElementById("sharesGrid");

const emptyState =
    document.getElementById("emptyState");

const pageMessage =
    document.getElementById("pageMessage");

const shareFormModal =
    document.getElementById("shareFormModal");

const shareFormOverlay =
    document.getElementById("shareFormOverlay");

const shareForm =
    document.getElementById("shareForm");

const shareFormLabel =
    document.getElementById("shareFormLabel");

const shareFormTitle =
    document.getElementById("shareFormTitle");

const shareFormSubtitle =
    document.getElementById("shareFormSubtitle");

const closeShareFormButton =
    document.getElementById("closeShareFormButton");

const cancelShareFormButton =
    document.getElementById("cancelShareFormButton");

const saveShareButton =
    document.getElementById("saveShareButton");

const shareCountryInput =
    document.getElementById("shareCountryInput");

const shareTypeInput =
    document.getElementById("shareTypeInput");

const shareContentInput =
    document.getElementById("shareContentInput");

const contentCharacterCount =
    document.getElementById("contentCharacterCount");

const ratingSelector =
    document.getElementById("ratingSelector");

const clearRatingButton =
    document.getElementById("clearRatingButton");

const shareFormMessage =
    document.getElementById("shareFormMessage");

const deleteShareModal =
    document.getElementById("deleteShareModal");

const deleteShareOverlay =
    document.getElementById("deleteShareOverlay");

const cancelDeleteShareButton =
    document.getElementById("cancelDeleteShareButton");

const approveDeleteShareButton =
    document.getElementById("approveDeleteShareButton");

initializePage();

async function initializePage() {
    showUserInformation();
    addEvents();

    await refreshCurrentUser();

    configurePermissionDisplay();

    await Promise.all([
        loadCountries(),
        loadShares()
    ]);
}

function showUserInformation() {
    const fullName =
        currentUser.fullName || "משתמש";

    headerUserName.textContent =
        fullName;

    headerUserRole.textContent =
        isAdminUser()
            ? "Admin"
            : "User";

    userAvatar.textContent =
        getInitial(fullName);

    adminLink.hidden =
        !isAdminUser();
}


async function refreshCurrentUser() {
    try {
        const response = await fetch(
            `${usersApiUrl}/${currentUser.userId}`,
            {
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const data =
            await readResponseBody(response);

        if (
            response.ok &&
            data.user
        ) {
            currentUser = {
                ...currentUser,
                ...data.user
            };

            localStorage.setItem(
                "currentUser",
                JSON.stringify(currentUser)
            );

            showUserInformation();
        }
    } catch (error) {
        console.error(
            "Refresh user error:",
            error
        );
    }
}


function isAdminUser() {
    return (
        Number(currentUser.roleId) === 2 ||
        String(currentUser.roleName || "")
            .trim()
            .toLowerCase() === "admin"
    );
}


function userCanShare() {
    return (
        currentUser.canShare === true ||
        currentUser.canShare === 1 ||
        String(currentUser.canShare)
            .toLowerCase() === "true"
    );
}


function configurePermissionDisplay() {
    const canPublish =
        isAdminUser() ||
        userCanShare();

    allowedSharePanel.hidden =
        !canPublish;

    blockedSharePanel.hidden =
        canPublish;
}

function addEvents() {
    userMenuButton.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();

            userDropdown.classList.toggle(
                "open"
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

    searchInput.addEventListener(
        "input",
        function () {
            clearTimeout(searchTimer);

            searchTimer =
                setTimeout(loadShares, 350);
        }
    );

    countryFilter.addEventListener(
        "change",
        loadShares
    );

    shareTypeFilter.addEventListener(
        "change",
        loadShares
    );

    ratingFilter.addEventListener(
        "change",
        loadShares
    );

    sortDirectionFilter.addEventListener(
        "change",
        loadShares
    );

    clearFiltersButton.addEventListener(
        "click",
        clearFilters
    );

    refreshSharesButton.addEventListener(
        "click",
        async function () {
            await refreshCurrentUser();
            configurePermissionDisplay();
            await loadShares(true);
        }
    );

    openCreateShareButton.addEventListener(
        "click",
        openCreateShareModal
    );

    sharesGrid.addEventListener(
        "click",
        handleShareAction
    );

    shareForm.addEventListener(
        "submit",
        saveShare
    );

    closeShareFormButton.addEventListener(
        "click",
        closeShareFormModal
    );

    cancelShareFormButton.addEventListener(
        "click",
        closeShareFormModal
    );

    shareFormOverlay.addEventListener(
        "click",
        closeShareFormModal
    );

    shareContentInput.addEventListener(
        "input",
        function () {
            contentCharacterCount.textContent =
                shareContentInput.value.length
                    .toString();
        }
    );

    ratingSelector.addEventListener(
        "click",
        handleRatingClick
    );

    clearRatingButton.addEventListener(
        "click",
        function () {
            selectedRating = null;
            updateRatingDisplay();
        }
    );

    cancelDeleteShareButton.addEventListener(
        "click",
        closeDeleteShareModal
    );

    deleteShareOverlay.addEventListener(
        "click",
        closeDeleteShareModal
    );

    approveDeleteShareButton.addEventListener(
        "click",
        deleteShare
    );

    document.addEventListener(
        "keydown",
        function (event) {
            if (event.key !== "Escape") {
                return;
            }

            if (!shareFormModal.hidden) {
                closeShareFormModal();
            }

            if (!deleteShareModal.hidden) {
                closeDeleteShareModal();
            }
        }
    );
}

async function loadCountries() {
    try {
        const response = await fetch(
            `${countriesApiUrl}?sortBy=name&sortDirection=asc`,
            {
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "טעינת המדינות נכשלה."
            );
        }

        countries =
            Array.isArray(data.countries)
                ? data.countries
                : [];

        fillCountrySelections();
    } catch (error) {
        showPageMessage(
            translateMessage(error.message),
            "error"
        );
    }
}

function fillCountrySelections() {
    countryFilter.innerHTML =
        `<option value="">כל המדינות</option>`;

    shareCountryInput.innerHTML =
        `<option value="">בחר מדינה</option>`;

    countries.forEach(
        function (country) {
            const countryId =
                country.countryId;

            const countryName =
                country.commonName;

            const filterOption =
                document.createElement("option");

            filterOption.value =
                countryId;

            filterOption.textContent =
                countryName;

            countryFilter.appendChild(
                filterOption
            );

            const formOption =
                document.createElement("option");

            formOption.value =
                countryId;

            formOption.textContent =
                countryName;

            shareCountryInput.appendChild(
                formOption
            );
        }
    );
}

async function loadShares(
    showSuccessMessage = false
) {
    showLoading();
    clearPageMessage();

    try {
        const query =
            buildSharesQuery();

        const response = await fetch(
            `${sharesApiUrl}?${query}`,
            {
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "טעינת השיתופים נכשלה."
            );
        }

        shares =
            Array.isArray(data.shares)
                ? data.shares
                : [];

        renderShares();
        updateStatistics();

        if (showSuccessMessage) {
            showPageMessage(
                "השיתופים עודכנו בהצלחה.",
                "success"
            );
        }
    } catch (error) {
        shares = [];

        renderShares();
        updateStatistics();

        showPageMessage(
            translateMessage(error.message),
            "error"
        );
    } finally {
        hideLoading();
        setRefreshLoading(false);
    }
}


function buildSharesQuery() {
    const parameters =
        new URLSearchParams();

    if (searchInput.value.trim()) {
        parameters.set(
            "searchText",
            searchInput.value.trim()
        );
    }

    if (countryFilter.value) {
        parameters.set(
            "countryId",
            countryFilter.value
        );
    }

    if (shareTypeFilter.value) {
        parameters.set(
            "shareType",
            shareTypeFilter.value
        );
    }

    if (ratingFilter.value) {
        parameters.set(
            "rating",
            ratingFilter.value
        );
    }

    parameters.set(
        "sortDirection",
        sortDirectionFilter.value
    );

    return parameters.toString();
}

function renderShares() {
    sharesGrid.innerHTML = "";

    resultsCount.textContent =
        getResultsText(shares.length);

    if (shares.length === 0) {
        sharesGrid.hidden = true;
        emptyState.hidden = false;
        return;
    }

    sharesGrid.hidden = false;
    emptyState.hidden = true;

    shares.forEach(
        function (share) {
            sharesGrid.appendChild(
                createShareCard(share)
            );
        }
    );
}


function createShareCard(share) {
    const card =
        document.createElement("article");

    card.className =
        "share-card";

    const canManage =
        canManageShare(share);

    const rating =
        Number(share.rating || 0);

    card.innerHTML = `
        <div class="share-country-banner">

            ${share.flagUrl
            ? `
                        <img
                            class="share-country-flag"
                            src="${escapeHtml(share.flagUrl)}"
                            alt="דגל ${escapeHtml(share.commonName)}"
                            loading="lazy"
                        >
                    `
            : `
                        <div class="share-country-flag missing-flag">
                            🌍
                        </div>
                    `
        }

            <div class="share-country-information">

                <strong>
                    ${escapeHtml(share.commonName)}
                </strong>

                <small>
                    ${escapeHtml(
            translateContinent(
                share.continentName
            )
        )}
                </small>

            </div>

        </div>

        <div class="share-body">

            <div class="share-top-row">

                <span class="share-type-badge">
                    ${getShareTypeText(share.shareType)}
                </span>

                <span class="share-rating">
                    ${getStars(rating)}
                </span>

            </div>

            <p class="share-content">
                ${escapeHtml(share.content)}
            </p>

            <div class="share-author-row">

                <span class="share-author-avatar">
                    ${escapeHtml(
            getInitial(share.fullName)
        )}
                </span>

                <div class="share-author-details">

                    <strong>
                        ${escapeHtml(share.fullName)}
                    </strong>

                    <small>
                        ${formatDate(share.createdAt)}
                        ${share.updatedAt
            ? " · נערך"
            : ""
        }
                    </small>

                </div>

            </div>

            ${canManage
            ? `
                        <div class="share-actions">

                            <button
                                type="button"
                                class="share-action-button edit-share-button"
                                data-action="edit"
                                data-share-id="${share.shareId}"
                            >
                                ✏️ עריכה
                            </button>

                            <button
                                type="button"
                                class="share-action-button delete-share-button"
                                data-action="delete"
                                data-share-id="${share.shareId}"
                            >
                                🗑️ מחיקה
                            </button>

                        </div>
                    `
            : ""
        }

        </div>
    `;

    return card;
}


function canManageShare(share) {
    if (isAdminUser()) {
        return true;
    }

    return (
        userCanShare() &&
        Number(share.userId) ===
        Number(currentUser.userId)
    );
}

function updateStatistics() {
    totalSharesCount.textContent =
        shares.length.toString();

    const uniqueCountryIds =
        new Set(
            shares.map(
                share =>
                    Number(share.countryId)
            )
        );

    sharedCountriesCount.textContent =
        uniqueCountryIds.size.toString();

    const ratings =
        shares
            .map(share =>
                Number(share.rating)
            )
            .filter(rating =>
                Number.isFinite(rating) &&
                rating > 0
            );

    if (ratings.length === 0) {
        averageRating.textContent =
            "—";

        return;
    }

    const sum =
        ratings.reduce(
            (total, rating) =>
                total + rating,
            0
        );

    averageRating.textContent =
        (sum / ratings.length)
            .toFixed(1);
}

function openCreateShareModal() {
    if (
        !isAdminUser() &&
        !userCanShare()
    ) {
        showPageMessage(
            "אינך מורשה לפרסם שיתופים.",
            "error"
        );

        return;
    }

    editingShareId = null;

    resetShareForm();

    shareFormLabel.textContent =
        "שיתוף חדש";

    shareFormTitle.textContent =
        "הוספת שיתוף";

    shareFormSubtitle.textContent =
        "ספר לקהילה על החוויה שלך.";

    saveShareButton.textContent =
        "פרסם שיתוף";

    openShareFormModal();
}


function openEditShareModal(share) {
    if (!canManageShare(share)) {
        showPageMessage(
            "אינך מורשה לערוך שיתוף זה.",
            "error"
        );

        return;
    }

    editingShareId =
        Number(share.shareId);

    shareCountryInput.value =
        share.countryId;

    shareTypeInput.value =
        share.shareType;

    shareContentInput.value =
        share.content || "";

    contentCharacterCount.textContent =
        shareContentInput.value.length
            .toString();

    selectedRating =
        share.rating == null
            ? null
            : Number(share.rating);

    updateRatingDisplay();

    shareFormLabel.textContent =
        "עדכון שיתוף";

    shareFormTitle.textContent =
        "עריכת שיתוף";

    shareFormSubtitle.textContent =
        "עדכן את תוכן השיתוף ושמור את השינויים.";

    saveShareButton.textContent =
        "שמור שינויים";

    openShareFormModal();
}


async function saveShare(event) {
    event.preventDefault();

    clearFormMessage();

    const request =
        getShareRequest();

    const validationMessage =
        validateShareRequest(request);

    if (validationMessage) {
        showFormMessage(
            validationMessage,
            "error"
        );

        return;
    }

    const isEditing =
        Number.isInteger(editingShareId) &&
        editingShareId > 0;

    setFormLoading(true);

    try {
        const response = await fetch(
            isEditing
                ? `${sharesApiUrl}/${editingShareId}`
                : sharesApiUrl,
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
                    isEditing
                        ? {
                            actorUserId:
                                Number(currentUser.userId),

                            countryId:
                                request.countryId,

                            shareType:
                                request.shareType,

                            content:
                                request.content,

                            rating:
                                request.rating
                        }
                        : {
                            userId:
                                Number(currentUser.userId),

                            countryId:
                                request.countryId,

                            shareType:
                                request.shareType,

                            content:
                                request.content,

                            rating:
                                request.rating
                        }
                )
            }
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "שמירת השיתוף נכשלה."
            );
        }

        closeShareFormModal();

        await loadShares();

        showPageMessage(
            isEditing
                ? "השיתוף עודכן בהצלחה."
                : "השיתוף פורסם בהצלחה.",
            "success"
        );
    } catch (error) {
        showFormMessage(
            translateMessage(error.message),
            "error"
        );
    } finally {
        setFormLoading(false);
    }
}


function getShareRequest() {
    return {
        countryId:
            Number(shareCountryInput.value),

        shareType:
            Number(shareTypeInput.value),

        content:
            shareContentInput.value.trim(),

        rating:
            selectedRating
    };
}


function validateShareRequest(request) {
    if (
        !Number.isInteger(request.countryId) ||
        request.countryId <= 0
    ) {
        return "יש לבחור מדינה.";
    }

    if (
        ![1, 2, 3].includes(
            request.shareType
        )
    ) {
        return "יש לבחור סוג שיתוף.";
    }

    if (!request.content) {
        return "יש להזין תוכן לשיתוף.";
    }

    if (request.content.length > 1000) {
        return "השיתוף יכול להכיל עד 1000 תווים.";
    }

    return "";
}

function handleShareAction(event) {
    const button =
        event.target.closest(
            "button[data-action]"
        );

    if (!button) {
        return;
    }

    const shareId =
        Number(button.dataset.shareId);

    const share =
        shares.find(
            item =>
                Number(item.shareId) ===
                shareId
        );

    if (!share) {
        return;
    }

    if (
        button.dataset.action ===
        "edit"
    ) {
        openEditShareModal(share);
    }

    if (
        button.dataset.action ===
        "delete"
    ) {
        openDeleteShareModal(share);
    }
}

function openDeleteShareModal(share) {
    if (!canManageShare(share)) {
        return;
    }

    pendingDeleteShare =
        share;

    deleteShareModal.hidden =
        false;

    document.body.style.overflow =
        "hidden";
}


function closeDeleteShareModal() {
    deleteShareModal.hidden =
        true;

    pendingDeleteShare =
        null;

    document.body.style.overflow =
        "";
}


async function deleteShare() {
    if (!pendingDeleteShare) {
        return;
    }

    setDeleteLoading(true);

    try {
        const response = await fetch(
            `${sharesApiUrl}/${pendingDeleteShare.shareId}?actorUserId=${currentUser.userId}`,
            {
                method: "DELETE",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "מחיקת השיתוף נכשלה."
            );
        }

        closeDeleteShareModal();

        await loadShares();

        showPageMessage(
            "השיתוף נמחק בהצלחה.",
            "success"
        );
    } catch (error) {
        closeDeleteShareModal();

        showPageMessage(
            translateMessage(error.message),
            "error"
        );
    } finally {
        setDeleteLoading(false);
    }
}

function handleRatingClick(event) {
    const star =
        event.target.closest(
            "[data-rating]"
        );

    if (!star) {
        return;
    }

    selectedRating =
        Number(star.dataset.rating);

    updateRatingDisplay();
}


function updateRatingDisplay() {
    const stars =
        ratingSelector.querySelectorAll(
            "[data-rating]"
        );

    stars.forEach(
        function (star) {
            const value =
                Number(star.dataset.rating);

            const selected =
                selectedRating !== null &&
                value <= selectedRating;

            star.textContent =
                selected
                    ? "★"
                    : "☆";

            star.classList.toggle(
                "selected",
                selected
            );
        }
    );
}

function openShareFormModal() {
    shareFormModal.hidden =
        false;

    document.body.style.overflow =
        "hidden";
}


function closeShareFormModal() {
    shareFormModal.hidden =
        true;

    editingShareId =
        null;

    resetShareForm();

    document.body.style.overflow =
        "";
}


function resetShareForm() {
    shareForm.reset();

    selectedRating = null;

    contentCharacterCount.textContent =
        "0";

    updateRatingDisplay();
    clearFormMessage();
}

function clearFilters() {
    searchInput.value = "";
    countryFilter.value = "";
    shareTypeFilter.value = "";
    ratingFilter.value = "";
    sortDirectionFilter.value = "desc";

    loadShares();
}


function showLoading() {
    loadingState.hidden = false;
    sharesGrid.hidden = true;
    emptyState.hidden = true;
    resultsCount.textContent = "טוען...";
    setRefreshLoading(true);
}


function hideLoading() {
    loadingState.hidden = true;
}


function setRefreshLoading(isLoading) {
    refreshSharesButton.disabled =
        isLoading;

    refreshSharesButton.textContent =
        isLoading
            ? "טוען..."
            : "↻ רענון";
}


function setFormLoading(isLoading) {
    saveShareButton.disabled =
        isLoading;

    cancelShareFormButton.disabled =
        isLoading;

    closeShareFormButton.disabled =
        isLoading;
}


function setDeleteLoading(isLoading) {
    approveDeleteShareButton.disabled =
        isLoading;

    cancelDeleteShareButton.disabled =
        isLoading;

    approveDeleteShareButton.textContent =
        isLoading
            ? "מוחק..."
            : "מחק שיתוף";
}

function showPageMessage(message, type) {
    clearTimeout(messageTimer);

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
    pageMessage.textContent = "";
    pageMessage.className = "page-message";
}


function showFormMessage(message, type) {
    shareFormMessage.textContent =
        message;

    shareFormMessage.className =
        `modal-message ${type}`;
}


function clearFormMessage() {
    shareFormMessage.textContent = "";
    shareFormMessage.className = "modal-message";
}

function getShareTypeText(shareType) {
    const values = {
        1: "חוויה",
        2: "המלצה",
        3: "טיפ"
    };

    return values[Number(shareType)] ||
        "שיתוף";
}


function getStars(rating) {
    if (!rating) {
        return "ללא דירוג";
    }

    return "★".repeat(rating) +
        "☆".repeat(5 - rating);
}


function formatDate(dateValue) {
    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
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


function getResultsText(count) {
    return count === 1
        ? "תוצאה אחת"
        : `${count} תוצאות`;
}


function translateContinent(name) {
    const translations = {
        africa: "אפריקה",
        asia: "אסיה",
        europe: "אירופה",
        "north america": "אמריקה הצפונית",
        "south america": "אמריקה הדרומית",
        oceania: "אוקיאניה",
        antarctica: "אנטארקטיקה"
    };

    const key =
        String(name || "")
            .trim()
            .toLowerCase();

    return translations[key] ||
        name ||
        "לא הוגדרה";
}


function translateMessage(message) {
    const value =
        String(message || "");

    if (
        value.includes("Failed to fetch") ||
        value.includes("NetworkError")
    ) {
        return "לא ניתן להתחבר לשרת. ודא שהשרת פועל.";
    }

    if (
        value.includes(
            "User is not allowed to publish shares"
        )
    ) {
        return "אינך מורשה לפרסם, לערוך או למחוק שיתופים.";
    }

    if (
        value.includes(
            "User is not allowed to update this share"
        )
    ) {
        return "אינך מורשה לערוך שיתוף זה.";
    }

    if (
        value.includes(
            "User is not allowed to delete this share"
        )
    ) {
        return "אינך מורשה למחוק שיתוף זה.";
    }

    return value ||
        "אירעה שגיאה לא צפויה.";
}


function getInitial(fullName) {
    const name =
        String(fullName || "").trim();

    return name
        ? name.charAt(0).toUpperCase()
        : "U";
}


function closeMenus() {
    userDropdown.classList.remove("open");
    mainNavigation.classList.remove("open");
}


function logout() {
    clearLoginData();
    window.location.replace("login.html");
}


function clearLoginData() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
}


function getMessage(data) {
    if (typeof data === "string") {
        return data;
    }

    return data?.message || "";
}


async function readResponseBody(response) {
    const text =
        await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        return {
            message: text
        };
    }
}


function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}