const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const serverMessage = document.getElementById("serverMessage");
const loginButton = document.getElementById("loginButton");
const togglePasswordButton = document.getElementById("togglePassword");

const apiUrl = "https://localhost:7296/api/Users/login";

togglePasswordButton.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePasswordButton.textContent = "הסתר";
    } else {
        passwordInput.type = "password";
        togglePasswordButton.textContent = "הצג";
    }
});

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    clearMessages();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const isValid = validateForm(email, password);

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
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage =
                data.message || "כתובת הדוא״ל או הסיסמה אינן נכונות.";

            showServerMessage(errorMessage, "error");
            return;
        }

        if (!data.user) {
            showServerMessage(
                "התחברות נכשלה. לא התקבלו פרטי משתמש.",
                "error"
            );

            return;
        }

        localStorage.setItem(
            "currentUser",
            JSON.stringify(data.user)
        );

        localStorage.setItem("isLoggedIn", "true");

        showServerMessage(
            "ההתחברות הושלמה בהצלחה. מעבירים אותך...",
            "success"
        );

        loginForm.reset();

        setTimeout(function () {
            window.location.href = "index.html";
        }, 1200);
    } catch (error) {
        console.error("Login error:", error);

        showServerMessage(
            "לא ניתן להתחבר לשרת. ודא שהשרת פועל ונסה שוב.",
            "error"
        );
    } finally {
        setLoadingState(false);
    }
});

function validateForm(email, password) {
    let isValid = true;

    if (email === "") {
        emailError.textContent = "יש להזין כתובת דוא״ל.";
        isValid = false;
    } else if (!isValidEmail(email)) {
        emailError.textContent = "כתובת הדוא״ל אינה תקינה.";
        isValid = false;
    }

    if (password === "") {
        passwordError.textContent = "יש להזין סיסמה.";
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
    emailError.textContent = "";
    passwordError.textContent = "";

    serverMessage.textContent = "";
    serverMessage.className = "server-message";
}

function showServerMessage(message, type) {
    serverMessage.textContent = message;
    serverMessage.className = `server-message ${type}`;
}

function setLoadingState(isLoading) {
    loginButton.disabled = isLoading;

    if (isLoading) {
        loginButton.textContent = "מתחבר...";
    } else {
        loginButton.textContent = "התחברות";
    }
}