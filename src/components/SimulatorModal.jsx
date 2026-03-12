import { useState, useEffect } from 'react';
import axios from 'axios';
import './UserModal.css'; // Reusing modal styles for consistency

export default function SimulatorModal({ isOpen, onClose, onSuccess, editSimulator }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (editSimulator) {
            setFormData({
                name: editSimulator.name || '',
                description: editSimulator.description || '',
                active: editSimulator.active !== undefined ? editSimulator.active : true
            });
        } else {
            setFormData({
                name: '',
                description: '',
                active: true
            });
        }
        setError(null);
    }, [editSimulator, isOpen]);

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
            if (editSimulator) {
                response = await axios.put(`/api/v1/simulators/${editSimulator.id}`, formData, config);
            } else {
                response = await axios.post('/api/v1/simulators', formData, config);
            }

            onSuccess(response.data, !!editSimulator);
            onClose();
        } catch (err) {
            console.error('Error saving simulator:', err);
            setError(err.response?.data?.message || 'Error al guardar el simulador.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{editSimulator ? 'Editar Simulador' : 'Nuevo Simulador'}</h3>
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
                            <label>Nombre del Simulador</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Boeing 737-800"
                            />
                        </div>
                        <div className="form-group">
                            <label>Estado</label>
                            <select
                                value={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                        <div className="form-group full-width">
                            <label>Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detalles técnicos o ubicación del simulador"
                                rows="3"
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : (editSimulator ? 'Actualizar Simulador' : 'Crear Simulador')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
