import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderPageStyle.css";

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:9090/api/orders", {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok)
          throw new Error(data.error || "Failed to fetch orders");
        setOrders(data.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="orders-page">
      {/* ===== Header ===== */}
      <div className="orders-header">
        <h1>Your Orders</h1>
        <button className="back-btn" onClick={() => navigate("/products")}>
          ✖ Close
        </button>
      </div>

      {/* ===== Loading / Error / No Orders ===== */}
      {loading ? (
        <p className="orders-loading">Loading your orders...</p>
      ) : error ? (
        <p className="orders-error">{error}</p>
      ) : orders.length === 0 ? (
        <p className="no-orders">You have no orders yet. Start shopping!</p>
      ) : (
        /* ===== Orders Grid ===== */
        <div className="orders-grid">
          {orders.map((order, index) => (
            <div
              key={index}
              className="order-card"
              onClick={() => setSelectedOrder(order)}
            >
              <img
                src={
                  order.image_url ||
                  "https://via.placeholder.com/250x180?text=No+Image"
                }
                alt={order.name}
              />
              <div className="order-details">
                <h3>{order.name}</h3>
                <p className="truncate-text">{order.description}</p>
                <p>Qty: {order.quantity}</p>
                <p>Price per Unit: ₹{order.price_per_unit}</p>
                <p>Total: ₹{order.total_price}</p>
                <span className="order-id">Order ID: {order.order_id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Popup Card (Detailed View) ===== */}
      {selectedOrder && (
        <div className="order-popup" onClick={() => setSelectedOrder(null)}>
          <div
            className="order-popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-popup"
              onClick={() => setSelectedOrder(null)}
            >
              ×
            </button>

            <img
              src={
                selectedOrder.image_url ||
                "https://via.placeholder.com/400x250?text=No+Image"
              }
              alt={selectedOrder.name}
            />
            <h2>{selectedOrder.name}</h2>
            <p>{selectedOrder.description}</p>
            <p>
              <strong>Quantity:</strong> {selectedOrder.quantity}
            </p>
            <p>
              <strong>Price per Unit:</strong> ₹{selectedOrder.price_per_unit}
            </p>
            <p>
              <strong>Total:</strong> ₹{selectedOrder.total_price}
            </p>
            <p>
              <strong>Order ID:</strong> {selectedOrder.order_id}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
