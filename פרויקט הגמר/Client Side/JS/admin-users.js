const currentUserString = localStorage.getItem("currentUser");

const isLoggedIn = localStorage.getItem("isLoggedIn");

if (!currentUserString || isLoggedIn !== "true") {
    window.location.replace("login.html");
}

let currentUser;

try {
    currentUser = JSON.parse(currentUserString);
} catch (error) {
    clearLoginData();
    window.location.replace("login.html");
}

if (!isCurrentUserAdmin()) {
    window.location.replace("index.html");
}

const apiBaseUrl = "https://localhost:7296/api/Users";

const adminApiUrl = "https://localhost:7296/api/Admin";

let allUsers = [];
let filteredUsers = [];

let pendingAction = null;
let messageTimer = null;

const userMenuButton = document.getElementById("userMenuButton");

const userDropdown = document.getElementById("userDropdown");

const mobileMenuButton = document.getElementById("mobileMenuButton");

const mainNavigation = document.getElementById("mainNavigation");

const logoutButton = document.getElementById("logoutButton");

const userAvatar = document.getElementById("userAvatar");

const headerUserName = document.getElementById("headerUserName");

const headerUserRole = document.getElementById("headerUserRole");

const totalUsers = document.getElementById("totalUsers");

const activeUsers = document.getElementById("activeUsers");

const lockedUsers = document.getElementById("lockedUsers");

const dailyLogins = document.getElementById("dailyLogins");

const importedCountries =document.getElementById("importedCountries");

const savedCountries =document.getElementById("savedCountries");

const createdShares =document.getElementById("createdShares");

const searchInput = document.getElementById("searchInput");

const statusFilter = document.getElementById("statusFilter");

const shareFilter = document.getElementById("shareFilter");

const refreshButton = document.getElementById("refreshButton");

const adminMessage = document.getElementById("adminMessage");

const resultsCount = document.getElementById("resultsCount");

const usersTableBody = document.getElementById("usersTableBody");

const tableWrapper = document.querySelector(".table-wrapper");

const emptyState = document.getElementById("emptyState");

const confirmModal = document.getElementById("confirmModal");

const confirmTitle = document.getElementById("confirmTitle");

const confirmText = document.getElementById("confirmText");

const cancelConfirmButton = document.getElementById("cancelConfirmButton");

const approveConfirmButton = document.getElementById("approveConfirmButton");

initializePage();

async function initializePage() {
    showAdminInformation();
    addEvents();

    await Promise.all([
        loadUsers(),
        loadAdminStatistics()
    ]);
}

async function loadAdminStatistics() {
    try {
        const response = await fetch(
            `${adminApiUrl}/statistics`,
            {
                method: "GET",
                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );

        const data =
            await readResponseBody(response);

        if (
            !response.ok ||
            !data.statistics
        ) {
            throw new Error(
                data.message ||
                "טעינת נתוני השימוש נכשלה."
            );
        }

        const statistics =
            data.statistics;

        dailyLogins.textContent =
            Number(
                statistics.dailyLogins || 0
            ).toString();

        importedCountries.textContent =
            Number(
                statistics.importedCountries || 0
            ).toString();

        savedCountries.textContent =
            Number(
                statistics.savedCountries || 0
            ).toString();

        createdShares.textContent =
            Number(
                statistics.createdShares || 0
            ).toString();
    } catch (error) {
        console.error(
            "Load admin statistics error:",
            error
        );

        dailyLogins.textContent = "-";
        importedCountries.textContent = "-";
        savedCountries.textContent = "-";
        createdShares.textContent = "-";

        showMessage(
            translateServerMessage(
                error.message ||
                "לא ניתן לטעון את נתוני השימוש."
            ),
            "error"
        );
    }
}

function isCurrentUserAdmin() {
    return (
        Number(currentUser.roleId) === 2 ||
        String(currentUser.roleName).toLowerCase() === "admin"
    );
}

function showAdminInformation() {
    const fullName =
        currentUser.fullName || "מנהל";

    headerUserName.textContent =
        fullName;

    headerUserRole.textContent =
        "Admin";

    userAvatar.textContent =
        getInitial(fullName);
}

function addEvents() {
    userMenuButton.addEventListener(
        "click",
        function (event) {
            event.stopPropagation();

            userDropdown.classList.toggle("open");

            const isOpen =
                userDropdown.classList.contains("open");

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

            mainNavigation.classList.toggle("open");
        }
    );

    logoutButton.addEventListener(
        "click",
        logout
    );

    document.addEventListener(
        "click",
        function () {
            closeMenus();
        }
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
            if (window.innerWidth > 900) {
                mainNavigation.classList.remove("open");
            }
        }
    );

    searchInput.addEventListener(
        "input",
        applyFilters
    );

    statusFilter.addEventListener(
        "change",
        applyFilters
    );

    shareFilter.addEventListener(
        "change",
        applyFilters
    );

    refreshButton.addEventListener(
        "click",
        async function () {
            setRefreshLoading(true);

            await Promise.all([
                loadUsers(false),
                loadAdminStatistics()
            ]);

            setRefreshLoading(false);

            showMessage(
                "נתוני הניהול עודכנו בהצלחה.",
                "success"
            );
        }
    );

    usersTableBody.addEventListener(
        "click",
        handleTableAction
    );

    cancelConfirmButton.addEventListener(
        "click",
        closeConfirmModal
    );

    approveConfirmButton.addEventListener(
        "click",
        executePendingAction
    );

    confirmModal.addEventListener(
        "click",
        function (event) {
            if (
                event.target.classList.contains(
                    "confirm-overlay"
                )
            ) {
                closeConfirmModal();
            }
        }
    );

    document.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Escape" &&
                !confirmModal.hidden
            ) {
                closeConfirmModal();
            }
        }
    );
}

async function loadUsers(showSuccessMessage = false) {
    clearMessage();
    showLoadingState();

    try {
        const response = await fetch(
            apiBaseUrl,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                data.message ||
                "טעינת המשתמשים נכשלה."
            );
        }

        allUsers =
            Array.isArray(data.users)
                ? data.users
                : [];

        updateSummary();
        applyFilters();

        if (showSuccessMessage) {
            showMessage(
                "רשימת המשתמשים עודכנה בהצלחה.",
                "success"
            );
        }
    } catch (error) {
        console.error(
            "Load users error:",
            error
        );

        allUsers = [];
        filteredUsers = [];

        updateSummary();
        renderUsers();

        showMessage(
            translateServerMessage(
                error.message ||
                "לא ניתן לטעון את המשתמשים."
            ),
            "error"
        );
    } 
}

function applyFilters() {
    const searchValue =
        searchInput.value.trim().toLowerCase();

    const selectedStatus =
        statusFilter.value;

    const selectedSharePermission =
        shareFilter.value;

    filteredUsers = allUsers.filter(
        function (user) {
            const fullName =
                String(user.fullName || "").toLowerCase();

            const email =
                String(user.email || "").toLowerCase();

            const matchesSearch =
                searchValue === "" ||
                fullName.includes(searchValue) ||
                email.includes(searchValue);

            let matchesStatus = true;

            if (selectedStatus === "active") {
                matchesStatus =
                    user.isLocked !== true;
            } else if (selectedStatus === "locked") {
                matchesStatus =
                    user.isLocked === true;
            }

            let matchesSharePermission = true;

            if (selectedSharePermission === "allowed") {
                matchesSharePermission =
                    user.canShare === true;
            } else if (
                selectedSharePermission === "blocked"
            ) {
                matchesSharePermission =
                    user.canShare !== true;
            }

            return (
                matchesSearch &&
                matchesStatus &&
                matchesSharePermission
            );
        }
    );

    renderUsers();
}

function updateSummary() {
    const total =
        allUsers.length;

    const locked =
        allUsers.filter(
            function (user) {
                return user.isLocked === true;
            }
        ).length;

    const active =
        total - locked;

    totalUsers.textContent =
        total.toString();

    activeUsers.textContent =
        active.toString();

    lockedUsers.textContent =
        locked.toString();
}

function renderUsers() {
    usersTableBody.innerHTML = "";

    resultsCount.textContent =
        `${filteredUsers.length} תוצאות`;

    if (filteredUsers.length === 0) {
        tableWrapper.hidden = true;
        emptyState.hidden = false;
        return;
    }

    tableWrapper.hidden = false;
    emptyState.hidden = true;

    filteredUsers.forEach(
        function (user) {
            usersTableBody.appendChild(
                createUserRow(user)
            );
        }
    );
}

function createUserRow(user) {
    const row =
        document.createElement("tr");

    const isCurrentAccount =
        Number(user.userId) ===
        Number(currentUser.userId);

    if (isCurrentAccount) {
        row.classList.add("current-admin-row");
    }

    const fullName =
        user.fullName || "ללא שם";

    const email =
        user.email || "לא הוגדר";

    const roleName =
        user.roleName ||
        (
            Number(user.roleId) === 2
                ? "Admin"
                : "User"
        );

    const roleClass =
        roleName.toLowerCase() === "admin"
            ? "role-admin"
            : "role-user";

    const statusText =
        user.isLocked
            ? "נעול"
            : "פעיל";

    const statusClass =
        user.isLocked
            ? "status-locked"
            : "status-active";

    const shareText =
        user.canShare
            ? "מאושר"
            : "חסום";

    const shareClass =
        user.canShare
            ? "share-allowed"
            : "share-blocked";

    const lockButtonText =
        user.isLocked
            ? "שחרור"
            : "נעילה";

    const lockButtonClass =
        user.isLocked
            ? "unlock-action"
            : "lock-action";

    const shareButtonText =
        user.canShare
            ? "חסום שיתוף"
            : "אפשר שיתוף";

    const accountNote =
        isCurrentAccount
            ? `<small>החשבון שלך</small>`
            : `<small>ID: ${escapeHtml(user.userId)}</small>`;

    row.innerHTML = `
        <td>
            <div class="user-cell">
                <span class="table-avatar">
                    ${escapeHtml(getInitial(fullName))}
                </span>

                <span class="user-cell-details">
                    <strong>
                        ${escapeHtml(fullName)}
                    </strong>

                    ${accountNote}
                </span>
            </div>
        </td>

        <td>
            ${escapeHtml(email)}
        </td>

        <td>
            <span class="badge ${roleClass}">
                ${escapeHtml(roleName)}
            </span>
        </td>

        <td>
            <span class="badge ${statusClass}">
                ${statusText}
            </span>
        </td>

        <td>
            <span class="badge ${shareClass}">
                ${shareText}
            </span>
        </td>

        <td>
            ${escapeHtml(
        formatDate(user.lastLoginAt)
    )}
        </td>

        <td>
            <div class="action-buttons">
                <button
                    type="button"
                    class="table-action ${lockButtonClass}"
                    data-action="lock"
                    data-user-id="${escapeHtml(user.userId)}"
                    ${isCurrentAccount ? "disabled" : ""}
                >
                    ${lockButtonText}
                </button>

                <button
                    type="button"
                    class="table-action"
                    data-action="share"
                    data-user-id="${escapeHtml(user.userId)}"
                    ${isCurrentAccount ? "disabled" : ""}
                >
                    ${shareButtonText}
                </button>

                <button
                    type="button"
                    class="table-action delete-action"
                    data-action="delete"
                    data-user-id="${escapeHtml(user.userId)}"
                    ${isCurrentAccount ? "disabled" : ""}
                >
                    מחיקה
                </button>
            </div>
        </td>
    `;

    return row;
}

function handleTableAction(event) {
    const button =
        event.target.closest(
            "button[data-action]"
        );

    if (!button || button.disabled) {
        return;
    }

    const userId =
        Number(button.dataset.userId);

    const action =
        button.dataset.action;

    const user =
        allUsers.find(
            function (item) {
                return (
                    Number(item.userId) === userId
                );
            }
        );

    if (!user) {
        showMessage(
            "המשתמש לא נמצא.",
            "error"
        );

        return;
    }

    if (
        Number(user.userId) ===
        Number(currentUser.userId)
    ) {
        showMessage(
            "לא ניתן לבצע פעולה זו על חשבון המנהל המחובר.",
            "error"
        );

        return;
    }

    if (action === "lock") {
        prepareLockAction(user);
    } else if (action === "share") {
        prepareShareAction(user);
    } else if (action === "delete") {
        prepareDeleteAction(user);
    }
}

function prepareLockAction(user) {
    const newLockStatus =
        !user.isLocked;

    pendingAction = {
        type: "lock",
        user: user,
        value: newLockStatus
    };

    confirmTitle.textContent =
        newLockStatus
            ? "נעילת משתמש"
            : "שחרור משתמש";

    confirmText.textContent =
        newLockStatus
            ? `האם לנעול את החשבון של ${user.fullName}? המשתמש לא יוכל להתחבר למערכת.`
            : `האם להסיר את הנעילה מהחשבון של ${user.fullName}?`;

    approveConfirmButton.textContent =
        newLockStatus
            ? "נעל משתמש"
            : "שחרר משתמש";

    approveConfirmButton.classList.remove(
        "share-confirm-button"
    );

    openConfirmModal();
}

function prepareShareAction(user) {
    const newSharePermission =
        !user.canShare;

    pendingAction = {
        type: "share",
        user: user,
        value: newSharePermission
    };

    confirmTitle.textContent =
        newSharePermission
            ? "אישור הרשאת שיתוף"
            : "חסימת הרשאת שיתוף";

    confirmText.textContent =
        newSharePermission
            ? `האם לאפשר ל־${user.fullName} לשתף תוכן במערכת?`
            : `האם לחסום את אפשרות השיתוף עבור ${user.fullName}?`;

    approveConfirmButton.textContent =
        newSharePermission
            ? "אפשר שיתוף"
            : "חסום שיתוף";

    openConfirmModal();
}

function prepareDeleteAction(user) {
    pendingAction = {
        type: "delete",
        user: user
    };

    confirmTitle.textContent =
        "מחיקת משתמש";

    confirmText.textContent =
        `האם למחוק לצמיתות את המשתמש ${user.fullName}? פעולה זו תמחק גם את הנתונים הקשורים אליו ולא ניתן לבטל אותה.`;

    approveConfirmButton.textContent =
        "מחק משתמש";

    openConfirmModal();
}

function openConfirmModal() {
    confirmModal.hidden = false;

    document.body.style.overflow =
        "hidden";
}

function closeConfirmModal() {
    confirmModal.hidden = true;

    pendingAction = null;

    approveConfirmButton.disabled =
        false;

    cancelConfirmButton.disabled =
        false;

    document.body.style.overflow =
        "";
}

async function executePendingAction() {
    if (!pendingAction) {
        return;
    }

    approveConfirmButton.disabled =
        true;

    cancelConfirmButton.disabled =
        true;

    const originalButtonText =
        approveConfirmButton.textContent;

    approveConfirmButton.textContent =
        "מבצע פעולה...";

    try {
        if (pendingAction.type === "lock") {
            await updateLockStatus(
                pendingAction.user,
                pendingAction.value
            );
        } else if (
            pendingAction.type === "share"
        ) {
            await updateSharePermission(
                pendingAction.user,
                pendingAction.value
            );
        } else if (
            pendingAction.type === "delete"
        ) {
            await deleteUser(
                pendingAction.user
            );
        }

        closeConfirmModal();
    } catch (error) {
        console.error(
            "Admin action error:",
            error
        );

        showMessage(
            translateServerMessage(
                error.message ||
                "הפעולה נכשלה."
            ),
            "error"
        );

        approveConfirmButton.disabled = false;

        cancelConfirmButton.disabled = false;

        approveConfirmButton.textContent = originalButtonText;
    }
}

async function updateLockStatus(
    user,
    newLockStatus
) {
    const response = await fetch(
        `${apiBaseUrl}/${user.userId}/lock`,
        {
            method: "PUT",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                isLocked: newLockStatus
            })
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw new Error(
            data.message ||
            "עדכון מצב הנעילה נכשל."
        );
    }

    user.isLocked =
        newLockStatus;

    updateSummary();
    applyFilters();

    showMessage(
        newLockStatus
            ? "המשתמש ננעל בהצלחה."
            : "נעילת המשתמש הוסרה בהצלחה.",
        "success"
    );
}

async function updateSharePermission(
    user,
    newSharePermission
) {
    const response = await fetch(
        `${apiBaseUrl}/${user.userId}/share-permission`,
        {
            method: "PUT",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                canShare: newSharePermission
            })
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw new Error(
            data.message ||
            "עדכון הרשאת השיתוף נכשל."
        );
    }

    user.canShare =
        newSharePermission;

    applyFilters();

    showMessage(
        newSharePermission
            ? "הרשאת השיתוף הופעלה בהצלחה."
            : "הרשאת השיתוף נחסמה בהצלחה.",
        "success"
    );
}

async function deleteUser(user) {
    const response = await fetch(
        `${apiBaseUrl}/${user.userId}`,
        {
            method: "DELETE",
            headers: {
                "Accept": "application/json"
            }
        }
    );

    const data =
        await readResponseBody(response);

    if (!response.ok) {
        throw new Error(
            data.message ||
            "מחיקת המשתמש נכשלה."
        );
    }

    allUsers = allUsers.filter(
        function (item) {
            return (
                Number(item.userId) !==
                Number(user.userId)
            );
        }
    );

    updateSummary();
    applyFilters();

    showMessage(
        "המשתמש נמחק בהצלחה.",
        "success"
    );
}

function showLoadingState() {
    tableWrapper.hidden = false;
    emptyState.hidden = true;

    resultsCount.textContent =
        "טוען...";

    usersTableBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="7">
                <div class="loading-state">
                    <div class="spinner"></div>

                    <span>
                        טוען משתמשים...
                    </span>
                </div>
            </td>
        </tr>
    `;
}

function setRefreshLoading(isLoading) {
    refreshButton.disabled =
        isLoading;

    refreshButton.textContent =
        isLoading
            ? "טוען..."
            : "רענון";
}

function showMessage(message, type) {
    if (messageTimer) {
        clearTimeout(messageTimer);
    }

    adminMessage.textContent =
        message;

    adminMessage.className =
        `admin-message ${type}`;

    messageTimer = setTimeout(
        function () {
            clearMessage();
        },
        5000
    );
}

function clearMessage() {
    adminMessage.textContent = "";

    adminMessage.className =
        "admin-message";
}

function closeMenus() {
    userDropdown.classList.remove("open");
    mainNavigation.classList.remove("open");

    userMenuButton.setAttribute(
        "aria-expanded",
        "false"
    );
}

function formatDate(dateValue) {
    if (
        dateValue === null ||
        dateValue === undefined ||
        dateValue === ""
    ) {
        return "לא התחבר עדיין";
    }

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "תאריך לא תקין";
    }

    return date.toLocaleString(
        "he-IL",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function getInitial(fullName) {
    if (
        !fullName ||
        fullName.trim() === ""
    ) {
        return "U";
    }

    return fullName
        .trim()
        .charAt(0)
        .toUpperCase();
}

function translateServerMessage(message) {
    if (
        message.includes(
            "User was not found"
        )
    ) {
        return "המשתמש לא נמצא.";
    }

    if (
        message.includes(
            "DELETE statement conflicted"
        )
    ) {
        return "לא ניתן למחוק את המשתמש בגלל נתונים הקשורים אליו.";
    }

    if (
        message.includes(
            "Failed to fetch"
        )
    ) {
        return "לא ניתן להתחבר לשרת. ודא שהשרת פועל.";
    }

    return message;
}

async function readResponseBody(response) {
    const responseText =
        await response.text();

    if (responseText === "") {
        return {};
    }

    try {
        return JSON.parse(responseText);
    } catch (error) {
        return {
            message: responseText
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

    window.location.href =
        "login.html";
}