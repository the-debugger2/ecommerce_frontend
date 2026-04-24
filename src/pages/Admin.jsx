import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import "../App.css";

// ─── Image Upload Field ───────────────────────────────────────────────────
const ImageUploader = ({ value, onChange }) => {
  const [preview, setPreview] = useState(value || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local preview immediately
    setPreview(URL.createObjectURL(file));
    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onChange(data.url); // pass Cloudinary URL up to form state
    } catch (err) {
      setError("Upload failed. Please try again.");
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
          {uploading && (
            <div className="uploader__overlay">
              <span className="uploader__spinner" />
            </div>
          )}
          {!uploading && (
            <button type="button" className="uploader__clear" onClick={clearImage}>
              ✕
            </button>
          )}
        </div>
      ) : (
        <label className="uploader__dropzone" htmlFor="product-image">
          <span className="uploader__icon">↑</span>
          <span className="uploader__text">Click to upload image</span>
          <span className="uploader__sub">JPG, PNG, WEBP · max 5 MB</span>
        </label>
      )}
      <input
        ref={inputRef}
        id="product-image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="uploader__input"
        onChange={handleFile}
      />
      {error && <p className="uploader__error">{error}</p>}
    </div>
  );
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────
const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
    countInStock: "",
  };

  const [form, setForm] = useState(emptyForm);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (url) => {
    setForm((prev) => ({ ...prev, image: url }));
  };

  // Create or update
  const submitForm = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name || !form.price) {
      setFormError("Name and price are required.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        countInStock: Number(form.countInStock) || 0,
      };

      if (editingId) {
        const { data } = await API.put(`/products/${editingId}`, payload);
        setProducts(products.map((p) => (p._id === editingId ? data : p)));
        setEditingId(null);
      } else {
        const { data } = await API.post("/products", payload);
        setProducts([data, ...products]);
      }

      setForm(emptyForm);
    } catch (error) {
      setFormError(error.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      description: product.description || "",
      image: product.image || "",
      category: product.category || "",
      countInStock: product.countInStock,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await API.delete(`/products/${id}`);
    setProducts(products.filter((p) => p._id !== id));
  };

  return (
    <div className="admin-page">
      {/* ── Header ── */}
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">Control Panel</span>
          <h1 className="admin-title">Products</h1>
        </div>
        <div className="admin-count">{products.length} items</div>
      </div>

      <div className="admin-layout">
        {/* ── Form Panel ── */}
        <aside className="admin-form-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              {editingId ? "Edit Product" : "New Product"}
            </h2>
            {editingId && (
              <button className="cancel-btn" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>

          {formError && <div className="admin-error">{formError}</div>}

          <form className="admin-form" onSubmit={submitForm}>
            <ImageUploader value={form.image} onChange={handleImageChange} />

            <div className="field-group">
              <label className="field-label">Name *</label>
              <input
                className="field-input"
                name="name"
                placeholder="Product name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="admin-row">
              <div className="field-group">
                <label className="field-label">Price (K) *</label>
                <input
                  className="field-input"
                  name="price"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Stock</label>
                <input
                  className="field-input"
                  name="countInStock"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={form.countInStock}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Category</label>
              <input
                className="field-input"
                name="category"
                placeholder="e.g. Electronics"
                value={form.category}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Description</label>
              <textarea
                className="field-input field-textarea"
                name="description"
                placeholder="Product description..."
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <button className="auth-btn" type="submit" disabled={submitting}>
              {submitting ? (
                <span className="btn-spinner" />
              ) : editingId ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </button>
          </form>
        </aside>

        {/* ── Product List ── */}
        <main className="admin-list">
          {loading ? (
            <div className="admin-loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="admin-empty">No products yet. Add one →</div>
          ) : (
            <div className="product-grid">
              {products.map((p) => (
                <div key={p._id} className="product-card">
                  <div className="product-card__img-wrap">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="product-card__img"
                      />
                    ) : (
                      <div className="product-card__no-img">No image</div>
                    )}
                  </div>
                  <div className="product-card__body">
                    <div className="product-card__top">
                      <h3 className="product-card__name">{p.name}</h3>
                      {p.category && (
                        <span className="product-card__tag">{p.category}</span>
                      )}
                    </div>
                    <div className="product-card__meta">
                      <span className="product-card__price">K{p.price}</span>
                      <span className="product-card__stock">
                        {p.countInStock > 0
                          ? `${p.countInStock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                    {p.description && (
                      <p className="product-card__desc">{p.description}</p>
                    )}
                    <div className="product-card__actions">
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() => startEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => deleteProduct(p._id)}
                      >
                        Delete product
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;