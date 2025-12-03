import React, { useState } from "react";
import "../styles/PaymentForm.css";

const Payment = () => {
  // ---- Mock order data (replace with real data later) ----
  const serviceName = "";
  const date = "";
  const time = "";
  const helperName = "";
  const price = ""; // base service fee
  const bookingId = "demo-booking-id"; // replace with real bookingId if needed

  const serviceFee = Number(price) || 0;
  const platformFee = +(serviceFee * 0.1).toFixed(2);
  const taxAmount = +(serviceFee * 0.1).toFixed(2);
  const total = +(serviceFee + platformFee + taxAmount).toFixed(2);

  // ---- Payment method ----
  const [method, setMethod] = useState("card"); // "card" or "upi"

  // ---- Form state ----
  const [cardholder, setCardholder] = useState("");
  const [cardnumber, setCardnumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [upiId, setUpiId] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // ---- Validators ----
  const validators = {
    cardholder: (val) => {
      if (val.trim().length < 3) return "Name must be at least 3 characters.";
      return /^[a-zA-Z\s]+$/.test(val) || "Only letters and spaces allowed.";
   },

    cardnumber: (val) =>
      /^\d{16}$/.test(val.replace(/\s/g, "")) || "Card number must be 16 digits.",

    expiry: (val) => {
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(val)) return "Enter expiry in MM/YY.";
      const [month, year] = val.split("/");
      const expiryDate = new Date(`20${year}-${month}-01`);
      const now = new Date();
      now.setDate(1);
      return expiryDate >= now || "Card is expired.";
    },

    cvv: (val) => /^\d{3}$/.test(val) || "CVV must be 3 digits.",

    email: (val) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || "Invalid email format.",

    phone: (val) => /^\d{10}$/.test(val) || "Phone must be 10 digits.",

    upiId: (val) =>
      /^[^@\s]+@[^@\s]+$/.test(val) || "Enter a valid UPI ID (example: name@bank).",
  };

  const setFieldError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validateField = (field, value) => {
    const validator = validators[field];
    if (!validator) return;
    const result = validator(value.trim());
    if (result === true) {
      clearFieldError(field);
    } else {
      setFieldError(field, result);
    }
  };

  // Auto-slasher for expiry date (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setExpiry(value);
    validateField("expiry", value);
  };

  const inputClass = (field) => {
    if (errors[field]) return "invalid";

    const valueMap = {
      cardholder,
      cardnumber,
      expiry,
      cvv,
      email,
      phone,
      upiId,
    };

    const value = valueMap[field] || "";
    if (value && !errors[field]) return "valid";
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    let newErrors = {};

    if (method === "card") {
      const fields = ["cardholder", "cardnumber", "expiry", "cvv", "email", "phone"];
      const valueMap = { cardholder, cardnumber, expiry, cvv, email, phone };
      fields.forEach((field) => {
        const result = validators[field](valueMap[field].trim());
        if (result !== true) newErrors[field] = result;
      });
    } else if (method === "upi") {
      const fields = ["upiId", "email", "phone"];
      const valueMap = { upiId, email, phone };
      fields.forEach((field) => {
        const result = validators[field](valueMap[field].trim());
        if (result !== true) newErrors[field] = result;
      });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return; // stop if any error
    }

    // All validations passed (demo)
    console.log("Payment submitted for booking:", bookingId, "via", method);
    alert("Payment successful! Thank you for your purchase.");
  };

  return (
    <div className="payment-wrapper">
      <h1 className="page-title">Complete Your Payment</h1>

      <div className="payment-container">
        {/* Payment Details Section */}
        <div className="payment-details">
          <h2 className="section-title">
            <i className="fas fa-credit-card"></i> Payment Method
          </h2>

          <div className="payment-methods">
            <div
              className={`payment-method ${method === "card" ? "active" : ""}`}
              onClick={() => setMethod("card")}
            >
              <i className="fas fa-credit-card"></i>
              <div>Card</div>
            </div>

            {/* PayPal removed */}

            <div
              className={`payment-method ${method === "upi" ? "active" : ""}`}
              onClick={() => setMethod("upi")}
            >
              <i className="fas fa-mobile-alt"></i>
              <div>UPI</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Card Payment Form */}
            {method === "card" && (
              <div id="card-payment-form">
                <div className="input-group">
                  <label htmlFor="cardholder">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardholder"
                    placeholder="As shown on card"
                    value={cardholder}
                    onChange={(e) => {
                      setCardholder(e.target.value);
                      validateField("cardholder", e.target.value);
                    }}
                    className={inputClass("cardholder")}
                  />
                  {errors.cardholder && (
                    <div className="error-msg">{errors.cardholder}</div>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="cardnumber">Card Number</label>
                  <input
                    type="text"
                    id="cardnumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardnumber}
                    onChange={(e) => {
                      setCardnumber(e.target.value);
                      validateField("cardnumber", e.target.value);
                    }}
                    className={inputClass("cardnumber")}
                  />
                  {errors.cardnumber && (
                    <div className="error-msg">{errors.cardnumber}</div>
                  )}
                </div>

                <div className="card-row">
                  <div className="input-group">
                    <label htmlFor="expiry">Expiry Date</label>
                    <input
                      type="text"
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      className={inputClass("expiry")}
                    />
                    {errors.expiry && (
                      <div className="error-msg">{errors.expiry}</div>
                    )}
                  </div>

                  <div className="input-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => {
                        setCvv(e.target.value);
                        validateField("cvv", e.target.value);
                      }}
                      className={inputClass("cvv")}
                    />
                    {errors.cvv && (
                      <div className="error-msg">{errors.cvv}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* UPI Payment Form */}
            {method === "upi" && (
              <div id="upi-payment-form">
                <div className="input-group">
                  <label htmlFor="upiId">UPI ID</label>
                  <input
                    type="text"
                    id="upiId"
                    placeholder="example@bank"
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      validateField("upiId", e.target.value);
                    }}
                    className={inputClass("upiId")}
                  />
                  {errors.upiId && (
                    <div className="error-msg">{errors.upiId}</div>
                  )}
                </div>
              </div>
            )}

            <div className="divider"></div>

            <h2 className="section-title">
              <i className="fas fa-user"></i> Billing Information
            </h2>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateField("email", e.target.value);
                }}
                className={inputClass("email")}
              />
              {errors.email && <div className="error-msg">{errors.email}</div>}
            </div>

            <div className="input-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  validateField("phone", e.target.value);
                }}
                className={inputClass("phone")}
              />
              {errors.phone && <div className="error-msg">{errors.phone}</div>}
            </div>

            {errors.form && (
              <div className="error-msg" style={{ marginBottom: "8px" }}>
                {errors.form}
              </div>
            )}

            {success && (
              <div className="payment-success-msg">{success}</div>
            )}

            <button id="complete-payment" className="submit-btn" type="submit">
              Complete Payment
            </button>

            <div className="secure-badge">
              <i className="fas fa-lock"></i>
              <span>Secure Payment Processing</span>
            </div>
          </form>
        </div>

        {/* Order Summary Section */}
        <div className="order-summary">
          <h2 className="section-title">
            <i className="fas fa-clipboard-list"></i> Order Summary
          </h2>

          <div className="service-details">
            <div className="service-item">
              <span>Service:</span>
              <span id="service-name">{serviceName}</span>
            </div>

            <div className="service-item">
              <span>Date:</span>
              <span id="service-date">{date}</span>
            </div>

            <div className="service-item">
              <span>Time:</span>
              <span id="service-time">{time}</span>
            </div>
          </div>

          <div className="helper-details">
            <div className="helper-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div>
              <strong id="helper-name">{helperName}</strong>
              <div>Service Provider</div>
            </div>
          </div>

          <div className="price-breakdown">
            <div className="price-row">
              <span>Service Fee</span>
              <span id="service-fee">₹{serviceFee.toFixed(2)}</span>
            </div>

            <div className="price-row">
              <span>Platform Fee</span>
              <span id="platform-fee">₹{platformFee.toFixed(2)}</span>
            </div>

            <div className="price-row">
              <span>Tax</span>
              <span id="tax-amount">₹{taxAmount.toFixed(2)}</span>
            </div>

            <div className="total-row">
              <span>Total</span>
              <span id="total-amount">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
