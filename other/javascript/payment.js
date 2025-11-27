document.getElementById("payment-method").addEventListener("change", function() {
    let paymentMethod = this.value;
    let cardDetails = document.getElementById("card-details");

    if (paymentMethod === "card") {
        cardDetails.style.display = "block";
    } else {
        cardDetails.style.display = "none";
    }
});

document.getElementById("payment-form").addEventListener("submit", function(event) {
    event.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let address = document.getElementById("address").value;
    let paymentMethod = document.getElementById("payment-method").value;

    if (!name || !email || !phone || !address) {
        alert("Please fill in all required fields!");
        return;
    }

    if (paymentMethod === "card") {
        let cardNumber = document.getElementById("card-number").value;
        let expiry = document.getElementById("expiry").value;
        let cvv = document.getElementById("cvv").value;

        if (!cardNumber || !expiry || !cvv) {
            alert("Please enter card details!");
            return;
        }
    }

    alert("Payment Successful!");
});
