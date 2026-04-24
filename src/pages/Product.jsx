import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../App.css";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const exist = cart.find((x) => x._id === product._id);

    if (exist) {
      exist.qty += qty;
    } else {
      cart.push({ ...product, qty });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="product-page">
        <div className="product-skeleton">
          <div className="skeleton skeleton--img" />
          <div className="skeleton-info">
            <div className="skeleton skeleton--line skeleton--short" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--med" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page">
        <div className="home-empty">Product not found.</div>
      </div>
    );
  }

  const inStock = product.countInStock > 0;

  return (
    <div className="product-page">

      {/* Back */}
      <button className="cart-back product-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-layout">

        {/* ── Image ── */}
        <div className="product-img-wrap">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-img"
            />
          ) : (
            <div className="product-img-empty">No image</div>
          )}
          {product.category && (
            <span className="product-category-badge">{product.category}</span>
          )}
        </div>

        {/* ── Info ── */}
        <div className="product-info">
          {product.category && (
            <span className="admin-eyebrow">{product.category}</span>
          )}

          <h1 className="product-name">{product.name}</h1>

          <div className="product-price-row">
            <span className="product-price">K{product.price}</span>
            <span className={`product-stock-label ${inStock ? "" : "product-stock-label--out"}`}>
              {inStock ? `${product.countInStock} in stock` : "Out of stock"}
            </span>
          </div>

          {product.description && (
            <p className="product-description">{product.description}</p>
          )}

          <div className="product-divider" />

          {/* Qty + Add to cart */}
          <div className="product-actions">
            <div className="product-qty">
              <button
                className="qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >−</button>
              <span className="qty-num">{qty}</span>
              <button
                className="qty-btn"
                onClick={() =>
                  setQty((q) => Math.min(product.countInStock || 99, q + 1))
                }
              >+</button>
            </div>

            <button
              className={`auth-btn product-add-btn ${added ? "product-add-btn--added" : ""}`}
              onClick={addToCart}
              disabled={!inStock}
            >
              {added ? "✓ Added to Cart" : inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          <button
            className="product-cart-link"
            onClick={() => navigate("/cart")}
          >
            View cart →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;