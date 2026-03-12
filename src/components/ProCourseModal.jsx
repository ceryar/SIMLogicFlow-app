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
    const [formData, setFormData] = useState({
        horaini: '',
        horafin: '',
        horas: '',
        fecha: '',
        courseId: ''
    });
    const [courses, setCourses] = useState([]);
    const [allProCourses, setAllProCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingCourses, setFetchingCourses] = useState(false);
    const [error, setError] = useState(null);
    const [warnings, setWarnings] = useState([]);

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
            setFormData({
                horaini: editProCourse.horaini || '',
                horafin: editProCourse.horafin || '',
                horas: editProCourse.horas || '',
                fecha: editProCourse.fecha || '',
                courseId: editProCourse.course ? String(editProCourse.course.id) : ''
            });
        } else {
            setFormData({ horaini: '', horafin: '', horas: '', fecha: '', courseId: '' });
        }
        setError(null);
        setWarnings([]);
    }, [editProCourse, isOpen]);

    // ---- Derived values ----
    const selectedCourse = useMemo(
        () => courses.find(c => String(c.id) === String(formData.courseId)),
        [courses, formData.courseId]
    );

    // Auto-calculate session hours from horaini/horafin
    const calcSessionHours = (ini, fin) => {
        if (!ini || !fin) return '';
        const [hI, mI] = ini.split(':').map(Number);
        const [hF, mF] = fin.split(':').map(Number);
        const totalMin = (hF * 60 + mF) - (hI * 60 + mI);
        if (totalMin <= 0) return '';
        return Math.round(totalMin / 60 * 10) / 10; // 1 decimal
    };

    // Total hours already scheduled for selected course (excluding current edit)
    const scheduledHours = useMemo(() => {
        if (!formData.courseId) return 0;
        return allProCourses
            .filter(pc => String(pc.course?.id) === String(formData.courseId) && (!editProCourse || pc.id !== editProCourse.id))
            .reduce((sum, pc) => sum + (Number(pc.horas) || 0), 0);
    }, [allProCourses, formData.courseId, editProCourse]);

    // Update horas when times change
    const handleTimeChange = (field, val) => {
        const next = { ...formData, [field]: val };
        const calc = calcSessionHours(
            field === 'horaini' ? val : formData.horaini,
            field === 'horafin' ? val : formData.horafin
        );
        if (calc !== '') next.horas = calc;
        setFormData(next);
    };

    // Validate before submit
    const validate = () => {
        const warns = [];
        const errs = [];

        // 1) horafin must be after horaini
        if (formData.horaini && formData.horafin) {
            const [hI, mI] = formData.horaini.split(':').map(Number);
            const [hF, mF] = formData.horafin.split(':').map(Number);
            if ((hF * 60 + mF) <= (hI * 60 + mI)) {
                errs.push('La hora de fin debe ser posterior a la hora de inicio.');
            }
        }

        // 2) fecha cannot be after course fecFin
        if (selectedCourse && formData.fecha) {
            if (formData.fecha > selectedCourse.fecFin) {
                errs.push(`La fecha de sesión (${formData.fecha}) supera la fecha fin del curso (${selectedCourse.fecFin}).`);
            }
            if (formData.fecha < selectedCourse.fecInicio) {
                errs.push(`La fecha de sesión es anterior al inicio del curso (${selectedCourse.fecInicio}).`);
            }
        }

        // 3) Total scheduled hours must not exceed course hours
        if (selectedCourse?.horas && formData.horas) {
            const newTotal = scheduledHours + Number(formData.horas);
            if (newTotal > selectedCourse.horas) {
                errs.push(
                    `Esta sesión superaría el total de horas del curso. ` +
                    `Programadas: ${scheduledHours}h, Esta sesión: ${formData.horas}h, ` +
                    `Total: ${newTotal}h > Límite: ${selectedCourse.horas}h.`
                );
            } else if (newTotal === selectedCourse.horas) {
                warns.push(`Con esta sesión se completarán exactamente las ${selectedCourse.horas}h del curso.`);
            } else {
                const remaining = selectedCourse.horas - newTotal;
                warns.push(`Después de esta sesión quedarán ${remaining}h por programar.`);
            }
        }

        return { errs, warns };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setWarnings([]);

        const { errs, warns } = validate();
        if (errs.length > 0) {
            setError(errs.join(' '));
            return;
        }
        setWarnings(warns);

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = {
                ...formData,
                horas: Number(formData.horas),
                courseId: Number(formData.courseId)
            };

            let response;
            if (editProCourse) {
                response = await axios.put(`/api/v1/pro-courses/${editProCourse.id}`, payload, config);
            } else {
                response = await axios.post('/api/v1/pro-courses', payload, config);
            }

            onSuccess(response.data, !!editProCourse);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar la programación.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const sessionHoursPreview = calcSessionHours(formData.horaini, formData.horafin);
    const totalAfter = scheduledHours + Number(formData.horas || 0);
    const courseLimit = selectedCourse?.horas || 0;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '580px' }}>
                <div className="modal-header">
                    <h3>{editProCourse ? 'Editar Programación' : 'Nueva Programación de Sesión'}</h3>
                    <button className="btn-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {error && <div className="modal-error">{error}</div>}
                {warnings.map((w, i) => (
                    <div key={i} className="modal-warning">{w}</div>
                ))}

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-grid">

                        {/* Curso */}
                        <div className="form-group full-width">
                            <label>Seleccionar Curso *</label>
                            <select
                                required
                                value={formData.courseId}
                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value, fecha: '', horaini: '', horafin: '', horas: '' })}
                                disabled={fetchingCourses}
                            >
                                <option value="">Seleccione un curso...</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name} ({course.horas}h — hasta {course.fecFin})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Course Hours Summary */}
                        {selectedCourse && (
                            <div className="form-group full-width">
                                <div className="hours-progress-bar">
                                    <div className="hours-progress-labels">
                                        <span>Horas programadas</span>
                                        <span className={totalAfter > courseLimit ? 'over-limit' : ''}>
                                            {scheduledHours + Number(formData.horas || 0)}h / {courseLimit}h
                                        </span>
                                    </div>
                                    <div className="hours-track">
                                        <div
                                            className={`hours-fill ${totalAfter > courseLimit ? 'over' : totalAfter === courseLimit ? 'complete' : ''}`}
                                            style={{ width: `${Math.min((totalAfter / courseLimit) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <div className="hours-meta">
                                        Ya programadas: <strong>{scheduledHours}h</strong>
                                        &ensp;·&ensp;
                                        Disponibles: <strong>{Math.max(courseLimit - scheduledHours, 0)}h</strong>
                                        &ensp;·&ensp;
                                        Vigencia: <strong>{selectedCourse.fecInicio} — {selectedCourse.fecFin}</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fecha */}
                        <div className="form-group full-width">
                            <label>Fecha de Sesión *</label>
                            <DatePicker
                                required
                                value={formData.fecha}
                                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                placeholder="Seleccionar fecha"
                                minDate={selectedCourse?.fecInicio}
                                maxDate={selectedCourse?.fecFin}
                            />
                            {selectedCourse && (
                                <small className="field-hint">
                                    Solo entre {selectedCourse.fecInicio} y {selectedCourse.fecFin}
                                </small>
                            )}
                        </div>

                        {/* Hora Inicio */}
                        <div className="form-group">
                            <label>Hora Inicio *</label>
                            <TimePicker
                                value={formData.horaini}
                                onChange={(e) => handleTimeChange('horaini', e.target.value)}
                                required
                            />
                        </div>

                        {/* Hora Fin */}
                        <div className="form-group">
                            <label>Hora Fin *</label>
                            <TimePicker
                                value={formData.horafin}
                                onChange={(e) => handleTimeChange('horafin', e.target.value)}
                                required
                            />
                        </div>

                        {/* Horas de sesión (auto-calculated) */}
                        <div className="form-group full-width">
                            <label>Horas de Sesión (calculadas automáticamente)</label>
                            <div className="hours-display-row">
                                <div className={`hours-chip ${!sessionHoursPreview ? 'empty' : ''}`}>
                                    {sessionHoursPreview
                                        ? `${sessionHoursPreview} hora${sessionHoursPreview !== 1 ? 's' : ''}`
                                        : 'Selecciona hora inicio y fin'}
                                </div>
                                {sessionHoursPreview && selectedCourse && (
                                    <span className={`hours-status ${totalAfter > courseLimit ? 'status-error' : 'status-ok'}`}>
                                        {totalAfter > courseLimit
                                            ? `⚠ Supera el límite del curso (${courseLimit}h)`
                                            : `✓ Dentro del límite (${courseLimit}h)`}
                                    </span>
                                )}
                            </div>
                            {/* Hidden input keeps the value required */}
                            <input type="hidden" value={formData.horas} required />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading || fetchingCourses}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading || fetchingCourses || !formData.horas}>
                            {loading ? 'Guardando...' : (editProCourse ? 'Actualizar Programación' : 'Crear Sesión')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
