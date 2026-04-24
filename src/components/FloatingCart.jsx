import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";

const FloatingCart = () => {
  const [count, setCount] = useState(0);
  const [bump, setBump] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the button when already on the cart page
  const isCartPage = location.pathname === "/cart";

  // Re-read cart from localStorage whenever route changes or storage updates
  useEffect(() => {
    const readCart = () => {
      const stored = localStorage.getItem("cart");
      const cart = stored ? JSON.parse(stored) : [];
      const total = cart.reduce((sum, item) => sum + item.qty, 0);

      // Trigger bump animation when count increases
      setCount((prev) => {
        if (total > prev) setBump(true);
        return total;
      });
    };

    readCart();

    // Listen for cart changes from other components
    window.addEventListener("storage", readCart);
    window.addEventListener("cartUpdated", readCart);

    return () => {
      window.removeEventListener("storage", readCart);
      window.removeEventListener("cartUpdated", readCart);
    };
  }, [location]);

  useEffect(() => {
    if (bump) {
      const t = setTimeout(() => setBump(false), 400);
      return () => clearTimeout(t);
    }
  }, [bump]);

  if (isCartPage) return null;

  return (
    <button
      className={`floating-cart ${bump ? "floating-cart--bump" : ""}`}
      onClick={() => navigate("/cart")}
      aria-label={`Cart · ${count} items`}
    >
      <span className="floating-cart__icon">🛒</span>
      {count > 0 && (
        <span className="floating-cart__badge">{count > 99 ? "99+" : count}</span>
      )}
    </button>
  );
};

export default FloatingCart;