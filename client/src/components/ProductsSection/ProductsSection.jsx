import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './ProductsSection.css';

const ProductsSection = () => {
  const products = [
    { name: 'Syltherine', desc: 'Stylish cafe chair', price: 2500, oldPrice: 3500, discount: '30%', img: 'https://via.placeholder.com/300/333/fff?text=Chair' },
    { name: 'Leviosa', desc: 'Stylish cafe chair', price: 2500, img: 'https://via.placeholder.com/300/333/fff?text=Chair' },
    { name: 'Lolito', desc: 'Luxury big sofa', price: 7000, oldPrice: 14000, discount: '50%', img: 'https://via.placeholder.com/300/333/fff?text=Sofa' },
    { name: 'Respira', desc: 'Outdoor bar table and stool', price: 50000, discount: 'New', img: 'https://via.placeholder.com/300/333/fff?text=Table' },
  ];

  return (
    <section className="products-section">
      <div className="container">
        <h2 className="section-title">Our Products</h2>
        <div className="products-grid">
          {products.map((product, i) => (
            <ProductCard key={i} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;