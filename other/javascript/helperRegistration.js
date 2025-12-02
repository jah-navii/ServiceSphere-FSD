document.addEventListener("DOMContentLoaded", function () {
  const helperForm = document.getElementById("helper-registration-form");

  if (helperForm) {
      helperForm.addEventListener("submit", function (event) {
          event.preventDefault();
          let isValid = true;

          document.querySelectorAll(".error-message").forEach(e => e.textContent = "");

          const name = document.getElementById("name");
          const genderMale = document.getElementById("male");
          const genderFemale = document.getElementById("female");
          const mobileNumber = document.getElementById("mobilenumber");
          const aadharNumber = document.getElementById("aadharnumber");
          const email = document.getElementById("email");
          const password = document.getElementById("password");
          const confirmPassword = document.getElementById("confirm-password");

          if (name.value.trim() === "") {
              document.getElementById("name-error").textContent = "Full Name is required.";
              isValid = false;
          }

          if (!genderMale.checked && !genderFemale.checked) {
              document.getElementById("gender-error").textContent = "Please select your gender.";
              isValid = false;
          }

          const mobilePattern = /^[0-9]{10}$/;
          if (!mobilePattern.test(mobileNumber.value)) {
              document.getElementById("mobile-error").textContent = "Please enter a valid 10-digit mobile number.";
              isValid = false;
          }

          const aadharPattern = /^[0-9]{12}$/;
          if (!aadharPattern.test(aadharNumber.value)) {
              document.getElementById("aadhar-error").textContent = "Please enter a valid 12-digit Aadhar number.";
              isValid = false;
          }

          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(email.value)) {
              document.getElementById("email-error").textContent = "Please enter a valid email address.";
              isValid = false;
          }

          if (password.value.length < 6) {
              document.getElementById("password-error").textContent = "Password must be at least 6 characters long.";
              isValid = false;
          }

          if (password.value !== confirmPassword.value) {
              document.getElementById("confirm-password-error").textContent = "Passwords do not match.";
              isValid = false;
          }

          if (isValid) {
              const user = {
                  name: name.value.trim(),
                  mobileNumber: mobileNumber.value.trim(),
                  email: email.value.trim(),
                  password: password.value.trim()
              };
              localStorage.setItem("registeredUser", JSON.stringify(user));

              // Display success message
              const successMessage = document.createElement("div");
              successMessage.textContent = "Registration successful!";
              successMessage.style.color = "green";
              successMessage.style.marginTop = "10px";
              successMessage.style.textAlign = "center";
              
              

              // Append the success message below the submit button
              const submitButton = document.querySelector(".form-group button");
              submitButton.insertAdjacentElement("afterend", successMessage);

              helperForm.reset();
          }
      });
  }
});