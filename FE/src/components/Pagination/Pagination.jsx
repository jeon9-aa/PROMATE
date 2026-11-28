import GuardedButton from '../GuardedButton/GuardedButton.jsx';
import React from 'react';
import './Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <GuardedButton
        className="pagination-btn"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        &lt;
      </GuardedButton>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <GuardedButton
          key={page}
          className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </GuardedButton>
      ))}
      <GuardedButton
        className="pagination-btn"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        &gt;
      </GuardedButton>
    </div>
  );
}

export default Pagination;