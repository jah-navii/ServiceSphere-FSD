document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("seeker-registration-form");
  const successMessage = document.getElementById("register-success");

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form from submitting by default

    let isValid = true;

    // Helper function to validate inputs
    function validateField(input, errorId, errorMessage) {
      const errorElement = document.getElementById(errorId);
      if (input.value.trim() === "") {
        errorElement.textContent = errorMessage;
        isValid = false;
      } else {
        errorElement.textContent = "";
      }
    }

    // Validate Full Name
    validateField(document.getElementById("name"), "name-error", "Full Name is required.");

    // Validate Email
    const email = document.getElementById("email");
    const emailError = document.getElementById("email-error");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value)) {
      emailError.textContent = "Please enter a valid email address.";
      isValid = false;
    } else {
      emailError.textContent = "";
    }

    // Validate Mobile Number
    const mobileNumber = document.getElementById("mobilenumber");
    const mobileError = document.getElementById("mobile-error");
    const mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(mobileNumber.value)) {
      mobileError.textContent = "Please enter a valid 10-digit mobile number.";
      isValid = false;
    } else {
      mobileError.textContent = "";
    }

    // Validate Password
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");
    const passwordError = document.getElementById("password-error");
    const confirmPasswordError = document.getElementById("confirm-password-error");

    if (password.value.length < 6) {
      passwordError.textContent = "Password must be at least 6 characters long.";
      isValid = false;
    } else {
      passwordError.textContent = "";
    }

    if (password.value !== confirmPassword.value) {
      confirmPasswordError.textContent = "Passwords do not match.";
      isValid = false;
    } else {
      confirmPasswordError.textContent = "";
    }

    // Validate Address
    validateField(document.getElementById("address"), "address-error", "Address should not be empty.");

    if (isValid) {
      successMessage.textContent = "Registered successfully!";
      successMessage.classList.remove("hidden");

      // Clear form fields after successful registration
      form.reset();

      // Hide success message after 3 seconds
      setTimeout(() => {
        successMessage.classList.add("hidden");
      }, 3000);
    } else {
      successMessage.classList.add("hidden"); // Hide success message if errors exist
    }
  });
});
