import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../App.css";

const statusLabel = (order) => {
  if (order.isDelivered) return { text: "Delivered", cls: "badge--delivered" };
  if (order.isPaid) return { text: "Paid", cls: "badge--paid" };
  return { text: "Pending", cls: "badge--pending" };
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/myorders");
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const markPaid = async (id) => {
    setPayingId(id);
    try {
      await API.put(`/orders/${id}/pay`);
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, isPaid: true } : o))
      );
    } catch {
      // silent — could add error toast here
    } finally {
      setPayingId(null);
    }
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="orders-page">

      {/* ── Header ── */}
      <div className="cart-topbar">
        <button className="cart-back" onClick={() => navigate(-1)}>← Back</button>
        <div className="cart-topbar__title">
          <span className="admin-eyebrow">Account</span>
          <h1 className="cart-title">My Orders</h1>
        </div>
        <span className="section-count">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </span>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="orders-skeleton">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton orders-skeleton__row" />
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && orders.length === 0 && (
        <div className="cart-empty">
          <p className="cart-empty__text">You haven't placed any orders yet.</p>
          <button className="auth-btn cart-empty__cta" onClick={() => navigate("/")}>
            Start Shopping
          </button>
        </div>
      )}

      {/* ── Order list ── */}
      {!loading && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((o, i) => {
            const status = statusLabel(o);
            const isOpen = expanded === o._id;
            const date = new Date(o.createdAt).toLocaleDateString("en-ZM", {
              day: "numeric", month: "short", year: "numeric",
            });

            return (
              <div
                key={o._id}
                className={`order-card ${isOpen ? "order-card--open" : ""}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* ── Row summary ── */}
                <div
                  className="order-card__row"
                  onClick={() => toggleExpand(o._id)}
                >
                  {/* Left: order id + date */}
                  <div className="order-card__meta">
                    <span className="order-card__id">
                      #{o._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="order-card__date">{date}</span>
                  </div>

                  {/* Centre: items preview */}
                  <div className="order-card__thumbs">
                    {(o.orderItems || []).slice(0, 4).map((item, idx) => (
                      <div key={idx} className="order-card__thumb-wrap">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="order-card__thumb"
                          />
                        ) : (
                          <div className="order-card__thumb order-card__thumb--empty" />
                        )}
                      </div>
                    ))}
                    {o.orderItems?.length > 4 && (
                      <div className="order-card__thumb-more">
                        +{o.orderItems.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Right: total + status + chevron */}
                  <div className="order-card__right">
                    <span className="order-card__total">
                      K{Number(o.totalPrice).toFixed(2)}
                    </span>
                    <span className={`order-badge ${status.cls}`}>
                      {status.text}
                    </span>
                    <span className={`order-chevron ${isOpen ? "order-chevron--open" : ""}`}>
                      ›
                    </span>
                  </div>
                </div>

                {/* ── Expanded detail ── */}
                {isOpen && (
                  <div className="order-card__detail">
                    <div className="order-detail__grid">

                      {/* Items */}
                      <div>
                        <p className="order-detail__heading">Items</p>
                        <div className="order-detail__items">
                          {(o.orderItems || []).map((item, idx) => (
                            <div key={idx} className="checkout-item">
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
                              </div>
                              <span className="cart-summary__val">
                                K{(item.price * item.qty).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping */}
                      <div>
                        <p className="order-detail__heading">Shipping</p>
                        <div className="order-detail__address">
                          <p>{o.shippingAddress?.address}</p>
                          <p>{o.shippingAddress?.city}</p>
                          <p>{o.shippingAddress?.country}</p>
                        </div>

                        <p className="order-detail__heading" style={{ marginTop: "1.25rem" }}>
                          Payment
                        </p>
                        <div className="order-detail__address">
                          <p>
                            {o.isPaid
                              ? `Paid on ${new Date(o.paidAt).toLocaleDateString()}`
                              : "Payment pending"}
                          </p>
                          {o.isDelivered && (
                            <p>Delivered on {new Date(o.deliveredAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pay now */}
                    {!o.isPaid && (
                      <div className="order-detail__pay">
                        <div className="cart-summary__divider" style={{ margin: "1rem 0" }} />
                        <div className="order-detail__pay-row">
                          <div>
                            <p className="order-detail__pay-label">Amount due</p>
                            <p className="cart-summary__total-val">
                              K{Number(o.totalPrice).toFixed(2)}
                            </p>
                          </div>
                          <button
                            className="auth-btn order-pay-btn"
                            onClick={() => markPaid(o._id)}
                            disabled={payingId === o._id}
                          >
                            {payingId === o._id
                              ? <span className="btn-spinner" />
                              : "Pay Now"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;