import React, { useState, useEffect, useCallback } from 'react';
import { Loader, BarChart3, Filter, AlertCircle, Trash2 } from 'lucide-react';
import Pagination from '../components/Pagination';
import ToastAlert from '../components/ToastAlert';
import Modal from '../components/Modal';

const FeedbackStats = ({ feedback, selectedReason, setSelectedReason }) => {
  const stats = feedback.reduce((acc, item) => {
    acc[item.reason] = (acc[item.reason] || 0) + 1;
    return acc;
  }, {});

  const reasonLabels = {
    'irrelevant': 'No relacionado',
    'inappropriate': 'Inapropiado',
    'unhelpful': 'No útil'
  };

  return (
    <div className="stats-container">
      <div className="stats-header">
        <BarChart3 size={20} />
        <h3>Estadísticas de Feedback</h3>
      </div>
      {Object.entries(reasonLabels).map(([reason, label]) => (
        <div 
          key={reason}
          className={`stat-item ${selectedReason === reason ? 'selected' : ''}`}
          onClick={() => setSelectedReason(selectedReason === reason ? null : reason)}
        >
          <div className="stat-info">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{stats[reason] || 0}</span>
          </div>
          <div className="stat-bar">
            <div 
              className="stat-bar-fill"
              style={{ 
                width: `${(stats[reason] || 0) / feedback.length * 100}%`,
                backgroundColor: reason === 'irrelevant' ? '#ffd700' :
                               reason === 'inappropriate' ? '#ff4d4f' :
                               '#1890ff'
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [selectedReason, setSelectedReason] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    variant: 'info'
  });

  const showToast = (message, variant = 'info') => {
    setToast({
      show: true,
      message,
      variant
    });
  };

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/feedback?page=${currentPage}&limit=10`
      );

      if (!response.ok) {
        throw new Error('Error al obtener el feedback');
      }

      const data = await response.json();
      setFeedback(data.feedback);
      setTotalPages(data.total_pages);
      setTotalFeedback(data.total);
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cargar el feedback', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  useEffect(() => {
    if (selectedReason) {
      setFilteredFeedback(feedback.filter(item => item.reason === selectedReason));
    } else {
      setFilteredFeedback(feedback);
    }
  }, [selectedReason, feedback]);

  const handleDeleteClick = (feedback) => {
    setFeedbackToDelete(feedback);
    setIsDeleteModalOpen(true);
  };

  const optimisticDelete = (feedbackId) => {
    // Primero agregamos la clase de animación
    const feedbackElement = document.querySelector(`[data-feedback-id="${feedbackId}"]`);
    if (feedbackElement) {
      feedbackElement.classList.add('deleting');
      
      // Esperamos a que termine la animación antes de actualizar el estado
      setTimeout(() => {
        const updatedFeedback = feedback.filter(item => item.id !== feedbackId);
        setFeedback(updatedFeedback);
        setFilteredFeedback(prev => prev.filter(item => item.id !== feedbackId));
        setTotalFeedback(prev => prev - 1);
      }, 300); // Este tiempo debe coincidir con la duración de la animación
    }
  };

  const handleDelete = async () => {
    const feedbackId = feedbackToDelete.id;
    
    // Cerrar el modal inmediatamente
    setIsDeleteModalOpen(false);
    setFeedbackToDelete(null);
    
    // Aplicar eliminación optimista
    optimisticDelete(feedbackId);
    showToast('Feedback eliminado correctamente', 'success');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/feedback/${feedbackId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar el feedback');
      }
    } catch (error) {
      console.error('Error:', error);
      // Revertir la eliminación optimista
      showToast('Error al eliminar el feedback. Los cambios han sido revertidos.', 'error');
      fetchFeedback(); // Recargar los datos
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="feedback-dashboard">
      <h1 className="page-title">Feedback de Usuarios</h1>

      <div className="feedback-layout">
        <div className="feedback-sidebar">
          <div className="card">
            <FeedbackStats 
              feedback={feedback} 
              selectedReason={selectedReason}
              setSelectedReason={setSelectedReason}
            />
          </div>

          <div className="card filter-card">
            <div className="filter-header">
              <Filter size={20} />
              <h3>Filtros Activos</h3>
            </div>
            {selectedReason ? (
              <div className="active-filter">
                <span className="filter-tag">
                  {selectedReason === 'irrelevant' && 'No relacionado'}
                  {selectedReason === 'inappropriate' && 'Inapropiado'}
                  {selectedReason === 'unhelpful' && 'No útil'}
                  <button 
                    onClick={() => setSelectedReason(null)}
                    className="clear-filter"
                  >
                    ×
                  </button>
                </span>
              </div>
            ) : (
              <p className="no-filters">No hay filtros activos</p>
            )}
          </div>
        </div>

        <div className="feedback-content">
          <div className="card">
            {isLoading ? (
              <div className="loading-container">
                <Loader size={48} className="animate-spin" />
                <p>Cargando feedback...</p>
              </div>
            ) : filteredFeedback.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={48} />
                <h3>No se encontró feedback</h3>
                <p>No hay registros que coincidan con los filtros seleccionados</p>
              </div>
            ) : (
              <div className="feedback-list">
                {filteredFeedback.map((item) => (
                  <div key={item.id} className="feedback-card" data-feedback-id={item.id}>
                    <div className="feedback-card-header">
                      <span className="feedback-date">
                        {formatDate(item.createdAt)}
                      </span>
                      <div className="feedback-actions">
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteClick(item)}
                          title="Eliminar feedback"
                        >
                          <Trash2 size={18} />
                        </button>
                        <span className={`feedback-tag ${item.reason}`}>
                          {item.reason === 'irrelevant' && 'No relacionado'}
                          {item.reason === 'inappropriate' && 'Inapropiado'}
                          {item.reason === 'unhelpful' && 'No útil'}
                        </span>
                      </div>
                    </div>
                    <div className="feedback-content">
                      <div className="feedback-query">
                        <label>Pregunta del Usuario:</label>
                        <p>{item.userQuery}</p>
                      </div>
                      <div className="feedback-response">
                        <label>Respuesta del Bot:</label>
                        <p>{item.botResponse}</p>
                      </div>
                      {item.comment && (
                        <div className="feedback-comment">
                          <label>Comentario:</label>
                          <p>{item.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  items={filteredFeedback}
                  totalItems={totalFeedback}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setFeedbackToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Feedback"
        description="¿Estás seguro que deseas eliminar este feedback? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      <ToastAlert
        isVisible={toast.show}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
        duration={4000}
      />

      <style>{`
        .feedback-dashboard {
          padding: 20px;
        }

        .feedback-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
          margin-top: 20px;
        }

        .feedback-sidebar {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .stats-container {
          padding: 10px;
        }

        .stats-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e8e8e8;
        }

        .stats-header h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }

        .stat-item {
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 10px;
        }

        .stat-item:hover {
          background-color: #f5f5f5;
        }

        .stat-item.selected {
          background-color: #e6f7ff;
          border: 1px solid #91d5ff;
        }

        .stat-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .stat-value {
          font-weight: 600;
        }

        .stat-bar {
          height: 4px;
          background-color: #f0f0f0;
          border-radius: 2px;
          overflow: hidden;
        }

        .stat-bar-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .filter-card {
          padding: 15px;
        }

        .filter-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .filter-header h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }

        .active-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background-color: #e6f7ff;
          border: 1px solid #91d5ff;
          border-radius: 4px;
          font-size: 14px;
        }

        .clear-filter {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0 4px;
        }

        .clear-filter:hover {
          color: #ff4d4f;
        }

        .no-filters {
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        .feedback-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .feedback-card {
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s ease;
          transform-origin: left center;
          opacity: 1;
          transform: scale(1);
        }

        .feedback-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .feedback-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .feedback-date {
          color: #666;
          font-size: 14px;
        }

        .feedback-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .feedback-tag {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .feedback-tag.irrelevant {
          background-color: #fff7e6;
          color: #d46b08;
        }

        .feedback-tag.inappropriate {
          background-color: #fff1f0;
          color: #cf1322;
        }

        .feedback-tag.unhelpful {
          background-color: #e6f7ff;
          color: #0958d9;
        }

        .delete-button {
          background: none;
          border: none;
          padding: 6px;
          cursor: pointer;
          color: #666;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .delete-button:hover {
          color: #ff4d4f;
          background-color: #fff1f0;
        }

        .feedback-content {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .feedback-query,
        .feedback-response,
        .feedback-comment {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .feedback-content label {
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .feedback-content p {
          margin: 0;
          color: #666;
          line-height: 1.5;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          text-align: center;
          color: #666;
        }

        .empty-state h3 {
          margin: 20px 0 10px;
        }

        .empty-state p {
          margin: 0;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }

        .loading-container p {
          margin-top: 16px;
          color: #666;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(10px);
          }
        }

        .feedback-card.deleting {
          animation: deleteAnimation 0.3s ease-out forwards;
          pointer-events: none;
        }

        @keyframes deleteAnimation {
        0% {
          opacity: 1;
          transform: scale(1) translateX(0);
        }
        100% {
          opacity: 0;
          transform: scale(0.8) translateX(-100%);
          margin-top: -20px;
          margin-bottom: -20px;
          padding-top: 0;
          padding-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default Feedback;