import React, { useState, useEffect } from "react";
import { getAllMedicines, createMedicine, deleteMedicine as deleteMedicineApi } from "../../api";
import "./Admin.css";

const ManageMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(""); 
  const [submitting, setSubmitting] = useState(false);

  // Fetch medicines from API
  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const data = await getAllMedicines();
      setMedicines(data);
    } catch (error) {
      console.error("Failed to load medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); 
    };
    reader.readAsDataURL(file);
  };

  const addMedicine = async () => {
    if (!name || !price) {
      alert("Please fill all fields");
      return;
    }

    setSubmitting(true);

    try {
      const newMedicine = {
        name,
        price: Number(price),
        image, 
      };

      await createMedicine(newMedicine);

      // Refresh list
      await fetchMedicines();

      setName("");
      setPrice("");
      setImage("");

      alert("Medicine added successfully ✅");
    } catch (error) {
      alert("Failed to add medicine: " + (error.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMedicine = async (id) => {
    try {
      await deleteMedicineApi(id);
      setMedicines(medicines.filter((m) => m.id !== id));
    } catch (error) {
      alert("Failed to delete medicine: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="admin-page">
      <h1>Manage Medicines</h1>

      {/* ===== ADD MEDICINE ===== */}
      <div className="admin-section">
        <h2>Add Medicine</h2>

        <input
          className="admin-input"
          type="text"
          placeholder="Medicine Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="admin-input"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* IMAGE UPLOAD */}
        <input
          className="admin-input"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />

        {/* IMAGE PREVIEW */}
        {image && (
          <img
            src={image}
            alt="preview"
            style={{
              width: "120px",
              height: "80px",
              objectFit: "cover",
              borderRadius: "10px",
              marginBottom: "10px",
            }}
          />
        )}

        <button className="admin-btn" onClick={addMedicine} disabled={submitting}>
          {submitting ? "Adding..." : "Add Medicine"}
        </button>
      </div>

      {/* ===== MEDICINE LIST ===== */}
      <div className="admin-section">
        <h2>Medicine List</h2>

        {loading ? (
          <p className="admin-empty">Loading medicines...</p>
        ) : medicines.length === 0 ? (
          <p className="admin-empty">No medicines available</p>
        ) : (
          medicines.map((m) => (
            <div className="admin-row" key={m.id}>
              <span>
                {m.image && (
                  <img
                    src={m.image}
                    alt={m.name}
                    style={{
                      width: "50px",
                      height: "35px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      marginRight: "10px",
                      verticalAlign: "middle",
                    }}
                  />
                )}
                {m.name} – ₹{m.price}
              </span>

              <button
                className="admin-btn admin-btn-danger"
                onClick={() => deleteMedicine(m.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageMedicines;
