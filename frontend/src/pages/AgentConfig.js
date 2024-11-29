import React, { useState, useEffect, useCallback } from 'react';
import { Save, Edit2, Loader, FileText } from 'lucide-react';
import ToastAlert from '../components/ToastAlert';

const AgentConfig = () => {
  const [prompts, setPrompts] = useState([]);
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    variant: 'info'
  });

  const showToast = (message, variant = 'info') => {
    setToast({ show: true, message, variant });
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [promptsResponse, toolsResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/prompts`),
        fetch(`${process.env.REACT_APP_API_URL}/tools`)
      ]);

      const [promptsData, toolsData] = await Promise.all([
        promptsResponse.json(),
        toolsResponse.json()
      ]);

      setPrompts(promptsData.data || []);
      setTools(toolsData.data || []);
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cargar la configuración', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleItemSelect = (item, type) => {
    const itemData = type === 'prompt' ? { ...item, promptType: item.type } : item;
    setSelectedItem({ ...itemData, type });
    setEditingContent(
      type === 'prompt' ? item.content :
      type === 'tool' ? {
        description: item.description,
        supportDescription: item.supportDescription
      } : null
    );
  };

  const handleSave = async () => {
    try {
      const endpoint = selectedItem.type === 'prompt' 
        ? `/prompts/${selectedItem.promptType}`
        : `/tools/${selectedItem.toolName}`;

      const body = selectedItem.type === 'prompt'
        ? { content: editingContent }
        : {
            description: editingContent.description,
            supportDescription: editingContent.supportDescription
          };

      console.log('Endpoint:', endpoint);
      console.log('Body:', body);

      const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Error al actualizar');

      await fetchData();
      setSelectedItem(null);
      setEditingContent(null);
      showToast('Configuración actualizada correctamente', 'success');
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al actualizar la configuración', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader size={48} className="animate-spin" />
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Configuración del Agente</h1>
      
      <div className="agent-config-container">
        <div className="editor-column card">
          {selectedItem ? (
            <>
              <div className="editor-header">
                <h3 className="editor-title">
                  {selectedItem.type === 'prompt' 
                    ? `Editando ${selectedItem.promptType === 'regular_user' ? 'Usuario Regular' : 
                        selectedItem.promptType === 'support_user' ? 'Usuario de Soporte' : 
                        'Contenido Común'}`
                    : `Editando ${selectedItem.toolName}`}
                </h3>
                <button onClick={handleSave} className="action-btn">
                  <Save size={18} />
                  Guardar
                </button>
              </div>
              
              {selectedItem.type === 'prompt' ? (
                <textarea
                  className="config-editor"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label className="config-section-title">Descripción Regular</label>
                    <textarea
                      className="config-editor"
                      value={editingContent.description}
                      onChange={(e) => setEditingContent({
                        ...editingContent,
                        description: e.target.value
                      })}
                    />
                  </div>
                  {selectedItem.supportDescription !== null && (
                    <div>
                      <label className="config-section-title">Descripción para Soporte</label>
                      <textarea
                        className="config-editor"
                        value={editingContent.supportDescription}
                        onChange={(e) => setEditingContent({
                          ...editingContent,
                          supportDescription: e.target.value
                        })}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="no-selection-message">
              <FileText size={48} />
              <h3>Selecciona un elemento para editar</h3>
              <p>Elige un prompt o herramienta del menú de la derecha para comenzar a editar</p>
            </div>
          )}
        </div>

        <div className="settings-column">
          <div className="card config-section">
            <h2 className="config-section-title">Prompts del Agente</h2>
            <div className="config-list">
              {prompts.map((prompt) => (
                <div
                  key={prompt.type}
                  className={`config-item ${selectedItem?.type === 'prompt' && selectedItem?.promptType === prompt.type ? 'active' : ''}`}
                  onClick={() => handleItemSelect(prompt, 'prompt')}
                >
                  <div className="config-item-header">
                    <span className="config-item-title">
                      {prompt.type === 'regular_user' ? 'Usuario Regular' :
                       prompt.type === 'support_user' ? 'Usuario de Soporte' :
                       prompt.type === 'common' ? 'Contenido Común' : prompt.type}
                    </span>
                    <Edit2 size={16} />
                  </div>
                  <div className="config-preview">
                    {prompt.content.slice(0, 50)}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card config-section">
            <h2 className="config-section-title">Herramientas</h2>
            <div className="config-list">
              {tools.map((tool) => (
                <div
                  key={tool.toolName}
                  className={`config-item ${selectedItem?.type === 'tool' && selectedItem?.toolName === tool.toolName ? 'active' : ''}`}
                  onClick={() => handleItemSelect(tool, 'tool')}
                >
                  <div className="config-item-header">
                    <span className="config-item-title">
                      {tool.toolName === 'sql_toolkit' ? 'SQL Toolkit' :
                       tool.toolName === 'vectorstore_toolkit' ? 'Vectorstore Toolkit' :
                       tool.toolName}
                    </span>
                    <Edit2 size={16} />
                  </div>
                  <div className="config-preview">
                    {tool.description.slice(0, 50)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ToastAlert
        isVisible={toast.show}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
        duration={4000}
      />
    </div>
  );
};

export default AgentConfig;