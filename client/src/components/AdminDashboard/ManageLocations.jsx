import React, { useState, useEffect } from "react";
import styles from "./ManageLocations.module.css";

const ManageLocations = () => {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");

  // Fetch
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/locations")
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => console.error(err));
  }, []);

  // Add
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/admin/locations/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLocation })
      });
      const data = await res.json();

      if (res.ok) {
        setLocations([...locations, data.location].sort((a,b) => a.name.localeCompare(b.name)));
        setNewLocation("");
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this location?")) return;
    try {
      await fetch(`http://localhost:5000/api/admin/locations/${id}`, { method: "DELETE" });
      setLocations(locations.filter(l => l._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Manage Locations</h1>
        <p className={styles.pageSubtitle}>Add and manage service locations</p>
      </div>
      
      <form onSubmit={handleAdd} className={styles.form}>
        <input 
          type="text" 
          className={styles.input} 
          placeholder="Enter City/Area Name (e.g. Hyderabad)" 
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
        />
        <button type="submit" className={styles.addBtn}>Add</button>
      </form>

      <ul className={styles.list}>
        {locations.map(loc => (
          <li key={loc._id} className={styles.item}>
            <span>{loc.name}</span>
            <button className={styles.deleteBtn} onClick={() => handleDelete(loc._id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageLocations;