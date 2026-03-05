import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import styles from "./AdministratorServices.module.css";

const AdministratorServices = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    categoryId: "",
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/administrator/categories");
      setCategories(data.data);
    } catch (err) {
      setError(err.message);
      console.error("Categories Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAllServices = () => {
    const services = [];
    categories.forEach(category => {
      if (category.services && category.services.length > 0) {
        category.services.forEach(service => {
          services.push({
            ...service,
            categoryName: category.name,
            categoryId: category._id
          });
        });
      }
    });
    return services;
  };

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    if (mode === "editCategory" && item) {
      setSelectedCategory(item);
      setFormData({
        name: item.name,
        description: item.description || "",
        image: item.image || ""
      });
    } else if (mode === "editService" && item) {
      setFormData({
        name: item.name,
        categoryId: item.categoryId,
        isActive: item.isActive !== false
      });
    } else if (mode === "createService") {
      setFormData({
        name: "",
        categoryId: categories[0]?._id || "",
        isActive: true
      });
    } else {
      setFormData({
        name: "",
        description: "",
        image: "",
        categoryId: "",
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setFormData({
      name: "",
      description: "",
      image: "",
      categoryId: "",
      isActive: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === "createCategory") {
        await api.post("/api/administrator/categories", {
          name: formData.name,
          description: formData.description,
          image: formData.image
        });
        alert("Category created successfully");
      } else if (modalMode === "editCategory") {
        await api.patch(`/api/administrator/categories/${selectedCategory._id}`, {
          name: formData.name,
          description: formData.description,
          image: formData.image
        });
        alert("Category updated successfully");
      } else if (modalMode === "createService") {
        await api.post("/api/administrator/services", {
          name: formData.name,
          category: formData.categoryId,
          isActive: formData.isActive
        });
        alert("Service created successfully");
      } else if (modalMode === "editService") {
        await api.patch(`/api/administrator/services/${selectedCategory._id}`, {
          name: formData.name,
          isActive: formData.isActive
        });
        alert("Service updated successfully");
      }
      
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error("Submit Error:", err);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? This will fail if there are services in this category.")) {
      return;
    }

    try {
      await api.delete(`/api/administrator/categories/${categoryId}`);
      alert("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      alert(`Error deleting category: ${err.message}`);
      console.error("Delete Error:", err);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      await api.delete(`/api/administrator/services/${serviceId}`);
      alert("Service deleted successfully");
      fetchCategories();
    } catch (err) {
      alert(`Error deleting service: ${err.message}`);
      console.error("Delete Error:", err);
    }
  };

  const getFilteredCategories = () => {
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredServices = () => {
    const services = getAllServices();
    return services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  const totalServices = getAllServices().length;
  const activeServices = getAllServices().filter(s => s.isActive !== false).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Categories & Services Management</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{categories.length}</div>
            <div className={styles.statLabel}>Categories</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{totalServices}</div>
            <div className={styles.statLabel}>Total Services</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{activeServices}</div>
            <div className={styles.statLabel}>Active Services</div>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "categories" ? styles.active : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
        <button
          className={`${styles.tab} ${activeTab === "services" ? styles.active : ""}`}
          onClick={() => setActiveTab("services")}
        >
          Services
        </button>
      </div>

      <div className={styles.controls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className={styles.addButton}
          onClick={() => handleOpenModal(activeTab === "categories" ? "createCategory" : "createService")}
        >
          Add {activeTab === "categories" ? "Category" : "Service"}
        </button>
      </div>

      {activeTab === "categories" ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Services Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredCategories().map((category) => (
                <tr key={category._id}>
                  <td className={styles.categoryName}>{category.name}</td>
                  <td>{category.description || "—"}</td>
                  <td>
                    <span className={styles.badge}>
                      {category.servicesCount || 0}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleOpenModal("editCategory", category)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {getFilteredCategories().length === 0 && (
                <tr>
                  <td colSpan="4" className={styles.noData}>
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredServices().map((service) => (
                <tr key={service._id}>
                  <td className={styles.serviceName}>{service.name}</td>
                  <td>{service.categoryName}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${service.isActive !== false ? styles.active : styles.inactive}`}>
                      {service.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleOpenModal("editService", service)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteService(service._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {getFilteredServices().length === 0 && (
                <tr>
                  <td colSpan="4" className={styles.noData}>
                    No services found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === "createCategory" && "Create Category"}
                {modalMode === "editCategory" && "Edit Category"}
                {modalMode === "createService" && "Create Service"}
                {modalMode === "editService" && "Edit Service"}
              </h2>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {(modalMode === "createCategory" || modalMode === "editCategory") ? (
                <>
                  <div className={styles.formGroup}>
                    <label>Category Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., Plumbing"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the category"
                      rows="3"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Image URL</label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label>Service Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., Pipe Repair"
                    />
                  </div>
                  {modalMode === "createService" && (
                    <div className={styles.formGroup}>
                      <label>Category *</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                </>
              )}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {modalMode.startsWith("create") ? "Create" : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministratorServices;
