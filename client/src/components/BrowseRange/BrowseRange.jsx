import React from 'react';
import './BrowseRange.css';

const BrowseRange = () => {
  const categories = [
    { name: 'Living', img: 'https://via.placeholder.com/300/333/fff?text=Living' },
    { name: 'Dining', img: 'https://via.placeholder.com/300/333/fff?text=Dining' },
    { name: 'Bedroom', img: 'https://via.placeholder.com/300/333/fff?text=Bedroom' },
  ];

  return (
    <section className="browse-range">
      <div className="container">
        <h2 className="section-title">Most Booked Services</h2>
        <p className="section-subtitle">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <div className="range-grid">
          {categories.map((cat) => (
            <div key={cat.name} className="range-item">
              <img src={cat.img} alt={cat.name} />
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrowseRange;