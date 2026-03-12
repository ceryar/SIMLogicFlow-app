import { useState, useMemo } from 'react';
import './AdminMenu.css';
import './CalendarView.css';

export default function CalendarView({ events, type }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayEvents, setSelectedDayEvents] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    const { days, monthName, year } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ day: null, key: `empty-${i}` });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
                key: `day-${i}`
            });
        }

        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        return { days, monthName: monthNames[month], year };
    }, [currentDate]);

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(newDate);
        setSelectedDayEvents(null);
        setSelectedDate(null);
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        // Handle HH:MM:SS or HH:MM
        const parts = timeStr.split(':');
        return `${parts[0]}:${parts[1]}`;
    };

    const getEventLabel = (event) => {
        if (type === 'course') {
            return event.course?.name || 'Curso';
        }
        return event.simulator?.name || event.maintenanceType?.name || 'Mantenimiento';
    };

    const getEventTime = (event) => {
        if (type === 'course') {
            return event.horaini && event.horafin
                ? `${formatTime(event.horaini)} – ${formatTime(event.horafin)}`
                : null;
        }
        return event.horaIni && event.horaFin
            ? `${formatTime(event.horaIni)} – ${formatTime(event.horaFin)}`
            : null;
    };

    const getEventsForDay = (dateString) => {
        return events.filter(event => {
            const eventDate = event.fecha || event.fecIni;
            return eventDate === dateString;
        });
    };

    const handleDayClick = (dayObj) => {
        if (!dayObj.day) return;
        const dayEvents = getEventsForDay(dayObj.dateString);
        setSelectedDate(dayObj.dateString);
        setSelectedDayEvents(dayEvents);
    };

    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return (
        <div className="calendar-wrapper">
            <div className="calendar-container">
                {/* Header */}
                <div className="calendar-header">
                    <button className="btn-calendar-nav" onClick={() => changeMonth(-1)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <h3>{monthName} {year}</h3>
                    <button className="btn-calendar-nav" onClick={() => changeMonth(1)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                {/* Weekday Labels */}
                <div className="calendar-grid">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                        <div key={d} className="calendar-weekday">{d}</div>
                    ))}

                    {/* Day Cells */}
                    {days.map(dayObj => {
                        const dayEvents = dayObj.day ? getEventsForDay(dayObj.dateString) : [];
                        const isToday = dayObj.dateString === todayString;
                        const isSelected = dayObj.dateString === selectedDate;

                        return (
                            <div
                                key={dayObj.key}
                                className={`calendar-day ${dayObj.day === null ? 'empty' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                                onClick={() => dayObj.day && handleDayClick(dayObj)}
                            >
                                {dayObj.day && (
                                    <>
                                        <span className="day-number">{dayObj.day}</span>
                                        <div className="day-events">
                                            {dayEvents.slice(0, 2).map((ev, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`calendar-event event-${type}`}
                                                    title={`${getEventLabel(ev)}${getEventTime(ev) ? ' · ' + getEventTime(ev) : ''}`}
                                                >
                                                    <span className="event-label">{getEventLabel(ev)}</span>
                                                    {getEventTime(ev) && (
                                                        <span className="event-time">{getEventTime(ev)}</span>
                                                    )}
                                                </div>
                                            ))}
                                            {dayEvents.length > 2 && (
                                                <div className="event-more">+{dayEvents.length - 2} más</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedDayEvents !== null && (
                <div className="calendar-detail">
                    <div className="calendar-detail-header">
                        <h4>
                            {selectedDate
                                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
                                : 'Detalle'}
                        </h4>
                        <button className="btn-close-detail" onClick={() => { setSelectedDayEvents(null); setSelectedDate(null); }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {selectedDayEvents.length === 0 ? (
                        <div className="calendar-detail-empty">
                            <p>No hay eventos programados para este día</p>
                        </div>
                    ) : (
                        <ul className="calendar-detail-list">
                            {selectedDayEvents.map((ev, idx) => {
                                const timeStr = getEventTime(ev);
                                return (
                                    <li key={idx} className={`calendar-detail-item event-${type}-item`}>
                                        <div className={`detail-color-bar bg-${type}`}></div>
                                        <div className="detail-content">
                                            <span className="detail-title">{getEventLabel(ev)}</span>
                                            {timeStr && (
                                                <div className="detail-time">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10"></circle>
                                                        <polyline points="12 6 12 12 16 14"></polyline>
                                                    </svg>
                                                    {timeStr}
                                                </div>
                                            )}
                                            {type === 'course' && ev.course?.name && (
                                                <div className="detail-meta">📚 {ev.course.name}</div>
                                            )}
                                            {type === 'maint' && (
                                                <>
                                                    {ev.maintenanceType?.name && (
                                                        <div className="detail-meta">🔧 {ev.maintenanceType.name}</div>
                                                    )}
                                                    {ev.description && (
                                                        <div className="detail-desc">{ev.description}</div>
                                                    )}
                                                    {ev.fecFin && ev.fecFin !== ev.fecIni && (
                                                        <div className="detail-meta">📅 Hasta: {ev.fecFin}</div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
