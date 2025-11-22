import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboardStyle.css";

// ===== FOOTER COMPONENT =====
function Footer() {
  return (
    <footer className="admin-footer">
      <div>© {new Date().getFullYear()} ShopSphere. All Rights Reserved.</div>
      <div className="footer-links">
        <a href="#">Privacy</a> | <a href="#">Terms</a> |{" "}
        <a href="#">Support</a>
      </div>
    </footer>
  );
}

// ===== REUSABLE MODAL COMPONENT =====
function CustomModal({ modalType, onClose, onSubmit, response }) {
  const [inputData, setInputData] = useState({
    id: "",
    name: "",
    price: "",
    category: "",
    stock: "",
    username: "",
    email: "",
    role: "",
    date: "",
    month: "",
    year: "",
    description: "",
    imageUrl: "",
    userId: "",
  });

  const handleChange = (e) => {
    setInputData({ ...inputData, [e.target.name]: e.target.value });
  };

  const renderFields = () => {
    switch (modalType) {
      case "addProduct":
        return (
          <>
            <input
              name="name"
              type="text"
              placeholder="Product Name"
              onChange={handleChange}
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              onChange={handleChange}
            />
            <input
              name="category"
              type="text"
              placeholder="Category ID"
              onChange={handleChange}
            />
            <input
              name="stock"
              type="number"
              placeholder="Stock"
              onChange={handleChange}
            />
            <input
              name="imageUrl"
              type="text"
              placeholder="Image URL"
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder="Description"
              onChange={handleChange}
            />
          </>
        );

      case "deleteProduct":
        return (
          <input
            name="id"
            type="text"
            placeholder="Enter Product ID"
            onChange={handleChange}
          />
        );

      case "modifyUser":
        return (
          <>
            <input
              name="userId"
              type="text"
              placeholder="Enter User ID"
              onChange={handleChange}
            />
            <input
              name="username"
              type="text"
              placeholder="Enter Username"
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Enter Email"
              onChange={handleChange}
            />
            <input
              name="role"
              type="text"
              placeholder="New Role (ADMIN / CUSTOMER)"
              onChange={handleChange}
            />
          </>
        );

      case "viewUser":
        return (
          <>
            <input
              name="userId"
              type="text"
              placeholder="Enter User ID"
              onChange={handleChange}
            />
            {response && !response.error && (
              <div className="user-details-card">
                <h4>User Details</h4>
                <div className="user-info">
                  <p>
                    <strong>User ID:</strong> {response.userId}
                  </p>
                  <p>
                    <strong>Username:</strong> {response.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {response.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {response.role}
                  </p>
                </div>
              </div>
            )}
          </>
        );

      case "businessReports": {
        const [reportType, setReportType] = useState("");
        const [reportPopup, setReportPopup] = useState(false);

        const handleReportType = (type) => {
          setReportType(type);
        };

        const renderReportInputs = () => {
          switch (reportType) {
            case "daily":
              return (
                <input
                  name="date"
                  type="date"
                  onChange={handleChange}
                  placeholder="Select Date"
                />
              );
            case "monthly":
              return (
                <>
                  <input
                    name="month"
                    type="number"
                    placeholder="Month (1–12)"
                    onChange={handleChange}
                  />
                  <input
                    name="year"
                    type="number"
                    placeholder="Year"
                    onChange={handleChange}
                  />
                </>
              );
            case "yearly":
              return (
                <input
                  name="year"
                  type="number"
                  placeholder="Year"
                  onChange={handleChange}
                />
              );
            default:
              return null;
          }
        };

        return (
          <>
            <div className="report-buttons">
              {["daily", "monthly", "yearly", "overall"].map((type) => (
                <button
                  key={type}
                  className={`modal-btn submit ${
                    reportType === type ? "active" : ""
                  }`}
                  onClick={() => handleReportType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="report-inputs">{renderReportInputs()}</div>

            {reportType && (
              <button
                className="modal-btn submit"
                onClick={() => {
                  onSubmit(reportType, inputData);
                  setTimeout(() => setReportPopup(true), 400);
                }}
              >
                Generate Report
              </button>
            )}

            {/* ✅ Report Popup Card */}
            {reportPopup && response && !response.error && (
              <div className="report-popup">
                <div className="report-popup-content">
                  <h4>📊 Report Result</h4>
                  <div className="json-box">
                    <p>
                      <strong>Total Revenue:</strong>{" "}
                      <span className="revenue-amount">
                        ₹{response.totalRevenue}
                      </span>
                    </p>

                    {response.categorySales && (
                      <div className="sales-data">
                        <h5>🛍️ Category Sales:</h5>
                        <ul className="category-sales-text">
                          {Object.entries(response.categorySales).map(
                            ([category, count]) => (
                              <li key={category}>
                                <span>{category}:</span> <span>{count}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    className="modal-btn close"
                    onClick={() => setReportPopup(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {response?.error && (
              <div className="response-error">⚠️ {response.error}</div>
            )}
          </>
        );
      }

      default:
        return null;
    }
  };

  const titleMap = {
    addProduct: "Add Product",
    deleteProduct: "Delete Product",
    modifyUser: "Modify User",
    viewUser: "View User",
    businessReports: "Business Reports",
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{titleMap[modalType]}</h3>
        <div className="modal-body">{renderFields()}</div>

        {/* Simplified Response Display */}
        {response && (
          <div className="response-box">
            {response.message && (
              <div className="response-success">{response.message}</div>
            )}
            {response.error && (
              <div className="response-error">⚠️ {response.error}</div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button
            className="modal-btn submit"
            onClick={() => onSubmit(modalType, inputData)}
          >
            Submit
          </button>
          <button className="modal-btn close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== SUB COMPONENTS =====
const ProductManagement = ({ openModal }) => (
  <div className="dashboard-card">
    <div className="card-content">
      <h3>Product Management</h3>
      <p>Add or delete products easily from one dashboard.</p>
      <div className="card-actions">
        <button
          className="modal-btn submit"
          onClick={() => openModal("addProduct")}
        >
          Add Product
        </button>
        <button
          className="modal-btn submit"
          onClick={() => openModal("deleteProduct")}
        >
          Delete Product
        </button>
      </div>
    </div>
  </div>
);

const UserManagement = ({ openModal }) => (
  <div className="dashboard-card">
    <div className="card-content">
      <h3>User Management</h3>
      <p>Modify user roles securely and view user details.</p>
      <div className="card-actions">
        <button
          className="modal-btn submit"
          onClick={() => openModal("modifyUser")}
        >
          Modify User
        </button>
        <button
          className="modal-btn submit"
          onClick={() => openModal("viewUser")}
        >
          View User
        </button>
      </div>
    </div>
  </div>
);

const BusinessReports = ({ openModal }) => (
  <div className="dashboard-card">
    <div className="card-content">
      <h3>Business Reports</h3>
      <p>View daily, monthly, yearly, or overall business metrics.</p>
      <div className="card-actions">
        <button
          className="modal-btn submit"
          onClick={() => openModal("businessReports")}
        >
          Generate Reports
        </button>
      </div>
    </div>
  </div>
);

// ===== MAIN ADMIN DASHBOARD =====
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [modalType, setModalType] = useState(null);
  const [response, setResponse] = useState(null);
  const token = localStorage.getItem("token");

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:9090/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        localStorage.removeItem("token");
        navigate("/admin");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSubmit = async (type, data) => {
    let url = "";
    let method = "GET";
    let body = null;

    try {
      switch (type) {
        case "addProduct":
          url = "http://localhost:9090/admin/products/add";
          method = "POST";
          body = JSON.stringify({
            name: data.name,
            description: data.description || "Default Description",
            price: Number(data.price),
            stock: Number(data.stock),
            categoryId: data.category || 1,
            imageUrl: data.imageUrl || "default.jpg",
          });
          break;
        case "deleteProduct":
          url = "http://localhost:9090/admin/products/delete";
          method = "DELETE";
          body = JSON.stringify({ productId: Number(data.id) });
          break;
        case "modifyUser":
          url = "http://localhost:9090/admin/user/modify";
          method = "PUT";
          body = JSON.stringify({
            userId: Number(data.userId),
            username: data.username,
            email: data.email,
            role: data.role,
          });
          break;
        case "viewUser":
          url = "http://localhost:9090/admin/user/getbyid";
          method = "POST";
          body = JSON.stringify({ userId: Number(data.userId) });
          break;
        case "daily":
          url = `http://localhost:9090/admin/business/daily?date=${data.date}`;
          break;
        case "monthly":
          url = `http://localhost:9090/admin/business/monthly?month=${data.month}&year=${data.year}`;
          break;
        case "yearly":
          url = `http://localhost:9090/admin/business/yearly?year=${data.year}`;
          break;
        case "overall":
          url = `http://localhost:9090/admin/business/overall`;
          break;
        default:
          throw new Error("Invalid action");
      }

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: method !== "GET" ? body : undefined,
      });

      const resultText = await res.text();
      if (!res.ok) throw new Error(resultText || `HTTP ${res.status}`);

      let result;
      try {
        result = JSON.parse(resultText);
      } catch {
        result = resultText;
      }

      if (type === "addProduct")
        setResponse({ message: "✅ Product added successfully!" });
      else if (type === "deleteProduct")
        setResponse({ message: "🗑️ Product deleted successfully!" });
      else if (type === "modifyUser")
        setResponse({ message: "✅ User modified successfully!" });
      else setResponse(result);

      if (["addProduct", "deleteProduct", "modifyUser"].includes(type)) {
        setTimeout(() => {
          setModalType(null);
          setResponse(null);
        }, 1500);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setResponse({ error: error.message || "Request failed" });
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setResponse(null);
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h2 className="logo">🛍️ ShopSphere 🌍</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="admin-main">
        <div className="card-grid">
          <ProductManagement openModal={openModal} />
          <UserManagement openModal={openModal} />
          <BusinessReports openModal={openModal} />
        </div>
      </main>

      <Footer />

      {modalType && (
        <CustomModal
          modalType={modalType}
          onClose={() => {
            setModalType(null);
            setResponse(null);
          }}
          onSubmit={handleSubmit}
          response={response}
        />
      )}
    </div>
  );
}
