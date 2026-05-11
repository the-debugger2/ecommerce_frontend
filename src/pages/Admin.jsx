import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import "../App.css";

// ─── Image Uploader ───────────────────────────────────────────────
const ImageUploader = ({ value, onChange }) => {
  const [preview, setPreview] = useState(value || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();

  useEffect(() => { setPreview(value || null); }, [value]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(data.url);
    } catch {
      setError("Upload failed.");
      setPreview(null);
      onChange("");
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="uploader">
      {preview ? (
        <div className="uploader__preview-wrap">
          <img src={preview} alt="Preview" className="uploader__preview" />
          {uploading && <div className="uploader__overlay"><span className="uploader__spinner" /></div>}
          {!uploading && <button type="button" className="uploader__clear" onClick={clearImage}>✕</button>}
        </div>
      ) : (
        <label className="uploader__dropzone" htmlFor="product-image-modal">
          <span className="uploader__icon">↑</span>
          <span className="uploader__text">Click to upload image</span>
          <span className="uploader__sub">JPG, PNG, WEBP · max 5 MB</span>
        </label>
      )}
      <input ref={inputRef} id="product-image-modal" type="file"
        accept="image/jpeg,image/png,image/webp" className="uploader__input" onChange={handleFile} />
      {error && <p className="uploader__error">{error}</p>}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent }) => (
  <div className="stat-card" style={{ "--stat-accent": accent }}>
    <div className="stat-card__icon">{icon}</div>
    <div className="stat-card__body">
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__label">{label}</p>
    </div>
    <div className="stat-card__glow" />
  </div>
);

// ─── Product Modal ────────────────────────────────────────────────
const ProductModal = ({ editingProduct, onClose, onSaved }) => {
  const emptyForm = { name: "", price: "", description: "", image: "", category: "", countInStock: "" };
  const [form, setForm] = useState(
    editingProduct ? {
      name: editingProduct.name, price: editingProduct.price,
      description: editingProduct.description || "", image: editingProduct.image || "",
      category: editingProduct.category || "", countInStock: editingProduct.countInStock,
    } : emptyForm
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.price) { setError("Name and price are required."); return; }
    setSubmitting(true);
    const payload = { ...form, price: Number(form.price), countInStock: Number(form.countInStock) || 0 };
    try {
      if (editingProduct) {
        const { data } = await API.put(`/products/${editingProduct._id}`, payload);
        onSaved(data, "edit");
      } else {
        const { data } = await API.post("/products", payload);
        onSaved(data, "create");
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="modal-header">
          <h2 className="modal-title">{editingProduct ? "Edit Product" : "New Product"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="admin-error" style={{ margin: "0 1.75rem 0" }}>{error}</div>}

        <form className="modal-body" onSubmit={handleSubmit}>
          <ImageUploader value={form.image} onChange={(url) => setForm((p) => ({ ...p, image: url }))} />

          <div className="field-group">
            <label className="field-label">Name *</label>
            <input className="field-input" name="name" placeholder="Product name" value={form.name} onChange={handleChange} />
          </div>

          <div className="admin-row">
            <div className="field-group">
              <label className="field-label">Price (K) *</label>
              <input className="field-input" name="price" type="number" placeholder="0.00" min="0" step="0.01" value={form.price} onChange={handleChange} />
            </div>
            <div className="field-group">
              <label className="field-label">Stock</label>
              <input className="field-input" name="countInStock" type="number" placeholder="0" min="0" value={form.countInStock} onChange={handleChange} />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Category</label>
            <input className="field-input" name="category" placeholder="e.g. Electronics" value={form.category} onChange={handleChange} />
          </div>

          <div className="field-group">
            <label className="field-label">Description</label>
            <textarea className="field-input field-textarea" name="description" placeholder="Product description..." value={form.description} onChange={handleChange} rows={3} />
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="auth-btn modal-submit-btn" disabled={submitting}>
              {submitting ? <span className="btn-spinner" /> : editingProduct ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Admin ───────────────────────────────────────────────────
const Admin = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [markingId, setMarkingId] = useState(null);

  

  const fetchProducts = async () => {
    try { const { data } = await API.get("/products"); setProducts(data); }
    finally { setLoadingProducts(false); }
  };

  const fetchOrders = async () => {
    try { const { data } = await API.get("/orders"); setOrders(data); }
    finally { setLoadingOrders(false); }
  };

  const totalRevenue = orders.filter((o) => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingOrders = orders.filter((o) => o.isPaid && !o.isDelivered);
  const unpaidOrders = orders.filter((o) => !o.isPaid);
  const lowStock = products.filter((p) => p.countInStock <= 3);

  const handleSaved = (saved, type) => {
    if (type === "create") setProducts((p) => [saved, ...p]);
    else setProducts((p) => p.map((x) => (x._id === saved._id ? saved : x)));
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await API.delete(`/products/${id}`);
    setProducts((p) => p.filter((x) => x._id !== id));
  };

  const markDelivered = async (orderId) => {
    setMarkingId(orderId);
    try {
      await API.put(`/orders/${orderId}/deliver`);
      setOrders((prev) => prev.map((o) =>
        o._id === orderId ? { ...o, isDelivered: true, deliveredAt: new Date() } : o
      ));
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setMarkingId(null);
    }
  };
  
useEffect(() => { fetchProducts(); fetchOrders(); }, []);
  return (
    <div className="admin-page">

      {/* ── Header ── */}
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">Control Panel</span>
          <h1 className="admin-title">Dashboard</h1>
        </div>
        <button className="auth-btn admin-new-btn" onClick={() => { setEditingProduct(null); setModalOpen(true); }}>
          + New Product
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        <StatCard label="Total Revenue" value={`K${totalRevenue.toFixed(2)}`} icon="💰" accent="#d4a843" />
        <StatCard label="Total Orders" value={orders.length} icon="📦" accent="#7a9cf5" />
        <StatCard label="Pending Delivery" value={pendingOrders.length} icon="🚚" accent="#f5a623" />
        <StatCard label="Unpaid Orders" value={unpaidOrders.length} icon="⏳" accent="#e74c3c" />
        <StatCard label="Products" value={products.length} icon="🛍️" accent="#4caf82" />
        <StatCard label="Low Stock" value={lowStock.length} icon="⚠️" accent="#e67e22" />
      </div>

      {/* ── Tabs ── */}
      <div className="admin-tabs">
        <button className={`admin-tab-btn ${activeTab === "products" ? "admin-tab-btn--active" : ""}`} onClick={() => setActiveTab("products")}>
          Products <span className="admin-tab-count">{products.length}</span>
        </button>
        <button className={`admin-tab-btn ${activeTab === "orders" ? "admin-tab-btn--active" : ""}`} onClick={() => setActiveTab("orders")}>
          Pending Delivery
          {pendingOrders.length > 0 && (
            <span className="admin-tab-count admin-tab-count--alert">{pendingOrders.length}</span>
          )}
        </button>
      </div>

      {/* ── Products Tab ── */}
      {activeTab === "products" && (
        loadingProducts ? <div className="admin-loading">Loading products...</div> :
        products.length === 0 ? (
          <div className="admin-empty">No products yet. <button className="switch-link" onClick={() => setModalOpen(true)}>Add your first →</button></div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <div key={p._id} className="product-card">
                <div className="product-card__img-wrap">
                  {p.image ? <img src={p.image} alt={p.name} className="product-card__img" /> : <div className="product-card__no-img">No image</div>}
                  {p.countInStock <= 3 && (
                    <span className="product-card__low-stock">
                      {p.countInStock === 0 ? "Out of stock" : `Only ${p.countInStock} left`}
                    </span>
                  )}
                </div>
                <div className="product-card__body">
                  <div className="product-card__top">
                    <h3 className="product-card__name">{p.name}</h3>
                    {p.category && <span className="product-card__tag">{p.category}</span>}
                  </div>
                  <div className="product-card__meta">
                    <span className="product-card__price">K{p.price}</span>
                    <span className="product-card__stock">{p.countInStock} in stock</span>
                  </div>
                  {p.description && <p className="product-card__desc">{p.description}</p>}
                  <div className="product-card__actions">
                    <button className="action-btn action-btn--edit" onClick={() => { setEditingProduct(p); setModalOpen(true); }}>Edit</button>
                    <button className="action-btn action-btn--delete" onClick={() => deleteProduct(p._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Pending Delivery Tab ── */}
      {activeTab === "orders" && (
        loadingOrders ? <div className="admin-loading">Loading orders...</div> :
        pendingOrders.length === 0 ? (
          <div className="admin-empty">🎉 No pending deliveries right now.</div>
        ) : (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Shipping To</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <span className="order-card__id">#{o._id.slice(-8).toUpperCase()}</span>
                      <span className="orders-table__date">
                        {new Date(o.createdAt).toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td>
                      <span className="orders-table__name">{o.user?.name || "—"}</span>
                      <span className="orders-table__email">{o.user?.email || ""}</span>
                    </td>
                    <td>
                      <div className="order-card__thumbs">
                        {(o.orderItems || []).slice(0, 3).map((item, i) => (
                          <div key={i} className="order-card__thumb-wrap">
                            {item.image
                              ? <img src={item.image} alt={item.name} className="order-card__thumb" />
                              : <div className="order-card__thumb order-card__thumb--empty" />}
                          </div>
                        ))}
                        {o.orderItems?.length > 3 && (
                          <div className="order-card__thumb-more">+{o.orderItems.length - 3}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="orders-table__name">{o.shippingAddress?.city}</span>
                      <span className="orders-table__email">{o.shippingAddress?.address}</span>
                    </td>
                    <td>
                      <span className="product-card__price">K{Number(o.totalPrice).toFixed(2)}</span>
                    </td>
                    <td>
                      <span className={`order-badge ${o.isPaid ? "badge--paid" : "badge--pending"}`}>
                        {o.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn action-btn--deliver"
                        onClick={() => markDelivered(o._id)}
                        disabled={markingId === o._id}
                      >
                        {markingId === o._id
                          ? <span className="btn-spinner" style={{ width: 12, height: 12 }} />
                          : "Mark Delivered"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── Modal ── */}
      {modalOpen && (
        <ProductModal
          editingProduct={editingProduct}
          onClose={() => { setModalOpen(false); setEditingProduct(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default Admin;