import { useState, useEffect } from 'react';
import axios from 'axios';
import './UserModal.css'; // Reusing established modal styles

export default function RoomModal({ isOpen, onClose, onSuccess, editRoom }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        capacity: '',
        active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (editRoom) {
            setFormData({
                name: editRoom.name || '',
                description: editRoom.description || '',
                capacity: editRoom.capacity || '',
                active: editRoom.active !== undefined ? editRoom.active : true
            });
        } else {
            setFormData({
                name: '',
                description: '',
                capacity: '',
                active: true
            });
        }
    }, [editRoom, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const dataToSend = {
                ...formData,
                capacity: parseInt(formData.capacity)
            };

            let response;
            if (editRoom) {
                response = await axios.put(`/api/v1/rooms/${editRoom.id}`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                response = await axios.post('/api/v1/rooms', dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // Spring might return 204 No Content for PUT
            const resultData = response.data || { ...dataToSend, id: editRoom?.id };

            onSuccess(resultData, !!editRoom);
            onClose();
        } catch (err) {
            console.error('Error saving room:', err);
            setError(err.response?.data?.message || 'Error al guardar el aula. Por favor, intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editRoom ? 'Editar Aula' : 'Agregar Nueva Aula'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-group">
                        <label>Nombre del Aula</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Aula 101, Laboratorio A"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descripción opcional del aula..."
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Capacidad</label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                placeholder="Ej: 30"
                                required
                                min="1"
                            />
                        </div>

                        <div className="form-group status-toggle-group">
                            <label>Estado</label>
                            <div className="status-toggle">
                                <span className={!formData.active ? 'active-label' : ''}>Inactivo</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                    />
                                    <span className="slider round"></span>
                                </label>
                                <span className={formData.active ? 'active-label' : ''}>Activo</span>
                            </div>
                        </div>
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : (editRoom ? 'Actualizar Aula' : 'Crear Aula')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
