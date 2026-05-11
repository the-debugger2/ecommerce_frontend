import { useState, useContext } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "../App.css";

// Load Stripe outside component to avoid recreating on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// ─── Card form (must be inside <Elements>) ───────────────────────
const PaymentForm = ({ orderId, total, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    onError("");

    try {
      // 1. Get client secret from backend
      const { data } = await API.post(`/orders/${orderId}/payment-intent`);

      // 2. Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (error) {
        onError(error.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // 3. Verify on backend and mark order paid
        await API.put(`/orders/${orderId}/pay`, {
          paymentIntentId: paymentIntent.id,
        });
        onSuccess();
      }
    } catch (err) {
      onError(err.response?.data?.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="field-group">
        <label className="field-label">Card Details</label>
        <div className="stripe-card-wrap">
          <CardElement
            options={{
              style: {
                base: {
                  color: "#e8e4dc",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: "14px",
                  "::placeholder": { color: "#4a4642" },
                  iconColor: "#d4a843",
                },
                invalid: {
                  color: "#e74c3c",
                  iconColor: "#e74c3c",
                },
              },
            }}
          />
        </div>
        <p className="stripe-hint">
          Test card: 4242 4242 4242 4242 · Any future date · Any CVC
        </p>
      </div>

      <button
        className="auth-btn"
        type="submit"
        disabled={!stripe || processing}
      >
        {processing ? <span className="btn-spinner" /> : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
};

// ─── Main Checkout Page ───────────────────────────────────────────
const Checkout = () => {
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Created order ID — set after step 1
  const [orderId, setOrderId] = useState(null);
  const [step, setStep] = useState("shipping"); // "shipping" | "payment"

  const handleShippingSubmit = async () => {
    setError("");

    if (!address.trim() || !city.trim()) {
      setError("Please fill in your address and city.");
      return;
    }

    setLoading(true);

    try {
      const orderItems = cart.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id,
      }));

      const { data: createdOrder } = await API.post("/orders", {
        orderItems,
        shippingAddress: { address, city, country: "Zambia" },
        totalPrice: total,
      });

      setOrderId(createdOrder._id);
      setStep("payment");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
    navigate("/orders");
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="cart-empty">
          <p className="cart-empty__text">Your cart is empty.</p>
          <button className="auth-btn cart-empty__cta" onClick={() => navigate("/")}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">

      {/* ── Top bar ── */}
      <div className="cart-topbar">
        <button
          className="cart-back"
          onClick={() => step === "payment" ? setStep("shipping") : navigate(-1)}
        >
          ← Back
        </button>
        <div className="cart-topbar__title">
          <span className="admin-eyebrow">
            {step === "shipping" ? "Step 1 of 2" : "Step 2 of 2"}
          </span>
          <h1 className="cart-title">
            {step === "shipping" ? "Shipping" : "Payment"}
          </h1>
        </div>
        <span className="section-count">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </div>

      {/* ── Step indicator ── */}
      <div className="checkout-steps">
        <div className={`checkout-step ${step === "shipping" ? "checkout-step--active" : "checkout-step--done"}`}>
          <span className="checkout-step__num">
            {step === "payment" ? "✓" : "1"}
          </span>
          <span className="checkout-step__label">Shipping</span>
        </div>
        <div className="checkout-step__line" />
        <div className={`checkout-step ${step === "payment" ? "checkout-step--active" : ""}`}>
          <span className="checkout-step__num">2</span>
          <span className="checkout-step__label">Payment</span>
        </div>
      </div>

      <div className="checkout-layout">

        {/* ── Left panel ── */}
        <div className="checkout-form-panel">

          {/* STEP 1: Shipping */}
          {step === "shipping" && (
            <>
              <div className="panel-header">
                <h2 className="panel-title">Shipping Details</h2>
              </div>

              {error && <div className="admin-error">{error}</div>}

              <div className="admin-form">
                <div className="field-group">
                  <label className="field-label">Street Address *</label>
                  <input
                    className="field-input"
                    placeholder="e.g. 14 Cairo Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="admin-row">
                  <div className="field-group">
                    <label className="field-label">City *</label>
                    <input
                      className="field-input"
                      placeholder="e.g. Lusaka"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Country</label>
                    <input
                      className="field-input"
                      value="Zambia"
                      disabled
                      style={{ opacity: 0.5, cursor: "not-allowed" }}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Phone (optional)</label>
                  <input
                    className="field-input"
                    placeholder="+260 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="auth-btn"
                onClick={handleShippingSubmit}
                disabled={loading}
                style={{ marginTop: "1rem" }}
              >
                {loading ? <span className="btn-spinner" /> : "Continue to Payment →"}
              </button>
            </>
          )}

          {/* STEP 2: Payment */}
          {step === "payment" && (
            <>
              <div className="panel-header">
                <h2 className="panel-title">Card Details</h2>
              </div>

              {error && <div className="admin-error">{error}</div>}

              <div className="checkout-shipping-summary">
                <p className="order-detail__heading">Shipping to</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {address}, {city}, Zambia
                </p>
              </div>

              <Elements stripe={stripePromise}>
                <PaymentForm
                  orderId={orderId}
                  total={total}
                  onSuccess={handlePaymentSuccess}
                  onError={setError}
                />
              </Elements>

              <div className="checkout-payment-note" style={{ marginTop: "1rem" }}>
                <span className="checkout-payment-icon">🔒</span>
                <p>Your payment is encrypted and processed securely by Stripe.</p>
              </div>
            </>
          )}
        </div>

        {/* ── Order Summary ── */}
        <aside className="cart-summary checkout-summary">
          <h2 className="cart-summary__title">Order Summary</h2>

          <div className="checkout-items">
            {cart.map((item) => (
              <div key={item._id} className="checkout-item">
                <div className="checkout-item__img-wrap">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item__img"
                      style={{ width: 48, height: 48, borderRadius: "var(--radius)", border: "1px solid var(--border)" }}
                    />
                  ) : (
                    <div className="cart-item__no-img" style={{ width: 48, height: 48 }} />
                  )}
                  <span className="checkout-item__qty-bubble">{item.qty}</span>
                </div>
                <div className="checkout-item__info">
                  <span className="checkout-item__name">{item.name}</span>
                  {item.category && (
                    <span className="cart-item__cat">{item.category}</span>
                  )}
                </div>
                <span className="cart-summary__val">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="cart-summary__divider" />

          <div className="cart-summary__row">
            <span className="cart-summary__label">Subtotal</span>
            <span className="cart-summary__val">${total.toFixed(2)}</span>
          </div>
          <div className="cart-summary__row">
            <span className="cart-summary__label">Shipping</span>
            <span className="cart-summary__val checkout-free">Free</span>
          </div>

          <div className="cart-summary__divider" />

          <div className="cart-summary__total">
            <span>Total</span>
            <span className="cart-summary__total-val">${total.toFixed(2)}</span>
          </div>

          <p className="checkout-terms">
            Payments processed securely by Stripe.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;