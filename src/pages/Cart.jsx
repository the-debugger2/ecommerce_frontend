import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Cart = () => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  const navigate = useNavigate();

  const removeItem = (id) => {
    const updated = cart.filter((item) => item._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const updateQty = (id, delta) => {
    const updated = cart
      .map((item) =>
        item._id === id ? { ...item, qty: item.qty + delta } : item
      )
      .filter((item) => item.qty > 0);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="cart-page">

      {/* ── Top bar ── */}
      <div className="cart-topbar">
        <button className="cart-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="cart-topbar__title">
          <span className="admin-eyebrow">Your order</span>
          <h1 className="cart-title">Cart</h1>
        </div>
        <span className="section-count">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty">
          <p className="cart-empty__text">Your cart is empty.</p>
          <button className="auth-btn cart-empty__cta" onClick={() => navigate("/")}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="cart-layout">

          {/* ── Item list ── */}
          <ul className="cart-list">
            {cart.map((item, i) => (
              <li
                key={item._id}
                className="cart-item"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="cart-item__img-wrap">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="cart-item__img" />
                  ) : (
                    <div className="cart-item__no-img" />
                  )}
                </div>

                <div className="cart-item__info">
                  <h3 className="cart-item__name">{item.name}</h3>
                  {item.category && (
                    <span className="cart-item__cat">{item.category}</span>
                  )}
                </div>

                <div className="cart-item__qty">
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item._id, -1)}
                  >−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item._id, 1)}
                  >+</button>
                </div>

                <span className="cart-item__price">
                  K{(item.price * item.qty).toFixed(2)}
                </span>

                <button
                  className="cart-item__remove"
                  onClick={() => removeItem(item._id)}
                  title="Remove"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {/* ── Summary ── */}
          <aside className="cart-summary">
            <h2 className="cart-summary__title">Summary</h2>

            <div className="cart-summary__rows">
              {cart.map((item) => (
                <div key={item._id} className="cart-summary__row">
                  <span className="cart-summary__label">
                    {item.name} × {item.qty}
                  </span>
                  <span className="cart-summary__val">
                    K{(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="cart-summary__divider" />

            <div className="cart-summary__total">
              <span>Total</span>
              <span className="cart-summary__total-val">K{total.toFixed(2)}</span>
            </div>

            <button
              className="auth-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;