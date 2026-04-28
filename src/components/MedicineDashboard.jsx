import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMedicines, createMedicine, deleteMedicine } from "../api";
import MedicineCard from "./MedicineCard";
import "./MedicineDashboard.css";

const MedicineDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const isPharmacist = user?.role === "pharmacist" || user?.role === "admin";

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem("cart")) || [];
  });

  const [search, setSearch] = useState("");

  // Form State
  const [formData, setFormData] = useState({ name: "", description: "", price: "", quantity: "" });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch medicines from API
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await getAllMedicines();
      setMedicines(data);
    } catch (err) {
      console.error("Failed to load medicines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // We do NOT redirect here because patients and guests should be able to view medicines.
    // The UI handles hiding the "Add Medicine" form for non-pharmacists.
    fetchMedicines();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (medicine, quantity = 1) => {
    if (!user) {
      alert("Please login to buy medicines");
      navigate("/login");
      return;
    }

    if (user.role !== "patient") {
      alert("Only patients can buy medicines");
      return;
    }

    setCart(prev => {
      const exists = prev.find(item => item.id === medicine.id);
      if (exists) {
        return prev.map(item =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...medicine, quantity }];
    });
  };

  const handleBuyNow = (medicine) => {
    handleAddToCart(medicine, 1);
    navigate("/cart");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await deleteMedicine(id);
        setMedicines(medicines.filter(m => m.id !== id));
      } catch (err) {
        console.error("Failed to delete", err);
        alert("Failed to delete medicine");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.quantity) return;

    setSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("description", formData.description);
      formPayload.append("price", formData.price);
      formPayload.append("quantity", formData.quantity);
      if (imageFile) {
        formPayload.append("image", imageFile);
      }

      await createMedicine(formPayload);
      setFormData({ name: "", description: "", price: "", quantity: "" });
      setImageFile(null);
      await fetchMedicines();
      alert("Medicine added successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to add medicine");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="medicine-page">
      <h1 className="medicine-title">Medicines</h1>

      <div className="medicine-top-bar">
        <input
          type="text"
          placeholder="Search medicines..."
          className="medicine-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {user?.role === "patient" && (
          <div
            className="medicine-cart-btn"
            onClick={() => navigate("/cart")}
          >
            🛒 Cart
          </div>
        )}
      </div>

      {isPharmacist && (
        <div className="medicine-form-container" style={{background: "#fff", padding: "20px", borderRadius: "10px", marginBottom: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)"}}>
          <h2>Add New Medicine</h2>
          <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px"}}>
            <input type="text" placeholder="Medicine Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{padding: "10px", borderRadius: "5px", border: "1px solid #ccc", outline: "none"}} />
            <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{padding: "10px", borderRadius: "5px", border: "1px solid #ccc", outline: "none"}} />
            <div style={{display: "flex", gap: "10px"}}>
              <input type="number" placeholder="Price *" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required style={{padding: "10px", borderRadius: "5px", border: "1px solid #ccc", outline: "none", flex: 1}} />
              <input type="number" placeholder="Quantity *" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required style={{padding: "10px", borderRadius: "5px", border: "1px solid #ccc", outline: "none", flex: 1}} />
            </div>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{padding: "10px 0"}} />
            <button type="submit" disabled={submitting} style={{background: "#007bff", color: "white", padding: "10px 15px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold"}}>{submitting ? "Adding..." : "Add Medicine"}</button>
          </form>
        </div>
      )}

      <h2>Available Medicines</h2>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "18px", opacity: 0.7 }}>
            Loading medicines...
          </p>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "18px", opacity: 0.7 }}>
            No medicines available
          </p>
        </div>
      ) : (
        <div className="medicine-grid-vertical">
          {filteredMedicines.map((med) => (
             <div key={med.id} style={{position: "relative"}}>
              <MedicineCard
                medicine={med}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                userRole={user?.role || null}
              />
              {isPharmacist && (
                <button onClick={() => handleDelete(med.id)} style={{position: "absolute", top: "10px", right: "10px", background: "red", color: "white", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontWeight: "bold"}}>✕</button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default MedicineDashboard;
