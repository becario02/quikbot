import React, { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger"
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target.classList.contains(styles.modalBackdrop)) {
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add(styles.modalOpen);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove(styles.modalOpen);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`${styles.modalBackdrop} ${isClosing ? styles.modalFadeout : ''}`} 
      onClick={handleBackdropClick}
    >
      <div className={styles.modalWrapper}>
        <div className={`${styles.modalBox} ${isClosing ? styles.modalSlideout : ''}`}>
          <button className={styles.modalCloseBtn} onClick={handleClose}>
            <X size={20} />
          </button>

          <div className={styles.modalHeader}>
            <h3>{title}</h3>
          </div>

          <div className={styles.modalBody}>
            <p>{description}</p>
          </div>

          <div className={styles.modalFooter}>
            <button 
              className={styles.modalBtnSecondary}
              onClick={handleClose}
            >
              {cancelText}
            </button>
            <button 
              className={`${styles.modalBtnPrimary} ${styles[`modalBtn${variant}`]}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;