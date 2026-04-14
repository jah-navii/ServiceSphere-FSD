import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./PaymentPage.module.css";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // 1. Get Data from Cart (Passed via navigate state)
  const { 
    bookingId, 
    serviceName = "Service", 
    price = 0, 
    helperName = "Helper", 
    date = "", 
    time = "" 
  } = location.state || {};

  // 2. Redirect if accessed directly without data
  useEffect(() => {
    if (!bookingId) {
      showToast("Invalid payment session. Please start from Cart.", "error");
      navigate("/cart");
    }
  }, [bookingId, navigate, showToast]);

  // 3. Financials
  const serviceFee = Number(price);
  const platformFee = Number((serviceFee * 0.1).toFixed(2)); // 10%
  const taxAmount = Number((serviceFee * 0.1).toFixed(2));   // 10%
  const total = (serviceFee + platformFee + taxAmount).toFixed(2);

  // Form State
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [form, setForm] = useState({
    cardholder: "",
    cardnumber: "",
    expiry: "",
    cvv: "",
    upiId: "",
    email: "",
    phone: ""
  });

  // --- VALIDATORS ---
  const validators = {
    cardholder: (val) => val.length >= 3 || "Name too short",
    cardnumber: (val) => /^\d{16}$/.test(val.replace(/\s/g, "")) || "Must be 16 digits",
    expiry: (val) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(val) || "Format MM/YY",
    cvv: (val) => /^\d{3}$/.test(val) || "3 digits required",
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || "Invalid email",
    phone: (val) => /^\d{10}$/.test(val) || "10 digits required",
    upiId: (val) => /^[^@\s]+@[^@\s]+$/.test(val) || "Invalid UPI ID",
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Auto-format expiry
    if (name === "expiry") {
        let v = value.replace(/\D/g, "");
        if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
        finalValue = v;
    }

    setForm({ ...form, [name]: finalValue });
    
    // Clear error on type
    if (errors[name]) {
        setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Run Validation
    const newErrors = {};
    const fieldsToCheck = method === "card" 
        ? ["cardholder", "cardnumber", "expiry", "cvv", "email", "phone"]
        : ["upiId", "email", "phone"];

    fieldsToCheck.forEach(field => {
        const result = validators[field](form[field]);
        if (result !== true) newErrors[field] = result;
    });

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }

    // 2. Submit Payment
    setLoading(true);
    
    // Simulate delay
    setTimeout(async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/pay`, {
                method: "PATCH",
            });
            const data = await res.json();

            if (res.ok) {
                showToast("Payment Successful!", "success");
                navigate("/cart");
            } else {
                showToast(data.error || "Payment failed", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Network Error", "error");
        } finally {
            setLoading(false);
        }
    }, 1500);
  };

  // Helper for input classes
  const getInputClass = (name) => {
    if (errors[name]) return `${styles.input} ${styles.invalid}`;
    if (form[name] && !errors[name]) return `${styles.input} ${styles.valid}`;
    return styles.input;
  };

  if (!bookingId) return null;

  return (
    <div className={styles.pageOuter}>
      <Navbar />
      <div className={styles.paymentWrapper}>
        <h1 className={styles.pageTitle}>Complete Your Payment</h1>

        <div className={styles.paymentContainer}>
          
          {/* LEFT: FORM */}
          <div className={styles.paymentDetails}>
            <h2 className={styles.sectionTitle}>Payment Method</h2>

            <div className={styles.paymentMethods}>
              <div 
                className={`${styles.paymentMethod} ${method === "card" ? styles.activeMethod : ""}`}
                onClick={() => setMethod("card")}
              >
                Card
              </div>
              <div 
                className={`${styles.paymentMethod} ${method === "upi" ? styles.activeMethod : ""}`}
                onClick={() => setMethod("upi")}
              >
                UPI
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* CARD FIELDS */}
              {method === "card" && (
                <>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Cardholder Name</label>
                    <input type="text" name="cardholder" className={getInputClass("cardholder")} placeholder="Name on Card" value={form.cardholder} onChange={handleInputChange} />
                    {errors.cardholder && <div className={styles.errorMsg}>{errors.cardholder}</div>}
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Card Number</label>
                    <input type="text" name="cardnumber" className={getInputClass("cardnumber")} placeholder="0000 0000 0000 0000" maxLength="16" value={form.cardnumber} onChange={handleInputChange} />
                    {errors.cardnumber && <div className={styles.errorMsg}>{errors.cardnumber}</div>}
                  </div>

                  <div className={styles.cardRow}>
                    <div className={styles.inputGroup} style={{flex:1}}>
                      <label className={styles.label}>Expiry</label>
                      <input type="text" name="expiry" className={getInputClass("expiry")} placeholder="MM/YY" maxLength="5" value={form.expiry} onChange={handleInputChange} />
                      {errors.expiry && <div className={styles.errorMsg}>{errors.expiry}</div>}
                    </div>
                    <div className={styles.inputGroup} style={{flex:1}}>
                      <label className={styles.label}>CVV</label>
                      <input type="password" name="cvv" className={getInputClass("cvv")} placeholder="123" maxLength="3" value={form.cvv} onChange={handleInputChange} />
                      {errors.cvv && <div className={styles.errorMsg}>{errors.cvv}</div>}
                    </div>
                  </div>
                </>
              )}

              {/* UPI FIELDS */}
              {method === "upi" && (
                <div className={styles.inputGroup}>
                  <label className={styles.label}>UPI ID</label>
                  <input type="text" name="upiId" className={getInputClass("upiId")} placeholder="name@bank" value={form.upiId} onChange={handleInputChange} />
                  {errors.upiId && <div className={styles.errorMsg}>{errors.upiId}</div>}
                </div>
              )}

              <div className={styles.divider}></div>

              <h2 className={styles.sectionTitle}>Billing Info</h2>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email</label>
                <input type="email" name="email" className={getInputClass("email")} placeholder="receipt@email.com" value={form.email} onChange={handleInputChange} />
                {errors.email && <div className={styles.errorMsg}>{errors.email}</div>}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Phone</label>
                <input type="tel" name="phone" className={getInputClass("phone")} placeholder="9876543210" maxLength="10" value={form.phone} onChange={handleInputChange} />
                {errors.phone && <div className={styles.errorMsg}>{errors.phone}</div>}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Processing..." : `Pay ₹${total}`}
              </button>

            </form>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className={styles.orderSummary}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            
            <div className={styles.serviceItem}>
              <span>Service</span>
              <strong>{serviceName}</strong>
            </div>
            {date && (
                <div className={styles.serviceItem}>
                <span>Date</span>
                <strong>{new Date(date).toLocaleDateString()} at {time}</strong>
                </div>
            )}

            <div className={styles.helperDetails}>
              <div>
                <div className={styles.helperName}>{helperName}</div>
                <div className={styles.helperLabel}>Provider</div>
              </div>
            </div>

            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>Service Fee</span>
                <span>₹{serviceFee.toFixed(2)}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Platform Fee (10%)</span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Tax (10%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span style={{color: '#007ea7'}}>₹{total}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;