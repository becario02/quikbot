import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Search, FileText, ExternalLink, Download, Upload, Loader } from 'lucide-react';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ToastAlert from '../components/ToastAlert';

const Files = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeletingFile, setIsDeletingFile] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    variant: 'info'
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [limit] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const showToast = (message, variant = 'info') => {
    setToast({
      show: true,
      message,
      variant
    });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/files?page=${currentPage}&limit=${limit}${searchParam}`
      );

      if (!response.ok) {
        throw new Error('Error al obtener los archivos');
      }

      const data = await response.json();
      setFiles(data.files);
      setTotalPages(data.total_pages);
      setTotalFiles(data.total);
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudieron cargar los archivos. Por favor, intenta de nuevo más tarde.');
      showToast('Error al cargar los archivos', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir los archivos');
      }

      await fetchFiles();
      showToast(
        `${selectedFiles.length > 1 ? 'Archivos subidos' : 'Archivo subido'} correctamente`, 
        'success'
      );
    } catch (error) {
      console.error('Error al subir los archivos:', error);
      showToast('No se pudieron subir los archivos. Por favor, intenta de nuevo.', 'error');
      setError('No se pudieron subir los archivos. Por favor, intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const handleFileDelete = async () => {
    if (!fileToDelete) return;
    
    setIsDeletingFile(fileToDelete.url);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/files/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blob_url: fileToDelete.url
        })
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el archivo');
      }

      await fetchFiles();
      showToast('Archivo eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
      showToast('No se pudo eliminar el archivo. Por favor, intenta de nuevo.', 'error');
      setError('No se pudo eliminar el archivo. Por favor, intenta de nuevo.');
    } finally {
      setIsDeletingFile(null);
      setIsDeleteModalOpen(false);
      setFileToDelete(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simplifyContentType = (contentType) => {
    const typeMap = {
      'application/pdf': 'PDF',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'application/vnd.ms-excel': 'Excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
      'application/vnd.ms-powerpoint': 'PowerPoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
      'image/jpeg': 'JPEG',
      'image/png': 'PNG',
      'text/plain': 'Texto',
      'application/zip': 'ZIP',
      'application/x-rar-compressed': 'RAR',
    };
    return typeMap[contentType] || 'Desconocido';
  };

  const truncateFileName = (fileName, maxLength = 30) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExtension.slice(0, maxLength - extension.length - 3);
    return `${truncatedName}...${extension}`;
  };

  const isPDF = (file) => {
    return file.contentType === 'application/pdf' || file.pathname.toLowerCase().endsWith('.pdf');
  };

  const openPDFInNewTab = async (event, url) => {
    event.preventDefault();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Error al abrir el PDF:', error);
      showToast('No se pudo abrir el PDF. Por favor, inténtalo de nuevo más tarde.', 'error');
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
    <div>
      <h1 className="page-title">Administración de Archivos</h1>
      <div className="card">
        <h2>Subir Nuevos Archivos</h2>
        <input
          type="file"
          onChange={handleFileUpload}
          multiple
          style={{ display: 'none' }}
          id="file-upload"
          disabled={isUploading}
        />
        <label htmlFor="file-upload" className={`upload-button ${isUploading ? 'uploading' : ''}`}>
          {isUploading ? (
            <>
              <Loader size={18} className="animate-spin" style={{ marginRight: '8px' }} />
              Subiendo...
            </>
          ) : (
            <>
              <Upload size={18} style={{ marginRight: '8px' }} />
              Seleccionar Archivos
            </>
          )}
        </label>
      </div>
      <div className="card">
        <h2>Archivos Existentes</h2>
        <div className="search-bar" style={{ marginBottom: '20px' }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar archivos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoading ? (
          <div className="loading-container">
            <Loader size={48} className="animate-spin" />
            <p>Cargando archivos...</p>
          </div>
        ) : files.length === 0 ? (
          <p>No se encontraron archivos.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tamaño</th>
                  <th>Tipo</th>
                  <th>Fecha de Subida</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.url}>
                    <td>
                      <FileText size={18} style={{ marginRight: '8px' }} />
                      {isPDF(file) ? (
                        <a
                          href={file.url}
                          onClick={(e) => openPDFInNewTab(e, file.url)}
                          className="file-link"
                          title={file.pathname.split('/').pop()}
                        >
                          {truncateFileName(file.pathname.split('/').pop())}
                          <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                        </a>
                      ) : (
                        <span title={file.pathname.split('/').pop()}>
                          {truncateFileName(file.pathname.split('/').pop())}
                        </span>
                      )}
                    </td>
                    <td>{formatFileSize(file.size)}</td>
                    <td>{simplifyContentType(file.contentType)}</td>
                    <td>{formatDate(file.uploadedAt)}</td>
                    <td>
                      {!isPDF(file) && (
                        <a href={file.url} download className="action-btn" title="Descargar">
                          <Download size={18} />
                        </a>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClick(file)}
                        title="Eliminar"
                        disabled={isDeletingFile === file.url}
                      >
                        {isDeletingFile === file.url ? (
                          <Loader size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              files={files}
              totalFiles={totalFiles}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}
      </div>
      
      {error && (
        <div className="error-message" style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '1rem',
          borderRadius: '0.375rem',
          marginTop: '1rem'
        }}>
          {error}
        </div>
      )}

      <ToastAlert
        isVisible={toast.show}
        message={toast.message}
        variant={toast.variant}
        onClose={closeToast}
        duration={4000}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleFileDelete}
        title="Eliminar Archivo"
        description={
          fileToDelete 
            ? `¿Estás seguro que deseas eliminar el archivo "${fileToDelete.pathname.split('/').pop()}"? Esta acción no se puede deshacer.`
            : "¿Estás seguro que deseas eliminar este archivo? Esta acción no se puede deshacer."
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default Files;