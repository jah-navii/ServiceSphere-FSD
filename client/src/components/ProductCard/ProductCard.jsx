import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-img">
        <img src={product.img} alt={product.name} />
        {product.discount && <span className="discount">-{product.discount}</span>}
      </div>
      <div className="product-info">
        <h4>{product.name}</h4>
        <p>{product.desc}</p>
        <div className="price">
          <span className="current">₹{product.price}</span>
          {product.oldPrice && <span className="old">₹{product.oldPrice}</span>}
        </div>
        <button className="add-to-cart">Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductCard;