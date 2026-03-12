import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from './DatePicker';
import './UserModal.css';

export default function MaintenanceModal({ isOpen, onClose, onSuccess, editMaintenance }) {
    const [formData, setFormData] = useState({
        description: '',
        fecIni: '',
        fecFin: '',
        horaIni: '',
        horaFin: '',
        simulatorId: '',
        maintenanceTypeId: ''
    });
    const [simulators, setSimulators] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen) return;
            setFetchingData(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [simsRes, typesRes] = await Promise.all([
                    axios.get('/api/v1/simulators', config),
                    axios.get('/api/v1/maintenance-types', config)
                ]);
                setSimulators(simsRes.data);
                setTypes(typesRes.data);
            } catch (err) {
                console.error('Error fetching maintenance dependencies:', err);
                setError('Error al cargar simuladores o tipos de mantenimiento.');
            } finally {
                setFetchingData(false);
            }
        };
        fetchData();
    }, [isOpen]);

    useEffect(() => {
        if (editMaintenance) {
            setFormData({
                description: editMaintenance.description || '',
                fecIni: editMaintenance.fecIni || '',
                fecFin: editMaintenance.fecFin || '',
                horaIni: editMaintenance.horaIni || '',
                horaFin: editMaintenance.horaFin || '',
                simulatorId: editMaintenance.simulator ? editMaintenance.simulator.id : '',
                maintenanceTypeId: editMaintenance.maintenanceType ? editMaintenance.maintenanceType.id : ''
            });
        } else {
            setFormData({
                description: '',
                fecIni: '',
                fecFin: '',
                horaIni: '',
                horaFin: '',
                simulatorId: '',
                maintenanceTypeId: ''
            });
        }
        setError(null);
    }, [editMaintenance, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.fecFin && formData.fecIni && formData.fecFin < formData.fecIni) {
            setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let response;
            if (editMaintenance) {
                response = await axios.put(`/api/v1/maintenances/${editMaintenance.id}`, formData, config);
            } else {
                response = await axios.post('/api/v1/maintenances', formData, config);
            }

            onSuccess(response.data, !!editMaintenance);
            onClose();
        } catch (err) {
            console.error('Error saving maintenance:', err);
            setError(err.response?.data?.message || 'Error al guardar el mantenimiento.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{editMaintenance ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}</h3>
                    <button className="btn-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}
                {fetchingData && <div style={{ padding: '8px 0', color: '#94a3b8', fontSize: '0.85rem' }}>Cargando datos del formulario...</div>}

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        {/* Simulador */}
                        <div className="form-group">
                            <label>Simulador *</label>
                            <select
                                required
                                value={formData.simulatorId}
                                onChange={(e) => setFormData({ ...formData, simulatorId: e.target.value })}
                                disabled={fetchingData}
                            >
                                <option value="">Seleccione un simulador...</option>
                                {simulators.map(sim => (
                                    <option key={sim.id} value={sim.id}>{sim.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo de Mantenimiento */}
                        <div className="form-group">
                            <label>Tipo de Mantenimiento *</label>
                            <select
                                required
                                value={formData.maintenanceTypeId}
                                onChange={(e) => setFormData({ ...formData, maintenanceTypeId: e.target.value })}
                                disabled={fetchingData}
                            >
                                <option value="">Seleccione un tipo...</option>
                                {types.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Fecha Inicio */}
                        <div className="form-group">
                            <label>Fecha Inicio *</label>
                            <DatePicker
                                required
                                value={formData.fecIni}
                                onChange={(e) => setFormData({ ...formData, fecIni: e.target.value })}
                                placeholder="Seleccionar fecha inicio"
                            />
                        </div>

                        {/* Fecha Fin */}
                        <div className="form-group">
                            <label>Fecha Fin *</label>
                            <DatePicker
                                required
                                value={formData.fecFin}
                                onChange={(e) => setFormData({ ...formData, fecFin: e.target.value })}
                                placeholder="Seleccionar fecha fin"
                            />
                        </div>

                        {/* Hora Inicio */}
                        <div className="form-group">
                            <label>Hora Inicio *</label>
                            <input
                                type="time"
                                required
                                value={formData.horaIni}
                                onChange={(e) => setFormData({ ...formData, horaIni: e.target.value })}
                            />
                        </div>

                        {/* Hora Fin */}
                        <div className="form-group">
                            <label>Hora Fin *</label>
                            <input
                                type="time"
                                required
                                value={formData.horaFin}
                                onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                            />
                        </div>

                        {/* Descripción */}
                        <div className="form-group full-width">
                            <label>Descripción / Observaciones</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detalles del mantenimiento programado..."
                                rows="3"
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading || fetchingData}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading || fetchingData}>
                            {loading ? 'Guardando...' : (editMaintenance ? 'Actualizar' : 'Crear Mantenimiento')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
