import React, { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './ToastAlert.module.css';

const VARIANTS = {
  success: {
    icon: CheckCircle,
    className: styles.success
  },
  error: {
    icon: AlertCircle,  
    className: styles.error
  },
  info: {
    icon: Info,
    className: styles.info
  },
  warning: {
    icon: AlertTriangle,
    className: styles.warning
  }
};

const ToastAlert = ({
  message = '',
  variant = 'info',
  duration = 4000,
  onClose = () => {},
  isVisible = false
}) => {
  const { icon: Icon, className } = VARIANTS[variant] || VARIANTS.info;
  const [shouldRender, setShouldRender] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    if (!isExiting) {
      setIsExiting(true);
      setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
        onClose();
      }, 300);
    }
  }, [isExiting, onClose]);

  useEffect(() => {
    if (isVisible && !shouldRender) {
      setShouldRender(true);
    } else if (!isVisible && shouldRender && !isExiting) {
      handleClose();
    }
  }, [isVisible, shouldRender, isExiting, handleClose]);

  useEffect(() => {
    let timer;
    if (isVisible && duration && shouldRender) {
      timer = setTimeout(() => {
        handleClose();
      }, duration);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isVisible, duration, shouldRender, handleClose]);

  if (!shouldRender) return null;

  return (
    <div className={styles.toastContainer}>
      <div 
        className={`${styles.toastAlert} ${className} ${
          isExiting ? styles.exit : styles.enter
        }`}
        onAnimationEnd={() => {
          if (isExiting) {
            setShouldRender(false);
            setIsExiting(false);
            onClose();
          }
        }}
      >
        <Icon className={styles.icon} strokeWidth={2} />
        <p className={styles.message}>{message}</p>
        <button
          onClick={handleClose}
          className={styles.closeButton}
          aria-label="Cerrar notificación"
        >
          <X className={styles.closeIcon} />
        </button>
      </div>
    </div>
  );
};

export default ToastAlert;