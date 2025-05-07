document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", function (event) {
        let isValid = true;

        const mobilenumber = document.getElementById("email");
        const password = document.getElementById("password");

        const mobileError = document.getElementById("email-error");
        const passwordError = document.getElementById("password-error");

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value)) {
            document.getElementById("email-error").textContent = "Please enter a valid email address.";
            isValid = false;
        }

        if (password.value.length < 6) {
            passwordError.textContent = "Password must be at least 6 characters long.";
            passwordError.classList.remove("hidden");
            isValid = false;
        } else {
            passwordError.textContent = "";
            passwordError.classList.add("hidden");
        }

        if (!isValid) {
            event.preventDefault();
        }
    });
});
