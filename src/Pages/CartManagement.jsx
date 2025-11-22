import React, { useEffect, useState } from "react";
import "./CartManagement.css";
import { useNavigate } from "react-router-dom";

const CartManagement = ({ onClose, visible, onCartCountChange }) => {
  const [cartItems, setCartItems] = useState([]);
  const [username, setUsername] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const response = await fetch("http://localhost:9090/api/cart/items", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch cart items");
      const data = await response.json();

      const items =
        data?.cart?.products?.map((item) => ({
          ...item,
          product_id: item.productId,
          total_price: parseFloat(item.total_price).toFixed(2),
          price_per_unit: parseFloat(item.price_per_unit).toFixed(2),
        })) || [];

      setCartItems(items);
      setUsername(data?.username || "Guest");

      if (typeof onCartCountChange === "function") {
        onCartCountChange(items.length);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  useEffect(() => {
    if (visible) fetchCartItems();
  }, [visible]);

  // Auto-calc subtotal
  useEffect(() => {
    const total = cartItems
      .reduce((sum, item) => sum + parseFloat(item.total_price), 0)
      .toFixed(2);
    setSubtotal(total);
  }, [cartItems]);

  // Remove item
  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch("http://localhost:9090/api/cart/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, productId }),
      });

      if (response.status === 204) {
        const updatedItems = cartItems.filter(
          (item) => item.product_id !== productId
        );
        setCartItems(updatedItems);
        if (typeof onCartCountChange === "function") {
          onCartCountChange(updatedItems.length);
        }
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Quantity change
  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        handleRemoveItem(productId);
        return;
      }

      const response = await fetch("http://localhost:9090/api/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, productId, quantity: newQuantity }),
      });

      if (response.ok) {
        fetchCartItems();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // ✅ Razorpay Checkout Handler
  const handleCheckout = async () => {
    try {
      const requestBody = {
        totalAmount: parseFloat(subtotal) + 99, // Including shipping
        cartItems: cartItems.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price_per_unit,
        })),
      };

      // Create Razorpay order via backend
      const response = await fetch("http://localhost:9090/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(await response.text());
      const razorpayOrderId = await response.text();

      // Configure Razorpay checkout options
      const options = {
        key: "rzp_test_RYSJp9L9UYqbbt", // your Razorpay Key ID
        amount: (parseFloat(subtotal) + 99) * 100, // Convert to paise
        currency: "INR",
        name: "ShopSphere",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(
              "http://localhost:9090/api/payment/verify",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              }
            );

            const result = await verifyResponse.text();
            if (verifyResponse.ok) {
              // ✅ Show success popup instead of just alert
              setShowSuccessPopup(true);

              // Empty cart in UI
              setCartItems([]);
              if (typeof onCartCountChange === "function") {
                onCartCountChange(0);
              }

              // Auto close popup and redirect
              setTimeout(() => {
                setShowSuccessPopup(false);
                onClose(); // close cart modal
                navigate("/products"); // redirect to product page
              }, 2500);
            } else {
              alert("Payment verification failed: " + result);
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            alert("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: username,
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Payment failed. Please try again.");
      console.error("Error during checkout:", error);
    }
  };

  useEffect(() => {
    if (cartItems.length === 0 && typeof onCartCountChange === "function") {
      onCartCountChange(0);
    }
  }, [cartItems, onCartCountChange]);

  if (!visible) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Cart 🛒</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="empty-cart">Your cart is empty 😔</p>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.product_id} className="cart-item">
                  <img
                    src={
                      item.image_url
                        ? item.image_url
                        : "https://via.placeholder.com/100"
                    }
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p className="price">₹{item.price_per_unit}</p>
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product_id,
                            item.quantity - 1
                          )
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product_id,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.product_id)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cart-item-total">₹{item.total_price}</div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <p>
                <span>Subtotal:</span> <span>₹{subtotal}</span>
              </p>
              <p>
                <span>Shipping:</span> <span>₹99</span>
              </p>
              <hr />
              <p className="total">
                <span>Total:</span>{" "}
                <span>₹{(parseFloat(subtotal) + 99).toFixed(2)}</span>
              </p>
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {/* ✅ Success Popup */}
        {showSuccessPopup && (
          <div className="payment-success-popup">
            <div className="popup-content">
              <h2>✅ Payment Successful!</h2>
              <br></br>
              <p>🙏 Thank you for your Purchase 💖</p>
              <br></br>
              <p>Redirecting to Products...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartManagement;
