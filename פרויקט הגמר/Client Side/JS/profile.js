const currentUserString =
    localStorage.getItem("currentUser");

const isLoggedIn =
    localStorage.getItem("isLoggedIn");

if (!currentUserString || isLoggedIn !== "true") {
    window.location.replace("login.html");
}

let currentUser;

try {
    currentUser =
        JSON.parse(currentUserString);
} catch (error) {
    logout();
}

const usersApiUrl =
    "https://localhost:7296/api/Users";

const preferencesApiUrl =
    "https://localhost:7296/api/Preferences";

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const requestedMode =
    urlParams.get("mode");

const mode =
    requestedMode === "edit" ||
        requestedMode === "preferences"
        ? requestedMode
        : "view";


const pageTitle =
    document.getElementById("pageTitle");

const pageSubtitle =
    document.getElementById("pageSubtitle");

const accountSection =
    document.getElementById("accountSection");

const editSection =
    document.getElementById("editSection");

const passwordSection =
    document.getElementById("passwordSection");

const preferencesSection =
    document.getElementById("preferencesSection");

const viewProfileTab =
    document.getElementById("viewProfileTab");

const editProfileTab =
    document.getElementById("editProfileTab");

const preferencesTab =
    document.getElementById("preferencesTab");

const avatar =
    document.getElementById("avatar");

const userName =
    document.getElementById("userName");

const userEmail =
    document.getElementById("userEmail");

const userRole =
    document.getElementById("userRole");

const userStatus =
    document.getElementById("userStatus");

const userSharePermission =
    document.getElementById("userSharePermission");

const lastLogin =
    document.getElementById("lastLogin");

const txtFullName =
    document.getElementById("txtFullName");

const txtEmail =
    document.getElementById("txtEmail");

const profileUpdateMessage =
    document.getElementById("profileUpdateMessage");

const btnSave =
    document.getElementById("btnSave");

const txtPassword =
    document.getElementById("txtPassword");

const txtConfirmPassword =
    document.getElementById("txtConfirmPassword");

const toggleNewPassword =
    document.getElementById("toggleNewPassword");

const passwordUpdateMessage =
    document.getElementById("passwordUpdateMessage");

const btnPassword =
    document.getElementById("btnPassword");

const continentsLoading =
    document.getElementById("continentsLoading");

const continentsList =
    document.getElementById("continentsList");

const continentsMessage =
    document.getElementById("continentsMessage");

const languageSelect =
    document.getElementById("languageSelect");

const languageLevelSelect =
    document.getElementById("languageLevelSelect");

const addLanguageButton =
    document.getElementById("addLanguageButton");

const languagesMessage =
    document.getElementById("languagesMessage");

const languagesCount =
    document.getElementById("languagesCount");

const userLanguagesLoading =
    document.getElementById("userLanguagesLoading");

const userLanguagesList =
    document.getElementById("userLanguagesList");

const languagesEmptyState =
    document.getElementById("languagesEmptyState");

const btnHome =
    document.getElementById("btnHome");

const btnLogout =
    document.getElementById("btnLogout");

let allContinents = [];
let userContinents = [];

let allLanguages = [];
let languageLevels = [];
let userLanguages = [];

initializePage();

async function initializePage() {
    configureMode();
    addEvents();

    const loaded =
        await loadCurrentUser();

    if (!loaded) {
        showUserInformation();
    }

    if (mode === "preferences") {
        await loadPreferences();
    }
}

function configureMode() {
    accountSection.hidden = false;
    editSection.hidden = true;
    passwordSection.hidden = true;
    preferencesSection.hidden = true;

    viewProfileTab.classList.remove("active");
    editProfileTab.classList.remove("active");
    preferencesTab.classList.remove("active");

    if (mode === "edit") {
        pageTitle.textContent =
            "עריכת פרטים";

        pageSubtitle.textContent =
            "עדכון פרטי החשבון והסיסמה";

        editSection.hidden = false;
        passwordSection.hidden = false;

        editProfileTab.classList.add("active");

        return;
    }

    if (mode === "preferences") {
        pageTitle.textContent =
            "ההעדפות שלי";

        pageSubtitle.textContent =
            "ניהול יבשות מועדפות ושפות";

        accountSection.hidden = true;
        preferencesSection.hidden = false;

        preferencesTab.classList.add("active");

        return;
    }

    pageTitle.textContent =
        "הפרופיל שלי";

    pageSubtitle.textContent =
        "ניהול החשבון האישי";

    viewProfileTab.classList.add("active");
}

function addEvents() {
    btnHome.addEventListener(
        "click",
        function () {
            window.location.href =
                "index.html";
        }
    );

    btnLogout.addEventListener(
        "click",
        logout
    );

    btnSave.addEventListener(
        "click",
        updateUserDetails
    );

    btnPassword.addEventListener(
        "click",
        changePassword
    );

    toggleNewPassword.addEventListener(
        "click",
        togglePasswordsVisibility
    );

    addLanguageButton.addEventListener(
        "click",
        saveUserLanguage
    );

    userLanguagesList.addEventListener(
        "change",
        handleLanguageLevelChange
    );

    userLanguagesList.addEventListener(
        "click",
        handleDeleteLanguage
    );
}

async function loadCurrentUser() {
    try {
        const response = await fetch(
            `${usersApiUrl}/${currentUser.userId}`
        );

        const data =
            await readResponseBody(response);

        if (!response.ok || !data.user) {
            return false;
        }

        currentUser =
            data.user;

        saveCurrentUser();
        showUserInformation();

        return true;
    } catch (error) {
        console.error(
            "Load user error:",
            error
        );

        return false;
    }
}


function showUserInformation() {
    const fullName =
        currentUser.fullName || "משתמש";

    avatar.textContent =
        getInitial(fullName);

    userName.textContent =
        fullName;

    userEmail.textContent =
        currentUser.email || "לא הוגדר";

    userRole.textContent =
        currentUser.roleName ||
        (
            Number(currentUser.roleId) === 2
                ? "Admin"
                : "User"
        );

    lastLogin.textContent =
        formatDate(
            currentUser.lastLoginAt
        );

    txtFullName.value =
        fullName;

    txtEmail.value =
        currentUser.email || "";

    showUserStatus();
    showSharePermission();
}


function showUserStatus() {
    if (currentUser.isLocked === true) {
        userStatus.textContent =
            "נעול";

        setBadgeStyle(
            userStatus,
            "#ffd7dd",
            "rgba(255, 113, 133, 0.3)",
            "rgba(255, 75, 100, 0.11)"
        );

        return;
    }

    userStatus.textContent =
        "פעיל";

    setBadgeStyle(
        userStatus,
        "#c5ffe7",
        "rgba(82, 232, 167, 0.25)",
        "rgba(53, 194, 137, 0.13)"
    );
}


function showSharePermission() {
    if (currentUser.canShare === false) {
        userSharePermission.textContent =
            "השיתוף חסום";

        setBadgeStyle(
            userSharePermission,
            "#ffe4ad",
            "rgba(255, 200, 97, 0.28)",
            "rgba(190, 132, 39, 0.13)"
        );

        return;
    }

    userSharePermission.textContent =
        "השיתוף מאושר";

    setBadgeStyle(
        userSharePermission,
        "#c5ffe7",
        "rgba(82, 232, 167, 0.25)",
        "rgba(53, 194, 137, 0.13)"
    );
}


function setBadgeStyle(
    element,
    color,
    borderColor,
    background
) {
    element.style.color = color;
    element.style.borderColor = borderColor;
    element.style.background = background;
}

async function updateUserDetails() {
    clearMessage(
        profileUpdateMessage
    );

    const fullName =
        txtFullName.value.trim();

    const email =
        txtEmail.value.trim();

    if (fullName.length < 2) {
        showMessage(
            profileUpdateMessage,
            "יש להזין שם באורך של לפחות 2 תווים.",
            "error"
        );

        return;
    }

    if (!isValidEmail(email)) {
        showMessage(
            profileUpdateMessage,
            "כתובת הדוא״ל אינה תקינה.",
            "error"
        );

        return;
    }

    if (
        fullName === currentUser.fullName &&
        email === currentUser.email
    ) {
        showMessage(
            profileUpdateMessage,
            "לא בוצעו שינויים.",
            "error"
        );

        return;
    }

    setButtonLoading(
        btnSave,
        true,
        "שומר...",
        "שמור שינויים"
    );

    try {
        const response = await fetch(
            `${usersApiUrl}/${currentUser.userId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    fullName: fullName,
                    email: email
                })
            }
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                data.message ||
                "עדכון הפרטים נכשל."
            );
        }

        currentUser.fullName =
            fullName;

        currentUser.email =
            email;

        saveCurrentUser();
        showUserInformation();

        showMessage(
            profileUpdateMessage,
            "הפרטים עודכנו בהצלחה.",
            "success"
        );
    } catch (error) {
        showMessage(
            profileUpdateMessage,
            translateMessage(error.message),
            "error"
        );
    } finally {
        setButtonLoading(
            btnSave,
            false,
            "שומר...",
            "שמור שינויים"
        );
    }
}

async function changePassword() {
    clearMessage(
        passwordUpdateMessage
    );

    const password =
        txtPassword.value;

    const confirmPassword =
        txtConfirmPassword.value;

    if (!isValidPassword(password)) {
        showMessage(
            passwordUpdateMessage,
            "הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה ואות קטנה באנגלית.",
            "error"
        );

        return;
    }

    if (password !== confirmPassword) {
        showMessage(
            passwordUpdateMessage,
            "הסיסמאות אינן תואמות.",
            "error"
        );

        return;
    }

    setButtonLoading(
        btnPassword,
        true,
        "משנה...",
        "שנה סיסמה"
    );

    try {
        const response = await fetch(
            `${usersApiUrl}/${currentUser.userId}/password`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    newPassword: password
                })
            }
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                data.message ||
                "שינוי הסיסמה נכשל."
            );
        }

        txtPassword.value = "";
        txtConfirmPassword.value = "";

        resetPasswordVisibility();

        showMessage(
            passwordUpdateMessage,
            "הסיסמה שונתה בהצלחה.",
            "success"
        );
    } catch (error) {
        showMessage(
            passwordUpdateMessage,
            translateMessage(error.message),
            "error"
        );
    } finally {
        setButtonLoading(
            btnPassword,
            false,
            "משנה...",
            "שנה סיסמה"
        );
    }
}

async function loadPreferences() {
    await Promise.all([
        loadAllContinents(),
        loadUserContinents(),
        loadAllLanguages(),
        loadLanguageLevels(),
        loadUserLanguages()
    ]);
}

async function loadAllContinents() {
    continentsLoading.hidden = false;

    try {
        const response = await fetch(
            `${preferencesApiUrl}/continents`
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "טעינת היבשות נכשלה."
            );
        }

        allContinents =
            Array.isArray(data)
                ? data
                : [];

        renderContinents();
    } catch (error) {
        showMessage(
            continentsMessage,
            translateMessage(error.message),
            "error"
        );
    } finally {
        continentsLoading.hidden = true;
    }
}


async function loadUserContinents() {
    try {
        const response = await fetch(
            `${preferencesApiUrl}/${currentUser.userId}/continents`
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "טעינת יבשות המשתמש נכשלה."
            );
        }

        userContinents =
            Array.isArray(data)
                ? data
                : [];

        renderContinents();
    } catch (error) {
        showMessage(
            continentsMessage,
            translateMessage(error.message),
            "error"
        );
    }
}


function renderContinents() {
    if (
        allContinents.length === 0
    ) {
        return;
    }

    continentsList.innerHTML = "";

    allContinents.forEach(
        function (continent) {
            const continentId =
                Number(continent.continentId);

            const continentName =
                continent.continentName;

            const selected =
                userContinents.some(
                    function (item) {
                        return (
                            Number(
                                item.continentId
                            ) === continentId
                        );
                    }
                );

            const label =
                document.createElement("label");

            label.className =
                "continent-option";

            if (selected) {
                label.classList.add(
                    "selected"
                );
            }

            label.innerHTML = `
                <input
                    type="checkbox"
                    value="${continentId}"
                    ${selected ? "checked" : ""}
                >

                <div>
                    <strong>
                        ${escapeHtml(continentName)}
                    </strong>

                    <small>
                        ${selected
                    ? "יבשת שנבחרה"
                    : "לחץ להוספה"
                }
                    </small>
                </div>
            `;

            const checkbox =
                label.querySelector(
                    "input"
                );

            checkbox.addEventListener(
                "change",
                async function () {
                    await toggleContinent(
                        continentId,
                        checkbox.checked
                    );
                }
            );

            continentsList.appendChild(
                label
            );
        }
    );
}


async function toggleContinent(
    continentId,
    shouldAdd
) {
    clearMessage(
        continentsMessage
    );

    try {
        let response;

        if (shouldAdd) {
            response = await fetch(
                `${preferencesApiUrl}/${currentUser.userId}/continents`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        continentId:
                            continentId
                    })
                }
            );
        } else {
            response = await fetch(
                `${preferencesApiUrl}/${currentUser.userId}/continents/${continentId}`,
                {
                    method: "DELETE"
                }
            );
        }

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "עדכון היבשת נכשל."
            );
        }

        await loadUserContinents();

        showMessage(
            continentsMessage,
            shouldAdd
                ? "היבשת נוספה להעדפות."
                : "היבשת הוסרה מההעדפות.",
            "success"
        );
    } catch (error) {
        await loadUserContinents();

        showMessage(
            continentsMessage,
            translateMessage(error.message),
            "error"
        );
    }
}

async function loadAllLanguages() {
    try {
        const response = await fetch(
            `${preferencesApiUrl}/languages`
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "טעינת השפות נכשלה."
            );
        }

        allLanguages =
            Array.isArray(data)
                ? data
                : [];

        fillLanguageSelect();
    } catch (error) {
        showMessage(
            languagesMessage,
            translateMessage(error.message),
            "error"
        );
    }
}


async function loadLanguageLevels() {
    try {
        const response = await fetch(
            `${preferencesApiUrl}/language-levels`
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "טעינת רמות השפה נכשלה."
            );
        }

        languageLevels =
            Array.isArray(data)
                ? data
                : [];

        fillLevelSelect();
    } catch (error) {
        showMessage(
            languagesMessage,
            translateMessage(error.message),
            "error"
        );
    }
}


function fillLanguageSelect() {
    languageSelect.innerHTML = `
        <option value="">
            בחר שפה
        </option>
    `;

    allLanguages.forEach(
        function (language) {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                language.languageId;

            option.textContent =
                language.languageName;

            languageSelect.appendChild(
                option
            );
        }
    );
}


function fillLevelSelect() {
    languageLevelSelect.innerHTML = `
        <option value="">
            בחר רמה
        </option>
    `;

    languageLevels.forEach(
        function (level) {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                level.levelId;

            option.textContent =
                translateLevel(
                    level.levelName
                );

            languageLevelSelect.appendChild(
                option
            );
        }
    );
}

async function loadUserLanguages() {
    userLanguagesLoading.hidden = false;

    try {
        const response = await fetch(
            `${preferencesApiUrl}/${currentUser.userId}/languages`
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "טעינת שפות המשתמש נכשלה."
            );
        }

        userLanguages =
            Array.isArray(data)
                ? data
                : [];

        renderUserLanguages();
    } catch (error) {
        userLanguages = [];
        renderUserLanguages();

        showMessage(
            languagesMessage,
            translateMessage(error.message),
            "error"
        );
    } finally {
        userLanguagesLoading.hidden = true;
    }
}


function renderUserLanguages() {
    userLanguagesList.innerHTML = "";

    languagesCount.textContent =
        userLanguages.length === 1
            ? "שפה אחת"
            : `${userLanguages.length} שפות`;

    languagesEmptyState.hidden =
        userLanguages.length > 0;

    userLanguages.forEach(
        function (language) {
            const item =
                document.createElement(
                    "article"
                );

            item.className =
                "user-language-item";

            item.innerHTML = `
                <div class="language-information">
                    <span class="language-symbol">
                        🗣️
                    </span>

                    <div>
                        <strong>
                            ${escapeHtml(
                language.languageName
            )}
                        </strong>

                        <small>
                            רמת שליטה:
                            ${escapeHtml(
                translateLevel(
                    language.levelName
                )
            )}
                        </small>
                    </div>
                </div>

                <select
                    class="language-level-select"
                    data-language-id="${language.languageId}"
                >
                    ${createLevelOptions(
                language.levelId
            )}
                </select>

                <button
                    type="button"
                    class="remove-language-button"
                    data-language-id="${language.languageId}"
                >
                    הסר שפה
                </button>
            `;

            userLanguagesList.appendChild(
                item
            );
        }
    );
}


async function saveUserLanguage() {
    clearMessage(
        languagesMessage
    );

    const languageId =
        Number(languageSelect.value);

    const levelId =
        Number(languageLevelSelect.value);

    if (!languageId) {
        showMessage(
            languagesMessage,
            "יש לבחור שפה.",
            "error"
        );

        return;
    }

    if (!levelId) {
        showMessage(
            languagesMessage,
            "יש לבחור רמת שליטה.",
            "error"
        );

        return;
    }

    await sendLanguageToServer(
        languageId,
        levelId
    );
}


async function handleLanguageLevelChange(
    event
) {
    const select =
        event.target.closest(
            ".language-level-select"
        );

    if (!select) {
        return;
    }

    const languageId =
        Number(
            select.dataset.languageId
        );

    const levelId =
        Number(select.value);

    await sendLanguageToServer(
        languageId,
        levelId
    );
}


async function sendLanguageToServer(
    languageId,
    levelId
) {
    setButtonLoading(
        addLanguageButton,
        true,
        "שומר...",
        "הוסף שפה"
    );

    try {
        const response = await fetch(
            `${preferencesApiUrl}/${currentUser.userId}/languages`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    languageId:
                        languageId,

                    levelId:
                        levelId
                })
            }
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "שמירת השפה נכשלה."
            );
        }

        languageSelect.value = "";
        languageLevelSelect.value = "";

        await loadUserLanguages();

        showMessage(
            languagesMessage,
            "השפה נשמרה בהצלחה.",
            "success"
        );
    } catch (error) {
        showMessage(
            languagesMessage,
            translateMessage(error.message),
            "error"
        );
    } finally {
        setButtonLoading(
            addLanguageButton,
            false,
            "שומר...",
            "הוסף שפה"
        );
    }
}


async function handleDeleteLanguage(
    event
) {
    const button =
        event.target.closest(
            ".remove-language-button"
        );

    if (!button) {
        return;
    }

    const languageId =
        Number(
            button.dataset.languageId
        );

    const approved =
        confirm(
            "האם להסיר את השפה?"
        );

    if (!approved) {
        return;
    }

    try {
        const response = await fetch(
            `${preferencesApiUrl}/${currentUser.userId}/languages/${languageId}`,
            {
                method: "DELETE"
            }
        );

        const data =
            await readResponseBody(response);

        if (!response.ok) {
            throw new Error(
                getMessage(data) ||
                "מחיקת השפה נכשלה."
            );
        }

        await loadUserLanguages();

        showMessage(
            languagesMessage,
            "השפה הוסרה בהצלחה.",
            "success"
        );
    } catch (error) {
        showMessage(
            languagesMessage,
            translateMessage(error.message),
            "error"
        );
    }
}

function createLevelOptions(
    selectedLevelId
) {
    return languageLevels
        .map(
            function (level) {
                const selected =
                    Number(level.levelId) ===
                    Number(selectedLevelId);

                return `
                    <option
                        value="${level.levelId}"
                        ${selected ? "selected" : ""}
                    >
                        ${escapeHtml(
                    translateLevel(
                        level.levelName
                    )
                )}
                    </option>
                `;
            }
        )
        .join("");
}


function translateLevel(levelName) {
    const level =
        String(levelName || "")
            .toLowerCase();

    if (level === "beginner") {
        return "מתחיל";
    }

    if (level === "intermediate") {
        return "בינוני";
    }

    if (level === "advanced") {
        return "מתקדם";
    }

    if (level === "native") {
        return "שפת אם";
    }

    return levelName || "לא הוגדר";
}


function togglePasswordsVisibility() {
    const hidden =
        txtPassword.type === "password";

    txtPassword.type =
        hidden ? "text" : "password";

    txtConfirmPassword.type =
        hidden ? "text" : "password";

    toggleNewPassword.textContent =
        hidden ? "הסתר" : "הצג";
}


function resetPasswordVisibility() {
    txtPassword.type = "password";
    txtConfirmPassword.type = "password";
    toggleNewPassword.textContent = "הצג";
}


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


function isValidPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/
        .test(password);
}


function getInitial(fullName) {
    const name =
        String(fullName || "").trim();

    return name === ""
        ? "U"
        : name.charAt(0).toUpperCase();
}


function formatDate(value) {
    if (!value) {
        return "לא קיימת כניסה קודמת";
    }

    const date =
        new Date(value);

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


function showMessage(
    element,
    message,
    type
) {
    element.textContent = message;

    element.className =
        `profile-message ${type}`;
}


function clearMessage(element) {
    element.textContent = "";

    element.className =
        "profile-message";
}


function setButtonLoading(
    button,
    loading,
    loadingText,
    normalText
) {
    button.disabled = loading;

    button.textContent =
        loading
            ? loadingText
            : normalText;
}


function getMessage(data) {
    if (
        typeof data === "string"
    ) {
        return data;
    }

    return data?.message || "";
}


function translateMessage(message) {
    const text =
        String(message || "");

    if (
        text.includes("Failed to fetch")
    ) {
        return "לא ניתן להתחבר לשרת. ודא שהשרת פועל.";
    }

    if (
        text.includes(
            "Email already belongs"
        )
    ) {
        return "כתובת הדוא״ל כבר קיימת במערכת.";
    }

    if (
        text.includes(
            "New password must be different"
        )
    ) {
        return "הסיסמה החדשה חייבת להיות שונה מהסיסמה הקודמת.";
    }

    if (
        text.includes(
            "Could not add preferred continent"
        )
    ) {
        return "לא ניתן להוסיף את היבשת להעדפות.";
    }

    if (
        text.includes(
            "Could not delete preferred continent"
        )
    ) {
        return "לא ניתן להסיר את היבשת מההעדפות.";
    }

    if (
        text.includes(
            "Could not save language"
        )
    ) {
        return "לא ניתן לשמור את השפה.";
    }

    if (
        text.includes(
            "Could not delete language"
        )
    ) {
        return "לא ניתן למחוק את השפה.";
    }

    return text || "אירעה שגיאה.";
}


async function readResponseBody(response) {
    const text =
        await response.text();

    if (text === "") {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        return text;
    }
}


function saveCurrentUser() {
    localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
    );
}


function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function logout() {
    localStorage.removeItem(
        "currentUser"
    );

    localStorage.removeItem(
        "isLoggedIn"
    );

    window.location.href =
        "login.html";
}