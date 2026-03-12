import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from './DatePicker';
import './UserModal.css';

export default function CourseModal({ isOpen, onClose, onSuccess, editCourse }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        fecInicio: '',
        fecFin: '',
        horas: '',
        roomIds: [],
        simulatorId: ''
    });
    const [rooms, setRooms] = useState([]);
    const [simulators, setSimulators] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen) return;
            setFetchingData(true);
            try {
                const token = localStorage.getItem('token');
                const [roomsRes, simsRes] = await Promise.all([
                    axios.get('/api/v1/rooms', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('/api/v1/simulators', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setRooms(roomsRes.data);
                setSimulators(simsRes.data);
            } catch (err) {
                console.error('Error fetching course dependencies:', err);
                setError('Error al cargar aulas o simuladores.');
            } finally {
                setFetchingData(false);
            }
        };
        fetchData();
    }, [isOpen]);

    useEffect(() => {
        if (editCourse) {
            setFormData({
                name: editCourse.name || '',
                description: editCourse.description || '',
                fecInicio: editCourse.fecInicio || '',
                fecFin: editCourse.fecFin || '',
                horas: editCourse.horas || '',
                roomIds: editCourse.rooms ? editCourse.rooms.map(r => r.id) : [],
                simulatorId: editCourse.simulator ? editCourse.simulator.id : ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                fecInicio: '',
                fecFin: '',
                horas: '',
                roomIds: [],
                simulatorId: ''
            });
        }
        setError(null);
    }, [editCourse, isOpen]);

    const handleRoomToggle = (roomId) => {
        setFormData(prev => {
            const isSelected = prev.roomIds.includes(roomId);
            if (isSelected) {
                return { ...prev, roomIds: prev.roomIds.filter(id => id !== roomId) };
            } else {
                return { ...prev, roomIds: [...prev.roomIds, roomId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.simulatorId) {
            setError('Debe seleccionar un simulador.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let response;
            if (editCourse) {
                response = await axios.put(`/api/v1/courses/${editCourse.id}`, formData, config);
            } else {
                response = await axios.post('/api/v1/courses', formData, config);
            }

            onSuccess(response.data, !!editCourse);
            onClose();
        } catch (err) {
            console.error('Error saving course:', err);
            setError(err.response?.data?.message || 'Error al guardar el curso.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h3>{editCourse ? 'Editar Curso' : 'Nuevo Curso'}</h3>
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
                            <label>Nombre del Curso</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Curso de Vuelo Básico"
                            />
                        </div>

                        <div className="form-group">
                            <label>Fecha de Inicio</label>
                            <DatePicker
                                required
                                value={formData.fecInicio}
                                onChange={(e) => setFormData({ ...formData, fecInicio: e.target.value })}
                                placeholder="Seleccionar inicio"
                            />
                        </div>
                        <div className="form-group">
                            <label>Fecha de Fin</label>
                            <DatePicker
                                required
                                value={formData.fecFin}
                                onChange={(e) => setFormData({ ...formData, fecFin: e.target.value })}
                                placeholder="Seleccionar fin"
                            />
                        </div>

                        <div className="form-group">
                            <label>Horas Totales</label>
                            <input
                                type="number"
                                required
                                value={formData.horas}
                                onChange={(e) => setFormData({ ...formData, horas: e.target.value })}
                                placeholder="Ej: 40"
                            />
                        </div>

                        <div className="form-group">
                            <label>Simulador Requerido</label>
                            <select
                                required
                                value={formData.simulatorId}
                                onChange={(e) => setFormData({ ...formData, simulatorId: e.target.value })}
                            >
                                <option value="">Seleccione un simulador...</option>
                                {simulators.map(sim => (
                                    <option key={sim.id} value={sim.id}>{sim.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Objetivos y contenido del curso"
                                rows="2"
                            ></textarea>
                        </div>

                        <div className="form-group full-width">
                            <label>Asignar Aulas (Seleccione una o más)</label>
                            <div className="checkbox-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: '8px',
                                marginTop: '8px',
                                padding: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                maxHeight: '120px',
                                overflowY: 'auto'
                            }}>
                                {rooms.map(room => (
                                    <label key={room.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.roomIds.includes(room.id)}
                                            onChange={() => handleRoomToggle(room.id)}
                                        />
                                        {room.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading || fetchingData}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading || fetchingData}>
                            {loading ? 'Guardando...' : (editCourse ? 'Actualizar Curso' : 'Crear Curso')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
