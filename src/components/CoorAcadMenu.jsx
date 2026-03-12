import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UserModal from './UserModal';
import CourseModal from './CourseModal';
import ProCourseModal from './ProCourseModal';
import UserCoursesMenu from './UserCoursesMenu';
import CalendarView from './CalendarView';
import './AdminMenu.css';

export default function CoorAcadMenu() {
    const [activeTab, setActiveTab] = useState('users');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isProCourseModalOpen, setIsProCourseModalOpen] = useState(false);

    const [editingUser, setEditingUser] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingProCourse, setEditingProCourse] = useState(null);

    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [proCourses, setProCourses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    useEffect(() => {
        const fetchMap = {
            users: fetchUsers,
            courses: fetchCourses,
            'pro-courses': fetchProCourses,
            calendar: fetchProCourses
        };

        if (fetchMap[activeTab]) {
            fetchMap[activeTab]();
        } else {
            setLoading(false);
        }
    }, [activeTab, fetchUsers, fetchCourses, fetchProCourses]);

    const handleUserSaved = (userData, isEdit) => {
        if (isEdit) {
            setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
        } else {
            setUsers(prev => [userData, ...prev]);
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

    const handleDeleteUser = async (e, id, email) => {
        e.stopPropagation();
        const targetUser = users.find(u => u.id === id);
        if (targetUser && targetUser.role?.name !== 'ESTUDIANTE') {
            alert('Como Coordinador Académico, solo puede eliminar estudiantes.');
            return;
        }

        if (!window.confirm(`¿Está seguro de eliminar al estudiante ${email}?`)) return;
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

    const filteredUsers = users.filter(user => {
        const fullName = `${user.firstName} ${user.middleName || ''} ${user.lastname} ${user.secondlasname || ''}`.toLowerCase();
        const email = user.email.toLowerCase();
        const search = searchTerm.toLowerCase();
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
                    placeholder="Buscar estudiante por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                        color: '#1e293b'
                    }}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
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
                    {loading && users.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                <div className="loading-spinner-small" style={{ marginBottom: '10px' }}></div>
                                Cargando estudiantes...
                            </td>
                        </tr>
                    ) : filteredUsers.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                No se encontraron estudiantes.
                            </td>
                        </tr>
                    ) : (
                        filteredUsers.map(user => (
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
                                    {user.role?.name === 'ESTUDIANTE' && (
                                        <>
                                            <button className="btn-icon btn-edit" title="Editar" onClick={() => { setEditingUser(user); setIsUserModalOpen(true); }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button className="btn-icon btn-delete" title="Eliminar" onClick={(e) => handleDeleteUser(e, user.id, user.email)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
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
                    {loading && courses.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                <div className="loading-spinner-small" style={{ marginBottom: '10px' }}></div>
                                Cargando cursos...
                            </td>
                        </tr>
                    ) : courses.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                No hay cursos registrados.
                            </td>
                        </tr>
                    ) : (
                        courses.map(course => (
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
                                    <span className="entity-indicator">✈️ {course.simulator?.name || 'N/A'}</span> <br />
                                    <span className="entity-indicator">🏫 {course.rooms?.length || 0} aulas</span>
                                </td>
                                <td data-label="Acciones" className="actions-cell">
                                    <button className="btn-icon btn-edit" onClick={() => { setEditingCourse(course); setIsCourseModalOpen(true); }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                    <button className="btn-icon btn-delete" onClick={(e) => handleDeleteCourse(e, course.id, course.name)}>
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

    const renderProCourseTable = () => (
        <div className="table-card">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Curso</th>
                        <th>Fecha</th>
                        <th>Horario</th>
                        <th>Horas</th>
                        <th className="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && proCourses.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                <div className="loading-spinner-small" style={{ marginBottom: '10px' }}></div>
                                Cargando programación...
                            </td>
                        </tr>
                    ) : proCourses.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                No hay programaciones registradas.
                            </td>
                        </tr>
                    ) : (
                        proCourses.map(pro => (
                            <tr key={pro.id}>
                                <td data-label="ID">#{pro.id}</td>
                                <td data-label="Curso" className="font-medium">{pro.course?.name || 'N/A'}</td>
                                <td data-label="Fecha">{pro.fecha}</td>
                                <td data-label="Horario">{pro.horaini} - {pro.horafin}</td>
                                <td data-label="Horas">{pro.horas}h</td>
                                <td data-label="Acciones" className="actions-cell">
                                    <button className="btn-icon btn-edit" onClick={() => { setEditingProCourse(pro); setIsProCourseModalOpen(true); }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                    <button className="btn-icon btn-delete" onClick={(e) => handleDeleteProCourse(e, pro.id)}>
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
                <h2 className="admin-title">Panel Coordinador</h2>
                <ul className="admin-nav">
                    <li className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Usuarios</li>
                    <li className={`admin-nav-item ${activeTab === 'user-courses' ? 'active' : ''}`} onClick={() => setActiveTab('user-courses')}>Asignar Cursos</li>
                    <li className={`admin-nav-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>Cursos</li>
                    <li className={`admin-nav-item ${activeTab === 'pro-courses' ? 'active' : ''}`} onClick={() => setActiveTab('pro-courses')}>Programación</li>
                    <li className={`admin-nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>Calendario</li>
                </ul>
            </div>

            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1 className="admin-main-title">
                            {activeTab === 'users' ? 'Gestión de Estudiantes' :
                                activeTab === 'courses' ? 'Gestión de Cursos' :
                                    activeTab === 'user-courses' ? 'Asignación de Estudiantes' :
                                        activeTab === 'pro-courses' ? 'Programación de Cursos' : 'Calendario Académico'}
                        </h1>
                        <p className="admin-subtitle">Panel de control de recursos académicos</p>
                    </div>
                    {activeTab !== 'calendar' && activeTab !== 'user-courses' && (
                        <button className="btn-primary" onClick={() => {
                            if (activeTab === 'users') { setEditingUser(null); setIsUserModalOpen(true); }
                            else if (activeTab === 'courses') { setEditingCourse(null); setIsCourseModalOpen(true); }
                            else if (activeTab === 'pro-courses') { setEditingProCourse(null); setIsProCourseModalOpen(true); }
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            {activeTab === 'users' ? 'Nuevo Estudiante' : activeTab === 'courses' ? 'Nuevo Curso' : 'Programar Curso'}
                        </button>
                    )}
                </header>

                {error && <div className="error-alert">{error}</div>}

                {activeTab === 'users' ? renderUserTable() :
                    activeTab === 'user-courses' ? <UserCoursesMenu /> :
                        activeTab === 'courses' ? renderCourseTable() :
                            activeTab === 'pro-courses' ? renderProCourseTable() :
                                loading && proCourses.length === 0 ? (
                                    <div className="loading-state">Cargando calendario...</div>
                                ) : (
                                    <CalendarView events={proCourses} type="course" />
                                )
                }
            </main>

            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => { setIsUserModalOpen(false); setEditingUser(null); }}
                onSuccess={handleUserSaved}
                editUser={editingUser}
                currentUserRole="COORACAD"
            />

            <CourseModal
                isOpen={isCourseModalOpen}
                onClose={() => { setIsCourseModalOpen(false); setEditingCourse(null); }}
                onSuccess={handleCourseSaved}
                editCourse={editingCourse}
            />

            <ProCourseModal
                isOpen={isProCourseModalOpen}
                onClose={() => { setIsProCourseModalOpen(false); setEditingProCourse(null); }}
                onSuccess={handleProCourseSaved}
                editProCourse={editingProCourse}
            />
        </div>
    );
}
