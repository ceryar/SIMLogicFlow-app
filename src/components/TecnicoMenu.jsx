import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MaintenanceModal from './MaintenanceModal';
import MaintenanceHistoryModal from './MaintenanceHistoryModal';
import MaintenanceTypeModal from './MaintenanceTypeModal';
import CalendarView from './CalendarView';
import './AdminMenu.css';

export default function TecnicoMenu() {
    const [activeTab, setActiveTab] = useState('maintenances');
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const [editingMaintenance, setEditingMaintenance] = useState(null);
    const [editingHistory, setEditingHistory] = useState(null);

    const [maintenances, setMaintenances] = useState([]);
    const [maintenanceHistory, setMaintenanceHistory] = useState([]);
    const [proCourses, setProCourses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMaintenances = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/maintenances', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaintenances(response.data);
        } catch (err) {
            console.error('Error fetching maintenances:', err);
            setError('Error al cargar mantenimientos.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMaintenanceHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/maintenance-history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaintenanceHistory(response.data);
        } catch (err) {
            console.error('Error fetching maintenance history:', err);
            setError('Error al cargar el historial.');
        } finally {
            setLoading(false);
        }
    }, []);



    const fetchProCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/pro-courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProCourses(response.data);
        } catch (err) {
            console.error('Error fetching course programming:', err);
            setError('Error al cargar programaciones académicas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchMap = {
            maintenances: fetchMaintenances,
            'calendar-maint': fetchMaintenances,
            'maintenance-history': fetchMaintenanceHistory,
            'calendar-courses': fetchProCourses
        };

        if (fetchMap[activeTab]) {
            fetchMap[activeTab]();
        } else {
            setLoading(false);
        }
    }, [activeTab, fetchMaintenances, fetchMaintenanceHistory, fetchProCourses]);

    const handleMaintenanceSaved = (maintenance, isEdit) => {
        if (isEdit) setMaintenances(prev => prev.map(m => m.id === maintenance.id ? maintenance : m));
        else setMaintenances(prev => [maintenance, ...prev]);
    };

    const handleHistorySaved = (history, isEdit) => {
        if (isEdit) setMaintenanceHistory(prev => prev.map(h => h.id === history.id ? history : h));
        else setMaintenanceHistory(prev => [history, ...prev]);
    };



    const handleDeleteMaintenance = async (id) => {
        if (!window.confirm('¿Desea eliminar este registro?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/v1/maintenances/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setMaintenances(prev => prev.filter(m => m.id !== id));
        } catch (err) { alert('Error al eliminar'); }
    };

    const handleDeleteHistory = async (id) => {
        if (!window.confirm('¿Desea eliminar este registro del historial?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/v1/maintenance-history/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setMaintenanceHistory(prev => prev.filter(h => h.id !== id));
        } catch (err) { alert('Error al eliminar'); }
    };



    const renderMaintenanceTable = () => (
        <div className="table-card">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Simulador</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Horario</th>
                        <th>Descripción</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {maintenances.map(m => (
                        <tr key={m.id}>
                            <td data-label="Simulador" className="font-medium">{m.simulator?.name || '-'}</td>
                            <td data-label="Tipo"><span className="status-badge status-active">{m.maintenanceType?.name || 'N/A'}</span></td>
                            <td data-label="Fecha">{m.fecIni}</td>
                            <td data-label="Horario">{m.horaIni} - {m.horaFin}</td>
                            <td data-label="Descripción">{m.description}</td>
                            <td data-label="Acciones" className="actions-cell">
                                <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingMaintenance(m); setIsMaintenanceModalOpen(true); }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                <button className="btn-icon btn-delete" title="Eliminar" onClick={() => handleDeleteMaintenance(m.id)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderHistoryTable = () => (
        <div className="table-card">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Fecha Cambio</th>
                        <th>Simulador</th>
                        <th>Observación</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {maintenanceHistory.map(h => (
                        <tr key={h.id}>
                            <td data-label="Fecha">{new Date(h.changeDate).toLocaleString()}</td>
                            <td data-label="Simulador">{h.maintenance?.simulator?.name || '-'}</td>
                            <td data-label="Observación">{h.observation}</td>
                            <td data-label="Acciones" className="actions-cell">
                                <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingHistory(h); setIsHistoryModalOpen(true); }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                <button className="btn-icon btn-delete" title="Eliminar" onClick={() => handleDeleteHistory(h.id)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );



    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <h2 className="admin-title">Panel Técnico</h2>
                <ul className="admin-nav">
                    <li className={`admin-nav-item ${activeTab === 'maintenances' ? 'active' : ''}`} onClick={() => setActiveTab('maintenances')}>Mantenimientos</li>
                    <li className={`admin-nav-item ${activeTab === 'maintenance-history' ? 'active' : ''}`} onClick={() => setActiveTab('maintenance-history')}>Historial</li>
                    <li className={`admin-nav-item ${activeTab === 'calendar-maint' ? 'active' : ''}`} onClick={() => setActiveTab('calendar-maint')}>Calendario Mantenimientos</li>
                    <li className={`admin-nav-item ${activeTab === 'calendar-courses' ? 'active' : ''}`} onClick={() => setActiveTab('calendar-courses')}>Calendario Cursos</li>
                </ul>
            </div>

            <div className="admin-content">
                <div className="admin-header">
                    <h2>
                        {activeTab === 'maintenances' ? 'Gestión de Mantenimientos' :
                            activeTab === 'maintenance-history' ? 'Historial Técnico' :
                                activeTab === 'calendar-maint' ? 'Calendario de Mantenimientos' : 'Calendario de Cursos'}
                    </h2>
                    <div className="admin-header-actions">
                        {activeTab !== 'calendar-maint' && activeTab !== 'calendar-courses' && (
                            <button className="btn-primary" onClick={() => {
                                if (activeTab === 'maintenances') { setEditingMaintenance(null); setIsMaintenanceModalOpen(true); }
                                else if (activeTab === 'maintenance-history') { setEditingHistory(null); setIsHistoryModalOpen(true); }
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                {activeTab === 'maintenances' ? 'Nuevo Mantenimiento' : 'Nuevo Registro'}
                            </button>
                        )}
                    </div>
                </div>

                {error && <div className="error-state" style={{ marginBottom: '20px' }}>{error}</div>}

                {activeTab === 'maintenances' ? (
                    <div className="table-card">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Simulador</th>
                                    <th>Tipo</th>
                                    <th>Fecha</th>
                                    <th>Horario</th>
                                    <th>Descripción</th>
                                    <th className="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && maintenances.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                            <div className="loading-spinner-small" style={{ marginBottom: '10px' }}></div>
                                            Cargando mantenimientos...
                                        </td>
                                    </tr>
                                ) : maintenances.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No hay mantenimientos programados.
                                        </td>
                                    </tr>
                                ) : (
                                    maintenances.map(m => (
                                        <tr key={m.id}>
                                            <td data-label="Simulador" className="font-medium">{m.simulator?.name || '-'}</td>
                                            <td data-label="Tipo"><span className="status-badge status-active">{m.maintenanceType?.name || 'N/A'}</span></td>
                                            <td data-label="Fecha">{m.fecIni}</td>
                                            <td data-label="Horario">{m.horaIni} - {m.horaFin}</td>
                                            <td data-label="Descripción">{m.description}</td>
                                            <td data-label="Acciones" className="actions-cell">
                                                <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingMaintenance(m); setIsMaintenanceModalOpen(true); }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                                <button className="btn-icon btn-delete" title="Eliminar" onClick={() => handleDeleteMaintenance(m.id)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'maintenance-history' ? (
                    <div className="table-card">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Fecha Cambio</th>
                                    <th>Simulador</th>
                                    <th>Observación</th>
                                    <th className="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && maintenanceHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                            <div className="loading-spinner-small" style={{ marginBottom: '10px' }}></div>
                                            Cargando historial...
                                        </td>
                                    </tr>
                                ) : maintenanceHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                            El historial está vacío.
                                        </td>
                                    </tr>
                                ) : (
                                    maintenanceHistory.map(h => (
                                        <tr key={h.id}>
                                            <td data-label="Fecha">{new Date(h.changeDate).toLocaleString()}</td>
                                            <td data-label="Simulador">{h.maintenance?.simulator?.name || '-'}</td>
                                            <td data-label="Observación">{h.observation}</td>
                                            <td data-label="Acciones" className="actions-cell">
                                                <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingHistory(h); setIsHistoryModalOpen(true); }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                                <button className="btn-icon btn-delete" title="Eliminar" onClick={() => handleDeleteHistory(h.id)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === 'calendar-maint' ? (
                    loading && maintenances.length === 0 ? <div className="loading-state">Cargando calendario...</div> : <CalendarView events={maintenances} type="maint" />
                ) : (
                    loading && proCourses.length === 0 ? <div className="loading-state">Cargando calendario...</div> : <CalendarView events={proCourses} type="course" />
                )}
            </div>

            <MaintenanceModal isOpen={isMaintenanceModalOpen} onClose={() => { setIsMaintenanceModalOpen(false); setEditingMaintenance(null); }} onSuccess={handleMaintenanceSaved} editMaintenance={editingMaintenance} />
            <MaintenanceHistoryModal isOpen={isHistoryModalOpen} onClose={() => { setIsHistoryModalOpen(false); setEditingHistory(null); }} onSuccess={handleHistorySaved} editHistory={editingHistory} />
        </div>
    );
}
