import React from 'react';
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  files, 
  totalFiles, 
  setCurrentPage 
}) => (
  <div className="pagination-container">
    <div className="pagination-info">
      Mostrando {files.length} de {totalFiles} archivos
    </div>
    <div className="pagination-controls">
      <button
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
        className="pagination-button"
        title="Primera página"
      >
        <ChevronsLeft size={18} />
      </button>
      <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="pagination-button"
        title="Página anterior"
      >
        <ChevronLeft size={18} />
      </button>
      <div className="pagination-pages">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="pagination-button"
        title="Página siguiente"
      >
        <ChevronRight size={18} />
      </button>
      <button
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
        className="pagination-button"
        title="Última página"
      >
        <ChevronsRight size={18} />
      </button>
    </div>
  </div>
);

export default Pagination;