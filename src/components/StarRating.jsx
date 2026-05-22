import React from 'react';

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= rating ? 'var(--orange)' : '#e2e8f0', fontSize: '1.1rem', marginRight: '2px' }}>
        ★
      </span>
    );
  }
  return <div style={{ marginBottom: '8px' }}>{stars}</div>;
};

export default StarRating;
