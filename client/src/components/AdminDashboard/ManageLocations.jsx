import React, { useState, useEffect } from "react";
import styles from "./ManageLocations.module.css";

const ManageLocations = () => {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");

  // Fetch Locations
  useEffect(() => {
    fetch("http://localhost:5000/api/locations")
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => console.error(err));
  }, []);

  // Add
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/locations", {
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
      await fetch(`http://localhost:5000/api/locations/${id}`, { method: "DELETE" });
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
      
      {/* Add Location Form */}
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Add New Location</h2>
        <form onSubmit={handleAdd} className={styles.form}>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="Enter City/Area Name (e.g. Hyderabad)" 
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
          />
          <button type="submit" className={styles.addBtn}>Add Location</button>
        </form>
      </div>

      {/* Locations List */}
      <div className={styles.listSection}>
        <h2 className={styles.sectionTitle}>All Locations ({locations.length})</h2>
        {locations.length === 0 ? (
          <div className={styles.noData}>No locations added yet. Add your first location above.</div>
        ) : (
          <ul className={styles.list}>
            {locations.map(loc => (
              <li key={loc._id} className={styles.item}>
                <span className={styles.locationName}>{loc.name}</span>
                <button className={styles.deleteBtn} onClick={() => handleDelete(loc._id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageLocations;