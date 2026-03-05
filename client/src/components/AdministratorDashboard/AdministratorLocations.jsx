import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import styles from "./AdministratorLocations.module.css";

const AdministratorLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    status: "pending_moderator"
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/administrator/locations");
      setLocations(data.data);
    } catch (err) {
      setError(err.message);
      console.error("Locations Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, location = null) => {
    setModalMode(mode);
    if (mode === "edit" && location) {
      setSelectedLocation(location);
      setFormData({
        name: location.name,
        city: location.city || "",
        state: location.state || "",
        status: location.status || "pending_moderator"
      });
    } else {
      setFormData({
        name: "",
        city: "",
        state: "",
        status: "pending_moderator"
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLocation(null);
    setFormData({
      name: "",
      city: "",
      state: "",
      status: "pending_moderator"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === "create") {
        await api.post("/api/administrator/locations", formData);
        alert("Location created successfully");
      } else if (modalMode === "edit") {
        await api.patch(`/api/administrator/locations/${selectedLocation._id}`, formData);
        alert("Location updated successfully");
      }
      
      handleCloseModal();
      fetchLocations();
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error("Submit Error:", err);
    }
  };

  const handleDelete = async (locationId) => {
    if (!window.confirm("Are you sure you want to delete this location? This will fail if there are helpers or moderators assigned to it.")) {
      return;
    }

    try {
      await api.delete(`/api/administrator/locations/${locationId}`);
      alert("Location deleted successfully");
      fetchLocations();
    } catch (err) {
      alert(`Error deleting location: ${err.message}`);
      console.error("Delete Error:", err);
    }
  };

  const getFilteredLocations = () => {
    return locations.filter(location => {
      const matchesSearch = 
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (location.city && location.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (location.state && location.state.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === "all" || location.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  const activeLocations = locations.filter(l => l.status === 'active').length;
  const pendingLocations = locations.filter(l => l.status === 'pending_moderator').length;
  const totalHelpers = locations.reduce((sum, l) => sum + (l.helpersCount || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Locations Management</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{locations.length}</div>
            <div className={styles.statLabel}>Total Locations</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{activeLocations}</div>
            <div className={styles.statLabel}>Active</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{pendingLocations}</div>
            <div className={styles.statLabel}>Pending Moderator</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{totalHelpers}</div>
            <div className={styles.statLabel}>Total Helpers</div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending_moderator">Pending Moderator</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          className={styles.addButton}
          onClick={() => handleOpenModal("create")}
        >
          Add Location
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Location Name</th>
              <th>City</th>
              <th>State</th>
              <th>Status</th>
              <th>Moderator</th>
              <th>Helpers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredLocations().map((location) => (
              <tr key={location._id}>
                <td className={styles.locationName}>{location.name}</td>
                <td>{location.city || "—"}</td>
                <td>{location.state || "—"}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[location.status]}`}>
                    {location.status === 'pending_moderator' ? 'Pending' : 
                     location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                  </span>
                </td>
                <td>{location.moderator ? location.moderator.name : "—"}</td>
                <td>
                  <span className={styles.helpersBadge}>
                    {location.helpersCount || 0}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleOpenModal("edit", location)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(location._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {getFilteredLocations().length === 0 && (
              <tr>
                <td colSpan="7" className={styles.noData}>
                  No locations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modalMode === "create" ? "Create Location" : "Edit Location"}</h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Location Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Sri City"
                />
              </div>
              <div className={styles.formGroup}>
                <label>City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Tirupati"
                />
              </div>
              <div className={styles.formGroup}>
                <label>State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g., Andhra Pradesh"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="pending_moderator">Pending Moderator</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {modalMode === "create" ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministratorLocations;
