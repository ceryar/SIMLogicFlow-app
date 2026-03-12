import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UserModal from './UserModal';
import RoomModal from './RoomModal';
import RoleModal from './RoleModal';
import SimulatorModal from './SimulatorModal';
import CourseModal from './CourseModal';
import ProCourseModal from './ProCourseModal';
import MaintenanceModal from './MaintenanceModal';
import MaintenanceHistoryModal from './MaintenanceHistoryModal';
import MaintenanceTypeModal from './MaintenanceTypeModal';
import UserCoursesMenu from './UserCoursesMenu';
import CalendarView from './CalendarView';
import './AdminMenu.css';

export default function AdminMenu() {
    const [activeTab, setActiveTab] = useState('users');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isProCourseModalOpen, setIsProCourseModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isMaintenanceTypeModalOpen, setIsMaintenanceTypeModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    const [editingRole, setEditingRole] = useState(null);
    const [editingSimulator, setEditingSimulator] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingProCourse, setEditingProCourse] = useState(null);
    const [editingMaintenance, setEditingMaintenance] = useState(null);
    const [editingHistory, setEditingHistory] = useState(null);
    const [editingMaintenanceType, setEditingMaintenanceType] = useState(null);
    const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [roles, setRoles] = useState([]);
    const [simulators, setSimulators] = useState([]);
    const [courses, setCourses] = useState([]);
    const [proCourses, setProCourses] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [maintenanceHistory, setMaintenanceHistory] = useState([]);
    const [maintenanceTypes, setMaintenanceTypes] = useState([]);
    const [stats, setStats] = useState({ users: 0, roles: 0, simulators: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userSearchTerm, setUserSearchTerm] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('No se pudieron cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRooms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/rooms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(response.data);
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setError('No se pudieron cargar las aulas.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/roles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoles(response.data);
        } catch (err) {
            console.error('Error fetching roles:', err);
            setError('No se pudieron cargar los roles.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSimulators = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/simulators', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSimulators(response.data);
        } catch (err) {
            console.error('Error fetching simulators:', err);
            setError('No se pudieron cargar los simuladores.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(response.data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('No se pudieron cargar los cursos.');
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
            setError('No se pudieron cargar las programaciones.');
        } finally {
            setLoading(false);
        }
    }, []);

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
            setError('No se pudieron cargar los mantenimientos.');
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
            setError('No se pudieron cargar el historial de mantenimientos.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMaintenanceTypes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/maintenance-types', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaintenanceTypes(response.data);
        } catch (err) {
            console.error('Error fetching maintenance types:', err);
            setError('No se pudieron cargar los tipos de mantenimiento.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchMap = {
            users: fetchUsers,
            rooms: fetchRooms,
            courses: fetchCourses,
            'pro-courses': fetchProCourses,
            maintenances: fetchMaintenances,
            'calendar-maint': fetchMaintenances,
            'maintenance-history': fetchMaintenanceHistory,
            'maintenance-types': fetchMaintenanceTypes,
            roles: fetchRoles,
            simulators: fetchSimulators
        };

        if (fetchMap[activeTab]) {
            fetchMap[activeTab]();
        } else {
            setLoading(false);
        }
    }, [activeTab, fetchUsers, fetchRooms, fetchRoles, fetchSimulators, fetchCourses, fetchProCourses, fetchMaintenances, fetchMaintenanceHistory, fetchMaintenanceTypes]);

    const handleUserSaved = (userData, isEdit) => {
        if (isEdit) {
            setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
        } else {
            setUsers(prev => [userData, ...prev]);
        }
    };

    const handleRoomSaved = (roomData, isEdit) => {
        if (isEdit) {
            setRooms(prev => prev.map(r => r.id === roomData.id ? roomData : r));
        } else {
            setRooms(prev => [roomData, ...prev]);
        }
    };

    const handleRoleSaved = (roleData, isEdit) => {
        if (isEdit) {
            setRoles(prev => prev.map(r => r.id === roleData.id ? roleData : r));
        } else {
            setRoles(prev => [roleData, ...prev]);
        }
    };

    const handleSimulatorSaved = (simulatorData, isEdit) => {
        if (isEdit) {
            setSimulators(prev => prev.map(s => s.id === simulatorData.id ? simulatorData : s));
        } else {
            setSimulators(prev => [simulatorData, ...prev]);
        }
    };

    const handleCourseSaved = (courseData, isEdit) => {
        if (isEdit) setCourses(prev => prev.map(c => c.id === courseData.id ? courseData : c));
        else setCourses(prev => [courseData, ...prev]);
    };

    const handleProCourseSaved = (proData, isEdit) => {
        if (isEdit) setProCourses(prev => prev.map(p => p.id === proData.id ? proData : p));
        else setProCourses(prev => [proData, ...prev]);
    };

    const handleMaintenanceSaved = (maintenance, isEdit) => {
        if (isEdit) setMaintenances(prev => prev.map(m => m.id === maintenance.id ? maintenance : m));
        else setMaintenances(prev => [maintenance, ...prev]);
    };

    const handleHistorySaved = (history, isEdit) => {
        if (isEdit) setMaintenanceHistory(prev => prev.map(h => h.id === history.id ? history : h));
        else setMaintenanceHistory(prev => [history, ...prev]);
    };

    const handleMaintenanceTypeSaved = (typeData, isEdit) => {
        if (isEdit) setMaintenanceTypes(prev => prev.map(t => t.id === typeData.id ? typeData : t));
        else setMaintenanceTypes(prev => [typeData, ...prev]);
    };

    const handleDeleteMaintenanceType = async (e, id, name) => {
        e.stopPropagation();
        if (!window.confirm(`¿Está seguro de eliminar el tipo "${name}"?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/v1/maintenance-types/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaintenanceTypes(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteUser = async (e, id, email) => {
        e.stopPropagation();
        if (!window.confirm(`¿Está seguro de eliminar al usuario ${email}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/v1/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            alert('Error al eliminar usuario: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteRoom = async (e, id, name) => {
        e.stopPropagation();
        if (!window.confirm(`¿Está seguro de eliminar el aula ${name}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/v1/rooms/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert('Error al eliminar aula: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteRole = async (e, id, name) => {
        e.preventDefault();
        e.stopPropagation();

        console.log(`Intentando eliminar rol: ID=${id}, Nombre=${name}`);

        if (!window.confirm(`¿Está seguro de eliminar el rol ${name}?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/api/v1/roles/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Respuesta de eliminación:', response.status);
            setRoles(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('Error completo al eliminar rol:', err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            alert('Error al eliminar rol: ' + errorMsg);
        }
    };

    const handleDeleteSimulator = async (e, id, name) => {
        e.stopPropagation();
        if (!window.confirm(`¿Está seguro de eliminar el simulador ${name}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/v1/simulators/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSimulators(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert('Error al eliminar simulador: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteCourse = async (e, id, name) => {
        e.stopPropagation();
        if (!window.confirm(`¿Está seguro de eliminar el curso ${name}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/v1/courses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            alert('Error al eliminar curso: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteProCourse = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm(`¿Está seguro de eliminar esta programación?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/v1/pro-courses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProCourses(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert('Error al eliminar programación: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteMaintenance = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este mantenimiento?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/v1/maintenances/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaintenances(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            alert('Error al eliminar mantenimiento: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteHistory = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar este registro histórico?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/v1/maintenance-history/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaintenanceHistory(prev => prev.filter(h => h.id !== id));
        } catch (err) {
            alert('Error al eliminar registro histórico: ' + (err.response?.data?.message || err.message));
        }
    };

    const filteredUsers = users.filter(user => {
        const fullName = `${user.firstName} ${user.middleName || ''} ${user.lastname} ${user.secondlasname || ''}`.toLowerCase();
        const email = user.email.toLowerCase();
        const search = userSearchTerm.toLowerCase();
        return fullName.includes(search) || email.includes(search);
    });

    const renderUserTable = () => (
        <div className="table-card">
            <div className="search-container" style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    type="text"
                    placeholder="Buscar usuario por nombre o email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                        color: '#1e293b'
                    }}
                />
                {userSearchTerm && (
                    <button onClick={() => setUserSearchTerm('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre Completo</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td data-label="ID">#{user.id}</td>
                            <td data-label="Nombre Completo" className="font-medium">{`${user.firstName} ${user.lastname}`}</td>
                            <td data-label="Email">{user.email}</td>
                            <td data-label="Rol">
                                <span className={`role-badge role-${user.role?.name?.toLowerCase() || 'unknown'}`}>
                                    {user.role?.name || 'UNKNOWN'}
                                </span>
                            </td>
                            <td data-label="Estado">
                                <span className={`status-badge ${user.active ? 'status-active' : 'status-inactive'}`}>
                                    {user.active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td data-label="Acciones" className="actions-cell">
                                <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button className="btn-icon btn-delete" title="Eliminar" onClick={(e) => handleDeleteUser(e, user.id, user.email)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderRoomTable = () => (
        <div className="table-card">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Capacidad</th>
                        <th>Estado</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map(room => (
                        <tr key={room.id}>
                            <td data-label="ID">#{room.id}</td>
                            <td data-label="Nombre" className="font-medium">{room.name}</td>
                            <td data-label="Descripción">{room.description || '-'}</td>
                            <td data-label="Capacidad">{room.capacity} personas</td>
                            <td data-label="Estado">
                                <span className={`status-badge ${room.active ? 'status-active' : 'status-inactive'}`}>
                                    {room.active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td data-label="Acciones" className="actions-cell">
                                <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingRoom(room); setIsRoomModalOpen(true); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button className="btn-icon btn-delete" title="Eliminar" onClick={(e) => handleDeleteRoom(e, room.id, room.name)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderRoleTable = () => (
        <div className="table-card">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre del Rol</th>
                        <th>Descripción</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.map(role => (
                        <tr key={role.id}>
                            <td data-label="ID">#{role.id}</td>
                            <td data-label="Nombre del Rol" className="font-medium">{role.name}</td>
                            <td data-label="Descripción">{role.description || '-'}</td>
                            <td data-label="Acciones" className="actions-cell">
                                <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingRole(role); setIsRoleModalOpen(true); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button className="btn-icon btn-delete" title="Eliminar" onClick={(e) => handleDeleteRole(e, role.id, role.name)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderSimulatorTable = () => (
        <div className="table-card">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {simulators.map(sim => (
                        <tr key={sim.id}>
                            <td data-label="ID">#{sim.id}</td>
                            <td data-label="Nombre" className="font-medium">{sim.name}</td>
                            <td data-label="Descripción">{sim.description || '-'}</td>
                            <td data-label="Estado">
                                <span className={`status-badge ${sim.active ? 'status-active' : 'status-inactive'}`}>
                                    {sim.active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td data-label="Acciones" className="actions-cell">
                                <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingSimulator(sim); setIsSimulatorModalOpen(true); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button className="btn-icon btn-delete" title="Eliminar" onClick={(e) => handleDeleteSimulator(e, sim.id, sim.name)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderMaintenanceTable = () => (
        <div className="table-card">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Simulador</th>
                        <th>Tipo</th>
                        <th>Fecha Inicio</th>
                        <th>Fecha Fin</th>
                        <th>Horario</th>
                        <th>Descripción</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {maintenances.map(m => (
                        <tr key={m.id}>
                            <td data-label="Simulador" className="font-medium">{m.simulator?.name || '-'}</td>
                            <td data-label="Tipo">
                                <span className="status-badge status-active">
                                    {m.maintenanceType?.name || 'Sin tipo'}
                                </span>
                            </td>
                            <td data-label="Fecha Inicio">{m.fecIni || '-'}</td>
                            <td data-label="Fecha Fin">{m.fecFin || '-'}</td>
                            <td data-label="Horario">
                                {m.horaIni && m.horaFin ? `${m.horaIni} - ${m.horaFin}` : '-'}
                            </td>
                            <td data-label="Descripción">{m.description || '-'}</td>
                            <td data-label="Acciones" className="actions-cell">
                                <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingMaintenance(m); setIsMaintenanceModalOpen(true); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button className="btn-icon btn-delete" title="Eliminar" onClick={() => handleDeleteMaintenance(m.id)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderMaintenanceTypeTable = () => (
        <div className="table-card">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {maintenanceTypes.map(t => (
                        <tr key={t.id}>
                            <td data-label="ID">#{t.id}</td>
                            <td data-label="Nombre" className="font-medium">{t.name}</td>
                            <td data-label="Descripción">{t.description || '-'}</td>
                            <td data-label="Acciones" className="actions-cell">
                                <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingMaintenanceType(t); setIsMaintenanceTypeModalOpen(true); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button className="btn-icon btn-delete" title="Eliminar" onClick={(e) => handleDeleteMaintenanceType(e, t.id, t.name)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
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
                        <th>Fecha</th>
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
                                <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingHistory(h); setIsHistoryModalOpen(true); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button className="btn-icon btn-delete" title="Eliminar" onClick={() => handleDeleteHistory(h.id)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderCourseTable = () => (
        <div className="table-card">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Curso</th>
                        <th>Inicio / Fin</th>
                        <th>Horas</th>
                        <th>Recursos</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(course => (
                        <tr key={course.id}>
                            <td data-label="ID">#{course.id}</td>
                            <td data-label="Curso" className="font-medium">
                                <div>{course.name}</div>
                                <small style={{ color: '#64748b' }}>{course.description || '-'}</small>
                            </td>
                            <td data-label="Inicio / Fin">
                                {course.fecInicio} <br /> {course.fecFin}
                            </td>
                            <td data-label="Horas">{course.horas}h</td>
                            <td data-label="Recursos">
                                <span className="entity-indicator" title="Simulator">
                                    ✈️ {course.simulator?.name || 'N/A'}
                                </span> <br />
                                <span className="entity-indicator" title="Rooms">
                                    🏫 {course.rooms?.length || 0} aulas
                                </span>
                            </td>
                            <td data-label="Acciones" className="actions-cell">
                                <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingCourse(course); setIsCourseModalOpen(true); }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </button>
                                <button className="btn-icon btn-delete" title="Eliminar" onClick={(e) => handleDeleteCourse(e, course.id, course.name)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderProCourseTable = () => (
        <div className="table-card">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Curso Relacionado</th>
                        <th>Fecha</th>
                        <th>Horario</th>
                        <th>Total</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && proCourses.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                <div className="loading-spinner-small" style={{ marginBottom: '10px' }}></div>
                                Cargando programación académica...
                            </td>
                        </tr>
                    ) : proCourses.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                No hay cursos programados registrados.
                            </td>
                        </tr>
                    ) : (
                        proCourses.map(pro => (
                            <tr key={pro.id}>
                                <td data-label="ID">#{pro.id}</td>
                                <td data-label="Curso Relacionado" className="font-medium">{pro.course?.name || 'DESCONOCIDO'}</td>
                                <td data-label="Fecha">{pro.fecha}</td>
                                <td data-label="Horario">
                                    {pro.horaini} - {pro.horafin}
                                </td>
                                <td data-label="Total">{pro.horas}h</td>
                                <td data-label="Acciones" className="actions-cell">
                                    <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingProCourse(pro); setIsProCourseModalOpen(true); }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                    <button className="btn-icon btn-delete" title="Eliminar" onClick={(e) => handleDeleteProCourse(e, pro.id)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="admin-container">
            <div className="admin-sidebar">
                <h2 className="admin-title">Panel Admin</h2>
                <ul className="admin-nav">
                    <li className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Usuarios</li>
                    <li className={`admin-nav-item ${activeTab === 'user-courses' ? 'active' : ''}`} onClick={() => setActiveTab('user-courses')}>Usuarios Cursos</li>
                    <li className={`admin-nav-item ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>Aulas</li>
                    <li className={`admin-nav-item ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>Roles</li>
                    <li className={`admin-nav-item ${activeTab === 'simulators' ? 'active' : ''}`} onClick={() => setActiveTab('simulators')}>Simuladores</li>
                    <li className={`admin-nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>Cursos</li>
                    <li className={`admin-nav-item ${activeTab === 'pro-courses' ? 'active' : ''}`} onClick={() => setActiveTab('pro-courses')}>Programación</li>
                    <li className={`admin-nav-item ${activeTab === 'maintenances' ? 'active' : ''}`} onClick={() => setActiveTab('maintenances')}>Mantenimiento</li>
                    <li className={`admin-nav-item ${activeTab === 'maintenance-types' ? 'active' : ''}`} onClick={() => setActiveTab('maintenance-types')}>Tipos de Mantenimiento</li>
                    <li className={`admin-nav-item ${activeTab === 'maintenance-history' ? 'active' : ''}`} onClick={() => setActiveTab('maintenance-history')}>Historial Técnico</li>

                    <li className="admin-nav-group">
                        <div className="admin-nav-group-header" onClick={() => setIsCalendarMenuOpen(!isCalendarMenuOpen)}>
                            <span>Calendarios</span>
                            <svg className={`chevron-icon ${isCalendarMenuOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        {isCalendarMenuOpen && (
                            <div className="admin-nav-group-content">
                                <li className={`admin-nav-item ${activeTab === 'calendar-courses' ? 'active' : ''}`} onClick={() => setActiveTab('calendar-courses')}>Calendario Cursos</li>
                                <li className={`admin-nav-item ${activeTab === 'calendar-maint' ? 'active' : ''}`} onClick={() => setActiveTab('calendar-maint')}>Calendario Mantenimientos</li>
                            </div>
                        )}
                    </li>

                    <li className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                        Configuración
                    </li>
                </ul>
            </div>

            <div className="admin-content">
                <div className="admin-header">
                    <h2>
                        {activeTab === 'users' ? 'Gestionar Usuarios' :
                            activeTab === 'user-courses' ? 'Usuarios — Asignación de Cursos' :
                                activeTab === 'rooms' ? 'Gestionar Aulas' :
                                    activeTab === 'roles' ? 'Gestionar Roles' :
                                        activeTab === 'simulators' ? 'Gestionar Simuladores' :
                                            activeTab === 'courses' ? 'Gestionar Cursos' :
                                                activeTab === 'pro-courses' ? 'Programación de Cursos' :
                                                    activeTab === 'maintenances' ? 'Gestionar Mantenimientos' :
                                                        activeTab === 'maintenance-types' ? 'Tipos de Mantenimiento' :
                                                            activeTab === 'maintenance-history' ? 'Historial Técnico' :
                                                                activeTab === 'calendar-courses' ? 'Calendario de Cursos' :
                                                                    activeTab === 'calendar-maint' ? 'Calendario de Mantenimientos' : 'Configuración'}
                    </h2>
                    <div className="admin-header-actions">
                        {activeTab !== 'dashboard' && activeTab !== 'calendar-courses' && activeTab !== 'calendar-maint' && activeTab !== 'user-courses' && (
                            <button className="btn-primary" onClick={() => {
                                if (activeTab === 'users') { setEditingUser(null); setIsUserModalOpen(true); }
                                else if (activeTab === 'rooms') { setEditingRoom(null); setIsRoomModalOpen(true); }
                                else if (activeTab === 'roles') { setEditingRole(null); setIsRoleModalOpen(true); }
                                else if (activeTab === 'simulators') { setEditingSimulator(null); setIsSimulatorModalOpen(true); }
                                else if (activeTab === 'courses') { setEditingCourse(null); setIsCourseModalOpen(true); }
                                else if (activeTab === 'pro-courses') { setEditingProCourse(null); setIsProCourseModalOpen(true); }
                                else if (activeTab === 'maintenances') { setEditingMaintenance(null); setIsMaintenanceModalOpen(true); }
                                else if (activeTab === 'maintenance-types') { setEditingMaintenanceType(null); setIsMaintenanceTypeModalOpen(true); }
                                else if (activeTab === 'maintenance-history') { setEditingHistory(null); setIsHistoryModalOpen(true); }
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                {activeTab === 'users' ? 'Nuevo Usuario' :
                                    activeTab === 'rooms' ? 'Nueva Aula' :
                                        activeTab === 'simulators' ? 'Nuevo Simulador' :
                                            activeTab === 'courses' ? 'Nuevo Curso' :
                                                activeTab === 'pro-courses' ? 'Programar Curso' :
                                                    activeTab === 'maintenances' ? 'Nuevo Mantenimiento' :
                                                        activeTab === 'maintenance-types' ? 'Nuevo Tipo' :
                                                            activeTab === 'maintenance-history' ? 'Nuevo Registro' : 'Nuevo Rol'}
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Cargando...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : (
                    activeTab === 'users' ? renderUserTable() :
                        activeTab === 'user-courses' ? <UserCoursesMenu /> :
                            activeTab === 'rooms' ? renderRoomTable() :
                                activeTab === 'roles' ? renderRoleTable() :
                                    activeTab === 'simulators' ? renderSimulatorTable() :
                                        activeTab === 'courses' ? renderCourseTable() :
                                            activeTab === 'pro-courses' ? renderProCourseTable() :
                                                activeTab === 'maintenances' ? renderMaintenanceTable() :
                                                    activeTab === 'maintenance-types' ? renderMaintenanceTypeTable() :
                                                        activeTab === 'maintenance-history' ? renderHistoryTable() :
                                                            activeTab === 'calendar-courses' ? <CalendarView events={proCourses} type="course" /> :
                                                                activeTab === 'calendar-maint' ? <CalendarView events={maintenances} type="maint" /> :
                                                                    <div className="settings-placeholder">Próximamente...</div>
                )}
            </div>

            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => { setIsUserModalOpen(false); setEditingUser(null); }}
                onSuccess={handleUserSaved}
                editUser={editingUser}
                currentUserRole="ADMINISTRADOR"
            />

            <RoomModal
                isOpen={isRoomModalOpen}
                onClose={() => { setIsRoomModalOpen(false); setEditingRoom(null); }}
                onSuccess={handleRoomSaved}
                editRoom={editingRoom}
            />

            <RoleModal
                isOpen={isRoleModalOpen}
                onClose={() => { setIsRoleModalOpen(false); setEditingRole(null); }}
                onSuccess={handleRoleSaved}
                editRole={editingRole}
            />

            <SimulatorModal
                isOpen={isSimulatorModalOpen}
                onClose={() => { setIsSimulatorModalOpen(false); setEditingSimulator(null); }}
                onSuccess={handleSimulatorSaved}
                editSimulator={editingSimulator}
            />
            <CourseModal isOpen={isCourseModalOpen} onClose={() => { setIsCourseModalOpen(false); setEditingCourse(null); }} onSuccess={handleCourseSaved} editCourse={editingCourse} />
            <ProCourseModal isOpen={isProCourseModalOpen} onClose={() => { setIsProCourseModalOpen(false); setEditingProCourse(null); }} onSuccess={handleProCourseSaved} editProCourse={editingProCourse} />
            <MaintenanceModal isOpen={isMaintenanceModalOpen} onClose={() => { setIsMaintenanceModalOpen(false); setEditingMaintenance(null); }} onSuccess={handleMaintenanceSaved} editMaintenance={editingMaintenance} />
            <MaintenanceHistoryModal isOpen={isHistoryModalOpen} onClose={() => { setIsHistoryModalOpen(false); setEditingHistory(null); }} onSuccess={handleHistorySaved} editHistory={editingHistory} />
            <MaintenanceTypeModal isOpen={isMaintenanceTypeModalOpen} onClose={() => { setIsMaintenanceTypeModalOpen(false); setEditingMaintenanceType(null); }} onSuccess={handleMaintenanceTypeSaved} editType={editingMaintenanceType} />
        </div>
    );
}
