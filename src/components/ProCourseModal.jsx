import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DatePicker from './DatePicker';
import './UserModal.css';
import './TimePicker.css';

// ---- TimePicker sub-component (dropdown style) ----
function TimePicker({ value, onChange, label, required }) {
    const [open, setOpen] = useState(false);

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];

    const [selH, selM] = value ? value.split(':') : ['', ''];

    const handleSelect = (h, m) => {
        onChange({ target: { value: `${h}:${m}` } });
        setOpen(false);
    };

    return (
        <div className="timepicker-wrapper" style={{ position: 'relative' }}>
            <div
                className={`timepicker-input ${open ? 'open' : ''}`}
                onClick={() => setOpen(o => !o)}
            >
                {value ? (
                    <span className="timepicker-value">{value}</span>
                ) : (
                    <span className="timepicker-placeholder">Seleccionar hora</span>
                )}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            </div>

            {open && (
                <div className="timepicker-dropdown">
                    <div className="timepicker-cols">
                        <div className="timepicker-col">
                            <div className="timepicker-col-header">Hora</div>
                            <div className="timepicker-col-body">
                                {hours.map(h => (
                                    <div
                                        key={h}
                                        className={`timepicker-option ${selH === h ? 'selected' : ''}`}
                                        onClick={() => handleSelect(h, selM || '00')}
                                    >
                                        {h}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="timepicker-col">
                            <div className="timepicker-col-header">Min</div>
                            <div className="timepicker-col-body">
                                {minutes.map(m => (
                                    <div
                                        key={m}
                                        className={`timepicker-option ${selM === m ? 'selected' : ''}`}
                                        onClick={() => handleSelect(selH || '08', m)}
                                    >
                                        {m}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ---- Main modal ----
export default function ProCourseModal({ isOpen, onClose, onSuccess, editProCourse }) {
    const [courseId, setCourseId] = useState('');
    const [sessions, setSessions] = useState([]); // Array of { id, fecha, horaini, horafin, horas }

    // For the "current" row being edited in the form before adding to list
    const [currentSession, setCurrentSession] = useState({
        fecha: '',
        horaini: '',
        horafin: '',
        horas: ''
    });

    const [courses, setCourses] = useState([]);
    const [allProCourses, setAllProCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingCourses, setFetchingCourses] = useState(false);
    const [error, setError] = useState(null);
    const [warnings, setWarnings] = useState([]);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen) return;
            setFetchingCourses(true);
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [coursesRes, proCoursesRes] = await Promise.all([
                    axios.get('/api/v1/courses', config),
                    axios.get('/api/v1/pro-courses', config)
                ]);
                setCourses(coursesRes.data);
                setAllProCourses(proCoursesRes.data);
            } catch (err) {
                setError('No se pudieron cargar los cursos.');
            } finally {
                setFetchingCourses(false);
            }
        };
        fetchData();
    }, [isOpen]);

    useEffect(() => {
        if (editProCourse) {
            setCourseId(editProCourse.course ? String(editProCourse.course.id) : '');
            setSessions([{
                id: editProCourse.id,
                fecha: editProCourse.fecha || '',
                horaini: editProCourse.horaini || '',
                horafin: editProCourse.horafin || '',
                horas: editProCourse.horas || ''
            }]);
        } else {
            setCourseId('');
            setSessions([]);
            setCurrentSession({ fecha: '', horaini: '', horafin: '', horas: '' });
        }
        setError(null);
        setWarnings([]);
    }, [editProCourse, isOpen]);

    // ---- Derived values ----
    const selectedCourse = useMemo(
        () => courses.find(c => String(c.id) === String(courseId)),
        [courses, courseId]
    );

    const calcSessionHours = (ini, fin) => {
        if (!ini || !fin) return '';
        const [hI, mI] = ini.split(':').map(Number);
        const [hF, mF] = fin.split(':').map(Number);
        const totalMin = (hF * 60 + mF) - (hI * 60 + mI);
        if (totalMin <= 0) return '';
        return Math.round(totalMin / 60 * 10) / 10;
    };

    const scheduledHours = useMemo(() => {
        if (!courseId) return 0;
        return allProCourses
            .filter(pc => String(pc.course?.id) === String(courseId) && (!editProCourse || pc.id !== editProCourse.id))
            .reduce((sum, pc) => sum + (Number(pc.horas) || 0), 0);
    }, [allProCourses, courseId, editProCourse]);

    const totalNewSessionsHours = useMemo(() => {
        return sessions.reduce((sum, s) => sum + (Number(s.horas) || 0), 0);
    }, [sessions]);

    const handleCurrentTimeChange = (field, val) => {
        const next = { ...currentSession, [field]: val };
        const calc = calcSessionHours(
            field === 'horaini' ? val : currentSession.horaini,
            field === 'horafin' ? val : currentSession.horafin
        );
        next.horas = calc || '';
        setCurrentSession(next);
    };

    const addSessionToList = () => {
        if (!currentSession.fecha || !currentSession.horaini || !currentSession.horafin || !currentSession.horas) {
            setError('Complete todos los campos de la sesión antes de añadirla.');
            return;
        }

        // Validate individual session against course bounds
        if (selectedCourse) {
            if (currentSession.fecha < selectedCourse.fecInicio || currentSession.fecha > selectedCourse.fecFin) {
                setError(`La fecha debe estar entre ${selectedCourse.fecInicio} y ${selectedCourse.fecFin}`);
                return;
            }
            if (currentSession.fecha < today) {
                setError('No se pueden programar sesiones en fechas pasadas.');
                return;
            }
        }

        const newTotal = scheduledHours + totalNewSessionsHours + Number(currentSession.horas);
        if (selectedCourse && newTotal > selectedCourse.horas) {
            setError(`Esta sesión superaría el límite de horas del curso (${selectedCourse.horas}h).`);
            return;
        }

        setSessions([...sessions, { ...currentSession, id: Date.now() }]);
        setCurrentSession({ fecha: '', horaini: '', horafin: '', horas: '' });
        setError(null);
    };

    const removeSession = (id) => {
        setSessions(sessions.filter(s => s.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (sessions.length === 0) {
            setError('Debe añadir al menos una sesión a la lista.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editProCourse) {
                const s = sessions[0];
                const payload = { ...s, horas: Number(s.horas), courseId: Number(courseId) };
                const res = await axios.put(`/api/v1/pro-courses/${editProCourse.id}`, payload, config);
                onSuccess(res.data, true);
            } else {
                const promises = sessions.map(s => {
                    const payload = { ...s, horas: Number(s.horas), courseId: Number(courseId) };
                    return axios.post('/api/v1/pro-courses', payload, config);
                });
                const responses = await Promise.all(promises);
                onSuccess(responses[0].data, false);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar la programación.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const totalAfter = scheduledHours + totalNewSessionsHours;
    const courseLimit = selectedCourse?.horas || 0;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '650px' }}>
                <div className="modal-header">
                    <h3>{editProCourse ? 'Editar Sesión' : 'Programar Multi-sesiones'}</h3>
                    <button className="btn-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Curso *</label>
                            <select
                                required
                                value={courseId}
                                onChange={(e) => {
                                    setCourseId(e.target.value);
                                    setSessions([]);
                                    setError(null);
                                }}
                                disabled={fetchingCourses || editProCourse}
                            >
                                <option value="">Seleccione un curso...</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name} ({course.horas}h — hasta {course.fecFin})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedCourse && (
                            <div className="form-group full-width">
                                <div className="hours-progress-bar">
                                    <div className="hours-progress-labels">
                                        <span>Horas Totales (DB + Nuevas)</span>
                                        <span className={totalAfter > courseLimit ? 'over-limit' : ''}>
                                            {totalAfter}h / {courseLimit}h
                                        </span>
                                    </div>
                                    <div className="hours-track">
                                        <div
                                            className={`hours-fill ${totalAfter >= courseLimit ? 'complete' : ''}`}
                                            style={{ width: `${Math.min((totalAfter / courseLimit) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <div className="hours-meta">
                                        En DB: <strong>{scheduledHours}h</strong> |
                                        En Lista: <strong>{totalNewSessionsHours}h</strong> |
                                        Disponible: <strong>{Math.max(courseLimit - totalAfter, 0)}h</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!editProCourse && selectedCourse && (
                            <div className="session-builder full-width" style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', marginBottom: '15px' }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#94a3b8' }}>Añadir sesión a la lista</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '12px' }}>Fecha</label>
                                        <DatePicker
                                            value={currentSession.fecha}
                                            onChange={(e) => setCurrentSession({ ...currentSession, fecha: e.target.value })}
                                            minDate={selectedCourse.fecInicio < today ? today : selectedCourse.fecInicio}
                                            maxDate={selectedCourse.fecFin}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '12px' }}>Inicio</label>
                                        <TimePicker
                                            value={currentSession.horaini}
                                            onChange={(e) => handleCurrentTimeChange('horaini', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '12px' }}>Fin</label>
                                        <TimePicker
                                            value={currentSession.horafin}
                                            onChange={(e) => handleCurrentTimeChange('horafin', e.target.value)}
                                        />
                                    </div>
                                    <button type="button" className="btn-primary" onClick={addSessionToList} style={{ padding: '10px', height: '42px' }}>
                                        +
                                    </button>
                                </div>
                                {currentSession.horas && (
                                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#6366f1' }}>
                                        Duración: {currentSession.horas} h
                                    </div>
                                )}
                            </div>
                        )}

                        {sessions.length > 0 && (
                            <div className="sessions-list full-width" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <label style={{ marginBottom: '8px', display: 'block' }}>Sesiones para guardar ({sessions.length}):</label>
                                {sessions.map((s, idx) => (
                                    <div key={s.id} className="session-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '6px' }}>
                                        <div style={{ fontSize: '14px' }}>
                                            <strong>{s.fecha}</strong> | {s.horaini} - {s.horafin} ({s.horas}h)
                                        </div>
                                        {!editProCourse && (
                                            <button type="button" className="btn-icon btn-delete" onClick={() => removeSession(s.id)} style={{ color: '#ef4444' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {editProCourse && sessions[0] && (
                            <>
                                <div className="form-group">
                                    <label>Fecha de Sesión *</label>
                                    <DatePicker
                                        required
                                        value={sessions[0].fecha}
                                        onChange={(e) => setSessions([{ ...sessions[0], fecha: e.target.value }])}
                                        minDate={selectedCourse?.fecInicio < today ? today : selectedCourse?.fecInicio}
                                        maxDate={selectedCourse?.fecFin}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hora Inicio *</label>
                                    <TimePicker
                                        value={sessions[0].horaini}
                                        onChange={(e) => {
                                            const h = calcSessionHours(e.target.value, sessions[0].horafin);
                                            setSessions([{ ...sessions[0], horaini: e.target.value, horas: h || '' }]);
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hora Fin *</label>
                                    <TimePicker
                                        value={sessions[0].horafin}
                                        onChange={(e) => {
                                            const h = calcSessionHours(sessions[0].horaini, e.target.value);
                                            setSessions([{ ...sessions[0], horafin: e.target.value, horas: h || '' }]);
                                        }}
                                    />
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <div className="hours-chip" style={{ height: '42px', display: 'flex', alignItems: 'center', width: '100%' }}>
                                        {sessions[0].horas}h
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="modal-actions" style={{ marginTop: '20px' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading || sessions.length === 0}>
                            {loading ? 'Guardando...' : (editProCourse ? 'Actualizar Sesión' : `Guardar ${sessions.length} Sesiones`)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

