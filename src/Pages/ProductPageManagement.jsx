import React, { useEffect, useState, useRef } from "react";
import "./ProductPageStyle.css";
import CartManagement from "./CartManagement";
import { useNavigate } from "react-router-dom";

const ProductPageManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const categories = [
    "All",
    "Shirts",
    "Pants",
    "Accessories",
    "Mobiles",
    "Mobile Accessories",
  ];

  const fetchProducts = async (category) => {
    try {
      setLoading(true);
      setError("");
      const url =
        category && category !== "All"
          ? `http://localhost:9090/api/products?category=${category}`
          : "http://localhost:9090/api/products";

      const res = await fetch(url, { method: "GET", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch products");

      setProducts(data.products || []);
      setUser(data.user || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const res = await fetch("http://localhost:9090/api/cart/items", {
        credentials: "include",
      });
      const data = await res.json();
      const count = data?.items?.length || data?.cart?.products?.length || 0;
      setCartCount(count);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
    fetchCartCount();
  }, [selectedCategory]);

  useEffect(() => {
    const interval = setInterval(fetchCartCount, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      const username = user?.username || user?.name || "guest";
      const response = await fetch("http://localhost:9090/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, productId, quantity: 1 }),
      });

      if (response.status === 201) {
        setCartCount((prev) => prev + 1);
        fetchCartCount();
      } else {
        console.error("Failed to add product to cart:", response.status);
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const navigate = useNavigate();

  const handleOrdersClick = () => {
    navigate("/orders");
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:9090/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      document.cookie = "authToken=; Max-Age=0; path=/;";
      window.location.href = "/login";
    }
  };

  return (
    <div className="page-container">
      {/* HEADER */}
      <header className="header">
        <div className="logo">🛍️ ShopSphere 🌍</div>
        <div className="header-actions">
          <span className="cart" onClick={() => setCartVisible(true)}>
            🛒 {cartCount}
          </span>
          <div className="user-profile" ref={dropdownRef}>
            <div
              className="user-name"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              👤 {user ? user.name || user.username : "Guest"}
            </div>
            {showDropdown && user && (
              <div className="dropdown-menu">
                <div className="user-info">
                  <p>
                    <strong>Username: </strong> {user.name || user.username}
                  </p>
                  <p>
                    <strong>Email: </strong> {user.email}
                  </p>
                  <p>
                    <strong>Role: </strong> {user.role || "CUSTOMER"}
                  </p>
                </div>
                <hr />
                <button className="dropdown-btn" onClick={handleOrdersClick}>
                  Orders
                </button>
                <button className="dropdown-btn" onClick={handleLogout}>
                  LogOut
                </button>
              </div>
            )}

            {/* If Guest → show login option */}
            {showDropdown && !user && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-btn"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CATEGORY NAV */}
      <nav className="category-nav">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${
              selectedCategory === cat ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* PRODUCT SECTION */}
      <section className="product-section">
        {!user ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
              fontSize: "1.5rem",
              fontFamily: "'Times New Roman', Times, serif",
              color: "#ffa666ff", // elegant, professional contrast on dark background
            }}
          >
            Please Login To See the Product's
          </div>
        ) : loading ? (
          <p className="loading">Loading products...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : products.length === 0 ? (
          <p className="no-products">No products available</p>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <div
                key={p.product_id}
                className="product-card"
                onClick={() => setSelectedProduct(p)}
              >
                <div className="img-container">
                  <img
                    src={
                      p.images && p.images.length > 0
                        ? p.images[0]
                        : "https://via.placeholder.com/200x200?text=No+Image"
                    }
                    alt={p.name}
                  />
                </div>
                <h3>{p.name}</h3>
                <p className="description">{p.description}</p>
                <p className="price">₹{p.price}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(p.product_id);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div
          className="product-detail-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="product-detail-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="detail-close-btn"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>
            <div className="detail-img-container">
              <img
                src={
                  selectedProduct.images && selectedProduct.images.length > 0
                    ? selectedProduct.images[0]
                    : "https://via.placeholder.com/400x400?text=No+Image"
                }
                alt={selectedProduct.name}
              />
            </div>
            <div className="detail-info">
              <h2>{selectedProduct.name}</h2>
              <p className="detail-description">
                {selectedProduct.description}
              </p>
              <p className="price">₹{selectedProduct.price}</p>
              <button
                onClick={() => handleAddToCart(selectedProduct.product_id)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <CartManagement
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        onCartCountChange={(count) => setCartCount(count)}
      />

      <footer className="footer">
        <div className="footer-content">
          <p>© 2025 ShopSphere — All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductPageManagement;
