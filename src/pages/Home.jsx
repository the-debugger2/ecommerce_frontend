import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../App.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await API.get("/products");
      setProducts(data);
      setFiltered(data);
      setLoaded(true);
    };
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered(products);
      return;
    }
    setFiltered(
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    );
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value === "") setFiltered(products);
  };

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero__bg">
          <div className="hero-circle hero-circle--1" />
          <div className="hero-circle hero-circle--2" />
          <div className="hero-grid" />
        </div>

        <div className="home-hero__content">
          <p className="hero-eyebrow">New arrivals · Fresh stock</p>
          <h1 className="hero-title">
            Shop the <br />
            <span className="hero-title--accent">Latest</span>
          </h1>
          <p className="hero-sub">
            Browse our full catalogue — quality products, fair prices.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <input
              className="hero-search__input"
              type="text"
              placeholder="Search products, categories..."
              value={query}
              onChange={handleQueryChange}
            />
            <button className="hero-search__btn" type="submit">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ── Products Section ── */}
      <section className="home-products">
        <div className="home-products__header">
          <div>
            <span className="section-eyebrow">Catalogue</span>
            <h2 className="section-title">All Products</h2>
          </div>
          <span className="section-count">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </span>
        </div>

        {loaded && filtered.length === 0 && (
          <div className="home-empty">
            No products found for &ldquo;{query}&rdquo;
          </div>
        )}

        <div className="home-grid">
          {filtered.map((p, i) => (
            <div
              key={p._id}
              className="home-card"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => navigate(`/product/${p._id}`)}
            >
              {/* Image */}
              <div className="home-card__img-wrap">
                {p.image ? (
                  <img
                    className="home-card__img"
                    src={p.image}
                    alt={p.name}
                  />
                ) : (
                  <div className="home-card__no-img">No image</div>
                )}
                {p.countInStock === 0 && (
                  <span className="home-card__badge home-card__badge--out">
                    Out of stock
                  </span>
                )}
                {p.category && (
                  <span className="home-card__badge home-card__badge--cat">
                    {p.category}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="home-card__body">
                <h3 className="home-card__name">{p.name}</h3>
                {p.description && (
                  <p className="home-card__desc">{p.description}</p>
                )}
                <div className="home-card__footer">
                  <span className="home-card__price">K{p.price}</span>
                  <button
                    className="home-card__cta"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${p._id}`);
                    }}
                  >
                    View →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;