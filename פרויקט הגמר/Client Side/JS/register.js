const registerForm = document.getElementById("registerForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const fullNameError = document.getElementById("fullNameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

const serverMessage = document.getElementById("serverMessage");
const registerButton = document.getElementById("registerButton");
const togglePasswordButton = document.getElementById("togglePassword");

const apiUrl = "https://localhost:7296/api/Users/register";

togglePasswordButton.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        confirmPasswordInput.type = "text";
        togglePasswordButton.textContent = "הסתר";
    } else {
        passwordInput.type = "password";
        confirmPasswordInput.type = "password";
        togglePasswordButton.textContent = "הצג";
    }
});

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearMessages();

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    const isValid = validateForm(
        fullName,
        email,
        password,
        confirmPassword
    );

    if (!isValid) {
        return;
    }

    setLoadingState(true);

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName: fullName,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage =
                data.message || "אירעה שגיאה במהלך ההרשמה.";

            showServerMessage(errorMessage, "error");
            return;
        }

        showServerMessage(
            "ההרשמה הושלמה בהצלחה. מעבירים אותך להתחברות...",
            "success"
        );

        registerForm.reset();

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1500);
    } catch (error) {
        console.error("Register error:", error);

        showServerMessage(
            "לא ניתן להתחבר לשרת. ודא שהשרת פועל ונסה שוב.",
            "error"
        );
    } finally {
        setLoadingState(false);
    }
});

function validateForm(fullName, email, password, confirmPassword) {
    let isValid = true;

    if (fullName === "") {
        fullNameError.textContent = "יש להזין שם מלא.";
        isValid = false;
    } else if (fullName.length < 2) {
        fullNameError.textContent =
            "השם חייב להכיל לפחות 2 תווים.";
        isValid = false;
    } else if (fullName.length > 100) {
        fullNameError.textContent =
            "השם יכול להכיל עד 100 תווים.";
        isValid = false;
    }

    if (email === "") {
        emailError.textContent = "יש להזין כתובת דוא״ל.";
        isValid = false;
    } else if (!isValidEmail(email)) {
        emailError.textContent = "כתובת הדוא״ל אינה תקינה.";
        isValid = false;
    } else if (email.length > 150) {
        emailError.textContent =
            "כתובת הדוא״ל ארוכה מדי.";
        isValid = false;
    }

    if (password === "") {
        passwordError.textContent = "יש להזין סיסמה.";
        isValid = false;
    }
    else if (!isValidPassword(password)) {
        passwordError.textContent =
            "הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה אחת ואות קטנה אחת באנגלית.";
        isValid = false;
    }

    if (confirmPassword === "") {
        confirmPasswordError.textContent =
            "יש להזין שוב את הסיסמה.";
        isValid = false;
    } else if (password !== confirmPassword) {
        confirmPasswordError.textContent =
            "הסיסמאות אינן תואמות.";
        isValid = false;
    }

    return isValid;
}

function isValidEmail(email) {
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);
}

function clearMessages() {
    fullNameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";

    serverMessage.textContent = "";
    serverMessage.className = "server-message";
}

function showServerMessage(message, type) {
    serverMessage.textContent = message;
    serverMessage.className = `server-message ${type}`;
}

function setLoadingState(isLoading) {
    registerButton.disabled = isLoading;

    if (isLoading) {
        registerButton.textContent = "מבצע הרשמה...";
    } else {
        registerButton.textContent = "הרשמה";
    }
}
function isValidPassword(password) {
    const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    return passwordPattern.test(password);
}