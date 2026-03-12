import { useState, useEffect } from 'react';
import axios from 'axios';
import './UserModal.css';

export default function MaintenanceTypeModal({ isOpen, onClose, onSuccess, editType }) {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (editType) {
            setFormData({ name: editType.name || '', description: editType.description || '' });
        } else {
            setFormData({ name: '', description: '' });
        }
        setError(null);
    }, [editType, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            let response;
            if (editType) {
                response = await axios.put(`/api/v1/maintenance-types/${editType.id}`, formData, config);
            } else {
                response = await axios.post('/api/v1/maintenance-types', formData, config);
            }
            onSuccess(response.data, !!editType);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar el tipo de mantenimiento.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{editType ? 'Editar Tipo de Mantenimiento' : 'Nuevo Tipo de Mantenimiento'}</h3>
                    <button className="btn-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Nombre del Tipo *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Preventivo, Correctivo, Predictivo..."
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descripción del tipo de mantenimiento..."
                                rows="3"
                            ></textarea>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : (editType ? 'Actualizar' : 'Crear Tipo')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
