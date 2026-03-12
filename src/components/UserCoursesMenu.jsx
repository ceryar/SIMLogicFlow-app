import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './UserModal.css';
import './UserCoursesMenu.css';

// ── Capacity rules: { simulatorKey: { roomKey: { role: limit } } }
// Keys are lowercase, partial match
const CAPACITY_RULES = {
    indra: {
        radar: { ESTUDIANTE: 10, INSTRUCTOR: 5 },
        aeródromo: { ESTUDIANTE: 8, INSTRUCTOR: 5 },
        pseudopilotos: { PSEUDOPILOTO: 10 }
    },
    thales: {
        radar: { ESTUDIANTE: 10, INSTRUCTOR: 5 },
        aeródromo: { ESTUDIANTE: 8, INSTRUCTOR: 5 },
        pseudopilotos: { PSEUDOPILOTO: 12 }
    }
};

// Get the capacity limit for a role in a given course
function getCourseCapacity(course, roleName) {
    if (!course || !roleName) return null;

    const simKey = Object.keys(CAPACITY_RULES).find(k =>
        course.simulator?.name?.toLowerCase().includes(k)
    );
    if (!simKey) return null;

    const simRules = CAPACITY_RULES[simKey];
    let totalLimit = 0;
    let found = false;

    // Sum limits across all rooms in the course that apply to this role
    const courseRooms = course.rooms ? Array.from(course.rooms) : [];
    courseRooms.forEach(room => {
        const roomKey = Object.keys(simRules).find(k =>
            room.name?.toLowerCase().includes(k)
        );
        if (roomKey && simRules[roomKey][roleName] !== undefined) {
            totalLimit += simRules[roomKey][roleName];
            found = true;
        }
    });

    return found ? totalLimit : null;
}

// Build a readable capacity summary for a course
function buildCapacitySummary(course) {
    if (!course) return [];
    const simKey = Object.keys(CAPACITY_RULES).find(k =>
        course.simulator?.name?.toLowerCase().includes(k)
    );
    if (!simKey) return [];

    const simRules = CAPACITY_RULES[simKey];
    const courseRooms = course.rooms ? Array.from(course.rooms) : [];
    const lines = [];

    courseRooms.forEach(room => {
        const roomKey = Object.keys(simRules).find(k =>
            room.name?.toLowerCase().includes(k)
        );
        if (roomKey) {
            const caps = simRules[roomKey];
            const parts = Object.entries(caps).map(([rol, lim]) => `${rol}: ${lim}`).join(', ');
            lines.push({ room: room.name, caps: parts });
        }
    });
    return lines;
}

export default function UserCoursesMenu() {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userCourses, setUserCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [assignCourseId, setAssignCourseId] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [capacityWarning, setCapacityWarning] = useState(null);

    const token = localStorage.getItem('token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        const fetchAll = async () => {
            setLoadingUsers(true);
            try {
                const [usersRes, coursesRes] = await Promise.all([
                    axios.get('/api/v1/users', authHeader),
                    axios.get('/api/v1/courses', authHeader)
                ]);
                setUsers(usersRes.data);
                setCourses(coursesRes.data);
            } catch (err) {
                setError('No se pudieron cargar los datos.');
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchAll();
    }, []);

    const fetchUserCourses = useCallback(async (userId) => {
        setLoadingCourses(true);
        setError(null);
        try {
            const res = await axios.get(`/api/v1/users/${userId}/courses`, authHeader);
            setUserCourses(Array.from(res.data));
        } catch {
            setError('No se pudieron cargar los cursos del usuario.');
        } finally {
            setLoadingCourses(false);
        }
    }, []);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setUserCourses([]);
        setAssignCourseId('');
        setError(null);
        setSuccessMsg(null);
        setCapacityWarning(null);
        fetchUserCourses(user.id);
    };

    // ── Capacity check when course selection changes ──
    const selectedCourse = useMemo(
        () => courses.find(c => String(c.id) === String(assignCourseId)),
        [courses, assignCourseId]
    );

    // Count enrolled users per role for the selected course
    const enrolledByRole = useMemo(() => {
        if (!selectedCourse) return {};
        const counts = {};
        users.forEach(u => {
            const userCourseIds = u.courses?.map(c => c.id) || [];
            // Since User doesn't expose courses directly, we derive from userCourses
            // We'll recount when the data is there
        });
        return counts;
    }, [selectedCourse, users]);

    // Check capacity for selected course + user's role
    const checkCapacityForCourse = async (courseId) => {
        if (!courseId || !selectedUser) {
            setCapacityWarning(null);
            return;
        }
        const course = courses.find(c => String(c.id) === String(courseId));
        if (!course) return;

        const userRole = selectedUser.role?.name;
        const limit = getCourseCapacity(course, userRole);

        if (limit === null) {
            setCapacityWarning(null);
            return;
        }

        // Count users with the same role enrolled in this course
        try {
            const usersEnrolledCount = await Promise.all(
                users
                    .filter(u => u.id !== selectedUser.id && u.role?.name === userRole)
                    .map(u =>
                        axios.get(`/api/v1/users/${u.id}/courses`, authHeader)
                            .then(r => Array.from(r.data).some(c => String(c.id) === String(courseId)) ? 1 : 0)
                            .catch(() => 0)
                    )
            );
            const enrolled = usersEnrolledCount.reduce((a, b) => a + b, 0);

            const summary = buildCapacitySummary(course);
            if (enrolled >= limit) {
                setCapacityWarning({
                    type: 'error',
                    message: `Capacidad máxima alcanzada para ${userRole} en este curso (${enrolled}/${limit}).`,
                    summary
                });
            } else {
                setCapacityWarning({
                    type: 'ok',
                    message: `Cupos disponibles para ${userRole}: ${limit - enrolled} de ${limit}.`,
                    summary
                });
            }
        } catch {
            setCapacityWarning(null);
        }
    };

    const handleCourseSelect = async (courseId) => {
        setAssignCourseId(courseId);
        setCapacityWarning(null);
        if (courseId) await checkCapacityForCourse(courseId);
    };

    const handleAssignCourse = async (e) => {
        e.preventDefault();
        if (!assignCourseId) return;

        // Block if capacity is full
        if (capacityWarning?.type === 'error') {
            setError(capacityWarning.message);
            return;
        }

        setAssigning(true);
        setError(null);
        setSuccessMsg(null);
        try {
            await axios.post(
                `/api/v1/users/${selectedUser.id}/courses`,
                { courseId: Number(assignCourseId) },
                authHeader
            );
            setSuccessMsg('Curso asignado exitosamente.');
            setAssignCourseId('');
            setCapacityWarning(null);
            fetchUserCourses(selectedUser.id);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al asignar el curso.');
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveCourse = async (courseId, courseName) => {
        if (!window.confirm(`¿Eliminar el curso "${courseName}" de ${selectedUser.firstName} ${selectedUser.lastname}?`)) return;
        setError(null);
        setSuccessMsg(null);
        try {
            await axios.delete(`/api/v1/users/${selectedUser.id}/courses/${courseId}`, authHeader);
            setSuccessMsg('Curso eliminado del usuario exitosamente.');
            fetchUserCourses(selectedUser.id);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al eliminar el curso.');
        }
    };

    const filteredUsers = users.filter(u => {
        const q = searchQuery.toLowerCase();
        return (
            `${u.firstName} ${u.lastname}`.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role?.name?.toLowerCase().includes(q)
        );
    });

    const availableCourses = courses.filter(c => !userCourses.some(uc => uc.id === c.id));

    return (
        <div className="uc-layout">
            {/* LEFT PANEL */}
            <div className="uc-user-panel">
                <div className="uc-panel-header">
                    <h3>Seleccionar Usuario</h3>
                    <div className="uc-search-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o rol..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                {loadingUsers ? (
                    <div className="uc-loading">Cargando usuarios...</div>
                ) : (
                    <ul className="uc-user-list">
                        {filteredUsers.map(user => (
                            <li key={user.id}
                                className={`uc-user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                                onClick={() => handleSelectUser(user)}
                            >
                                <div className="uc-user-avatar">
                                    {user.firstName?.charAt(0).toUpperCase()}{user.lastname?.charAt(0).toUpperCase()}
                                </div>
                                <div className="uc-user-info">
                                    <span className="uc-user-name">{user.firstName} {user.lastname}</span>
                                    <span className="uc-user-email">{user.email}</span>
                                </div>
                                <span className={`uc-role-badge role-${user.role?.name?.toLowerCase() || 'unknown'}`}>
                                    {user.role?.name || '—'}
                                </span>
                            </li>
                        ))}
                        {filteredUsers.length === 0 && (
                            <li className="uc-empty-list">No se encontraron usuarios</li>
                        )}
                    </ul>
                )}
            </div>

            {/* RIGHT PANEL */}
            <div className="uc-course-panel">
                {!selectedUser ? (
                    <div className="uc-placeholder">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <p>Selecciona un usuario para gestionar sus cursos</p>
                    </div>
                ) : (
                    <>
                        {/* User Header */}
                        <div className="uc-course-header">
                            <div className="uc-selected-user-info">
                                <div className="uc-user-avatar large">
                                    {selectedUser.firstName?.charAt(0).toUpperCase()}{selectedUser.lastname?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3>{selectedUser.firstName} {selectedUser.lastname}</h3>
                                    <span className="uc-user-email">{selectedUser.email}</span>
                                    &nbsp;·&nbsp;
                                    <span className={`uc-role-badge role-${selectedUser.role?.name?.toLowerCase() || 'unknown'}`}>
                                        {selectedUser.role?.name || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {error && <div className="modal-error" style={{ margin: '12px 24px 0' }}>{error}</div>}
                        {successMsg && <div className="uc-success">{successMsg}</div>}

                        {/* Assign Course */}
                        <div className="uc-assign-form">
                            <h4>Asignar Nuevo Curso</h4>
                            <form onSubmit={handleAssignCourse} className="uc-form-row">
                                <select
                                    value={assignCourseId}
                                    onChange={(e) => handleCourseSelect(e.target.value)}
                                    required
                                    disabled={assigning}
                                >
                                    <option value="">Seleccione un curso disponible...</option>
                                    {availableCourses.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} — {c.simulator?.name || '?'}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={assigning || !assignCourseId || capacityWarning?.type === 'error'}
                                >
                                    {assigning ? 'Asignando...' : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                            </svg>
                                            Asignar
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Capacity feedback */}
                            {capacityWarning && (
                                <div className={`uc-capacity-card ${capacityWarning.type}`}>
                                    <div className="uc-capacity-msg">
                                        {capacityWarning.type === 'ok'
                                            ? <span className="cap-icon cap-ok">✓</span>
                                            : <span className="cap-icon cap-err">✗</span>}
                                        {capacityWarning.message}
                                    </div>
                                    {capacityWarning.summary.length > 0 && (
                                        <div className="uc-capacity-summary">
                                            <strong>Capacidad del curso:</strong>
                                            {capacityWarning.summary.map((line, i) => (
                                                <div key={i} className="cap-room-line">
                                                    <span className="cap-room-name">{line.room}</span>
                                                    <span className="cap-room-caps">{line.caps}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {availableCourses.length === 0 && !loadingCourses && (
                                <small className="uc-hint">Este usuario ya tiene todos los cursos disponibles asignados.</small>
                            )}
                        </div>

                        {/* Assigned Courses Table */}
                        <div className="uc-courses-list">
                            <h4>Cursos Asignados <span className="uc-count">{userCourses.length}</span></h4>
                            {loadingCourses ? (
                                <div className="uc-loading">Cargando cursos del usuario...</div>
                            ) : userCourses.length === 0 ? (
                                <div className="uc-empty">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                    </svg>
                                    <p>Este usuario no tiene cursos asignados</p>
                                </div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Curso</th>
                                            <th>Simulador</th>
                                            <th>Salas</th>
                                            <th>Vigencia</th>
                                            <th>Horas</th>
                                            <th className="text-right">Quitar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userCourses.map(course => (
                                            <tr key={course.id}>
                                                <td data-label="Curso" className="font-medium">{course.name}</td>
                                                <td data-label="Simulador">{course.simulator?.name || '—'}</td>
                                                <td data-label="Salas">
                                                    {course.rooms && Array.from(course.rooms).length > 0
                                                        ? Array.from(course.rooms).map(r => (
                                                            <span key={r.id} className="uc-room-chip">{r.name}</span>
                                                        ))
                                                        : '—'}
                                                </td>
                                                <td data-label="Vigencia">{course.fecInicio} — {course.fecFin}</td>
                                                <td data-label="Horas">{course.horas}h</td>
                                                <td data-label="Quitar" className="actions-cell">
                                                    <button className="btn-icon btn-delete" onClick={() => handleRemoveCourse(course.id, course.name)}>
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
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
