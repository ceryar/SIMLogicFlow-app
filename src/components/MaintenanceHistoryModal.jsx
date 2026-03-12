import { useState, useEffect } from 'react';
import axios from 'axios';
import './UserModal.css';

export default function MaintenanceHistoryModal({ isOpen, onClose, onSuccess, editHistory }) {
    const [formData, setFormData] = useState({
        observation: '',
        changeDate: '',
        maintenanceId: ''
    });
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingMaintenances, setFetchingMaintenances] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMaintenances = async () => {
            if (!isOpen) return;
            setFetchingMaintenances(true);
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('/api/v1/maintenances', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMaintenances(response.data);
            } catch (err) {
                console.error('Error fetching maintenances for history:', err);
                setError('No se pudieron cargar los mantenimientos.');
            } finally {
                setFetchingMaintenances(false);
            }
        };
        fetchMaintenances();
    }, [isOpen]);

    useEffect(() => {
        if (editHistory) {
            setFormData({
                observation: editHistory.observation || '',
                changeDate: editHistory.changeDate ? editHistory.changeDate.split('.')[0] : '', // LocalDateTime format fix
                maintenanceId: editHistory.maintenance ? editHistory.maintenance.id : ''
            });
        } else {
            setFormData({
                observation: '',
                changeDate: new Date().toISOString().split('.')[0].slice(0, 16), // Default to now
                maintenanceId: ''
            });
        }
        setError(null);
    }, [editHistory, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let response;
            if (editHistory) {
                response = await axios.put(`/api/v1/maintenance-history/${editHistory.id}`, formData, config);
            } else {
                response = await axios.post('/api/v1/maintenance-history', formData, config);
            }

            onSuccess(response.data, !!editHistory);
            onClose();
        } catch (err) {
            console.error('Error saving maintenance history:', err);
            setError(err.response?.data?.message || 'Error al guardar el registro histórico.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{editHistory ? 'Editar Registro Técnico' : 'Nuevo Registro Técnico'}</h3>
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
                            <label>Seleccionar Mantenimiento</label>
                            <select
                                required
                                value={formData.maintenanceId}
                                onChange={(e) => setFormData({ ...formData, maintenanceId: e.target.value })}
                            >
                                <option value="">Seleccione un evento de mantenimiento...</option>
                                {maintenances.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {`S${m.simulator?.name} - ${m.maintenanceType?.name} (${m.fecIni})`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Fecha y Hora del Cambio</label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.changeDate}
                                onChange={(e) => setFormData({ ...formData, changeDate: e.target.value })}
                                max={new Date().toISOString().split('.')[0].slice(0, 16)}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Observación Técnica</label>
                            <textarea
                                required
                                value={formData.observation}
                                onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                                placeholder="Describa el cambio o hallazgo técnico..."
                                rows="4"
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading || fetchingMaintenances}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading || fetchingMaintenances}>
                            {loading ? 'Guardando...' : (editHistory ? 'Actualizar Registro' : 'Crear Registro')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
