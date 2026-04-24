import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Checkout = () => {
  const navigate = useNavigate();

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const placeOrder = async () => {
    setError("");

    if (!address.trim() || !city.trim()) {
      setError("Please fill in your address and city.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);

    const orderItems = cart.map((item) => ({
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price,
      product: item._id,
    }));

    try {
      await API.post("/orders", {
        orderItems,
        shippingAddress: { address, city, country: "Zambia" },
        totalPrice: total,
      });

      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <button className="cart-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="cart-topbar__title">
          <span className="admin-eyebrow">Almost there</span>
          <h1 className="cart-title">Checkout</h1>
        </div>
        <span className="section-count">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="checkout-layout">

        {/* ── Shipping Form ── */}
        <div className="checkout-form-panel">
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

          {/* Payment note */}
          <div className="checkout-payment-note">
            <span className="checkout-payment-icon">💳</span>
            <p>Payment is collected on delivery. No card required.</p>
          </div>
        </div>

        {/* ── Order Summary ── */}
        <aside className="cart-summary checkout-summary">
          <h2 className="cart-summary__title">Order Summary</h2>

          <div className="checkout-items">
            {cart.map((item) => (
              <div key={item._id} className="checkout-item">
                <div className="checkout-item__img-wrap">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="cart-item__img" />
                  ) : (
                    <div className="cart-item__no-img" />
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
                  K{(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="cart-summary__divider" />

          <div className="cart-summary__row">
            <span className="cart-summary__label">Subtotal</span>
            <span className="cart-summary__val">K{total.toFixed(2)}</span>
          </div>
          <div className="cart-summary__row">
            <span className="cart-summary__label">Shipping</span>
            <span className="cart-summary__val checkout-free">Free</span>
          </div>

          <div className="cart-summary__divider" />

          <div className="cart-summary__total">
            <span>Total</span>
            <span className="cart-summary__total-val">K{total.toFixed(2)}</span>
          </div>

          <button
            className="auth-btn"
            onClick={placeOrder}
            disabled={loading}
          >
            {loading ? <span className="btn-spinner" /> : "Place Order"}
          </button>

          <p className="checkout-terms">
            By placing your order you agree to our terms of service.
          </p>
        </aside>

      </div>
    </div>
  );
};

export default Checkout;