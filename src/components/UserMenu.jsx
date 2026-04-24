import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../App.css";

const UserMenu = () => {
  const { userInfo: user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const btnRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (
        open &&
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleOrders = () => {
    setOpen(false);
    navigate("/orders");
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };
  console.log("UserMenu user:", user);
  if (!user) return null;

  // Derive initials from name
  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        ref={btnRef}
        className={`user-btn ${open ? "user-btn--active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
      >
        <div className="user-btn__avatar">
          <span className="user-btn__initials">{initials}</span>
        </div>
      </button>

      {/* ── Modal ── */}
      {open && (
        <>
          <div className="user-modal-backdrop" onClick={() => setOpen(false)} />
          <div className="user-modal" ref={modalRef} role="dialog" aria-modal="true">

            {/* Profile header */}
            <div className="user-modal__header">
              <div className="user-modal__avatar-wrap">
                {/* Placeholder silhouette */}
                <div className="user-modal__avatar">
                  <svg
                    className="user-modal__avatar-icon"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="24" cy="18" r="9" fill="currentColor" opacity="0.5" />
                    <path
                      d="M6 42c0-9.941 8.059-18 18-18s18 8.059 18 18"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.4"
                    />
                  </svg>
                </div>
                <div className="user-modal__avatar-ring" />
              </div>

              <div className="user-modal__info">
                <p className="user-modal__name">{user.name}</p>
                <p className="user-modal__email">{user.email}</p>
                {user.role === "admin" && (
                  <span className="user-modal__role-badge">Admin</span>
                )}
              </div>
            </div>

            <div className="user-modal__divider" />

            {/* Menu items */}
            <nav className="user-modal__nav">
              <button className="user-modal__item" onClick={handleOrders}>
                <span className="user-modal__item-icon">📦</span>
                <span className="user-modal__item-label">Order History</span>
                <span className="user-modal__item-arrow">›</span>
              </button>

              {user.role === "admin" && (
                <button
                  className="user-modal__item"
                  onClick={() => { setOpen(false); navigate("/admin"); }}
                >
                  <span className="user-modal__item-icon">⚙️</span>
                  <span className="user-modal__item-label">Admin Dashboard</span>
                  <span className="user-modal__item-arrow">›</span>
                </button>
              )}
            </nav>

            <div className="user-modal__divider" />

            {/* Logout */}
            <button className="user-modal__logout" onClick={handleLogout}>
              <span>Sign Out</span>
              <span className="user-modal__logout-icon">→</span>
            </button>

          </div>
        </>
      )}
    </>
  );
};

export default UserMenu;