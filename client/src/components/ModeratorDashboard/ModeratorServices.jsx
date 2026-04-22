import React, { useState, useEffect } from 'react';
import { moderatorApi } from '../../utils/moderatorApi';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';
import styles from './ModeratorServices.module.css';

const ModeratorServices = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await moderatorApi.services();
      setCategories(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTotalServices = () => {
    return categories.reduce((total, category) => {
      return total + (category.services?.length || 0);
    }, 0);
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const hasMatchingService = category.services?.some(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesSearch || hasMatchingService;
  });

  if (loading) return <LoadingSpinner message="Loading services..." />;
  if (error)   return <ErrorState message={error} onRetry={fetchServices} />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Platform Services</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Categories</span>
            <span className={styles.statValue}>{categories.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Services</span>
            <span className={styles.statValue}>{getTotalServices()}</span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search categories or services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <p className={styles.emptyMessage}>
          {searchTerm ? 'No categories or services match your search' : 'No services available'}
        </p>
      ) : (
        <div className={styles.categoriesContainer}>
          {filteredCategories.map((category) => (
            <div key={category._id} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryInfo}>
                  <h2 className={styles.categoryName}>{category.name}</h2>
                  {category.description && (
                    <p className={styles.categoryDescription}>{category.description}</p>
                  )}
                </div>
                <div className={styles.categoryBadge}>
                  {category.services?.length || 0} {category.services?.length === 1 ? 'service' : 'services'}
                </div>
              </div>

              {category.services && category.services.length > 0 ? (
                <div className={styles.servicesGrid}>
                  {category.services
                    .filter(service => 
                      !searchTerm || service.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((service) => (
                      <div key={service._id} className={styles.serviceCard}>
                        <div className={styles.serviceName}>{service.name}</div>
                        <div className={styles.serviceStatus}>
                          <span className={`${styles.statusDot} ${service.isActive ? styles.active : styles.inactive}`}></span>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className={styles.noServices}>No services in this category yet</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModeratorServices;
