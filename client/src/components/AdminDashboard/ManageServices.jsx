import React, { useState, useEffect } from "react";
import styles from "./ManageServices.module.css";

const ManageServices = () => {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  
  // Form States
  const [newCatName, setNewCatName] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");

  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/services-data");
      const data = await res.json();
      setCategories(data.categories);
      setServices(data.services);
      
      // Default select to first category if available
      if (data.categories.length > 0) {
        setSelectedCatId(data.categories[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/admin/categories/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setCategories([...categories, data.category]);
        setNewCatName("");
        if (!selectedCatId) setSelectedCatId(data.category._id); // Auto select if first
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to add category");
    }
  };

  // 3. Add Service
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newServiceName.trim() || !selectedCatId) return;

    try {
      const res = await fetch("http://localhost:5000/api/admin/services/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newServiceName, categoryId: selectedCatId }),
      });
      const data = await res.json();

      if (res.ok) {
        setServices([...services, data.service]);
        setNewServiceName("");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to add service");
    }
  };

  // 4. Delete Functions
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Deleting a category will delete ALL its services. Continue?")) return;
    
    try {
      await fetch(`http://localhost:5000/api/admin/categories/${id}`, { method: "DELETE" });
      setCategories(categories.filter(c => c._id !== id));
      setServices(services.filter(s => s.category?._id !== id)); // Remove local services
    } catch (err) { console.error(err); }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Remove this service?")) return;

    try {
      await fetch(`http://localhost:5000/api/admin/services/${id}`, { method: "DELETE" });
      setServices(services.filter(s => s._id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) return <p>Loading data...</p>;

  return (
    <div className={styles.container}>
      
      {/* LEFT: Manage Categories */}
      <div className={styles.column}>
        <h2 className={styles.heading}>Categories</h2>
        
        <form onSubmit={handleAddCategory} className={styles.form}>
          <input 
            type="text" 
            placeholder="New Category (e.g. Home Repairs)" 
            className={styles.input}
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />
          <button type="submit" className={styles.addBtn}>Add</button>
        </form>

        <ul className={styles.list}>
          {categories.map(cat => (
            <li key={cat._id} className={styles.item}>
              <span className={styles.itemName}>{cat.name}</span>
              <button 
                className={styles.deleteBtn}
                onClick={() => handleDeleteCategory(cat._id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT: Manage Services */}
      <div className={styles.column}>
        <h2 className={styles.heading}>Services</h2>

        <form onSubmit={handleAddService} className={styles.form}>
          <select 
            className={styles.select}
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Service Name (e.g. Plumbing)" 
            className={styles.input}
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
          />
          <button type="submit" className={styles.addBtn}>Add</button>
        </form>

        <ul className={styles.list}>
          {services.map(service => (
            <li key={service._id} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{service.name}</span>
                <span className={styles.itemSub}>
                  {service.category?.name || "Uncategorized"}
                </span>
              </div>
              <button 
                className={styles.deleteBtn}
                onClick={() => handleDeleteService(service._id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default ManageServices;