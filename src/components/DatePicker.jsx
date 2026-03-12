import { useState, useMemo, useRef, useEffect } from 'react';
import './UserModal.css';

export default function DatePicker({ value, onChange, placeholder, required, minDate, maxDate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value + 'T00:00:00') : new Date());
    const containerRef = useRef(null);

    // Handle clicks outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { days, monthName, year } = useMemo(() => {
        const y = viewDate.getFullYear();
        const m = viewDate.getMonth();
        const firstDayOfMonth = new Date(y, m, 1).getDay();
        const daysInMonth = new Date(y, m + 1, 0).getDate();

        const daysArray = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            daysArray.push({ day: null, key: `empty-${i}` });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const disabled = (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate);
            daysArray.push({ day: i, dateString: dateStr, key: `day-${i}`, disabled });
        }

        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        return { days: daysArray, monthName: monthNames[m], year: y };
    }, [viewDate, minDate, maxDate]);

    const handleDateSelect = (dateString, disabled) => {
        if (disabled) return;
        onChange({ target: { value: dateString } });
        setIsOpen(false);
    };

    const changeMonth = (e, offset) => {
        e.preventDefault();
        e.stopPropagation();
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

    return (
        <div className="datepicker-container" ref={containerRef}>
            <div className="datepicker-input-wrapper" onClick={() => setIsOpen(!isOpen)}>
                <input
                    type="text"
                    readOnly
                    required={required}
                    value={value || ''}
                    placeholder={placeholder || 'Seleccionar fecha...'}
                    className="datepicker-input"
                />
                <svg className="datepicker-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            </div>

            {isOpen && (
                <div className="datepicker-dropdown">
                    <div className="datepicker-header">
                        <button className="btn-nav" onClick={(e) => changeMonth(e, -1)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <span>{monthName} {year}</span>
                        <button className="btn-nav" onClick={(e) => changeMonth(e, 1)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                    <div className="datepicker-grid">
                        <div className="weekday">D</div>
                        <div className="weekday">L</div>
                        <div className="weekday">M</div>
                        <div className="weekday">M</div>
                        <div className="weekday">J</div>
                        <div className="weekday">V</div>
                        <div className="weekday">S</div>

                        {days.map(d => (
                            <div
                                key={d.key}
                                className={`datepicker-day ${d.day ? '' : 'empty'} ${d.dateString === value ? 'selected' : ''} ${d.disabled ? 'disabled' : ''}`}
                                onClick={() => d.day && handleDateSelect(d.dateString, d.disabled)}
                            >
                                {d.day}
                            </div>
                        ))}
                    </div>
                    {(minDate || maxDate) && (
                        <div className="datepicker-range-hint">
                            {minDate && <span>Desde: {minDate}</span>}
                            {maxDate && <span>Hasta: {maxDate}</span>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
