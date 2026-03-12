import { useState, useEffect } from 'react';
import axios from 'axios';
import './UserModal.css'; // Reusing modal styles for consistency

export default function RoleModal({ isOpen, onClose, onSuccess, editRole }) {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (editRole) {
            setFormData({
                name: editRole.name || '',
                description: editRole.description || ''
            });
        } else {
            setFormData({
                name: '',
                description: ''
            });
        }
        setError(null);
    }, [editRole, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            let response;
            if (editRole) {
                response = await axios.put(`/api/v1/roles/${editRole.id}`, formData, config);
            } else {
                response = await axios.post('/api/v1/roles', formData, config);
            }

            onSuccess(response.data, !!editRole);
            onClose();
        } catch (err) {
            console.error('Error saving role:', err);
            setError(err.response?.data?.message || 'Error al guardar el rol. Asegúrese de que el nombre sea único.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{editRole ? 'Editar Rol' : 'Nuevo Rol'}</h3>
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
                        <div className="form-group">
                            <label>Nombre del Rol</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                placeholder="Ej: AUDITOR"
                            />
                        </div>
                        <div className="form-group">
                            <label>Descripción</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descripción del rol"
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : (editRole ? 'Actualizar Rol' : 'Crear Rol')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
