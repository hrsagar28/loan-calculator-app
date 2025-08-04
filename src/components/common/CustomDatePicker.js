import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { icons } from '../../constants/icons';

const CustomDatePicker = ({ label, value, onChange, id }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('days'); // 'days', 'months', 'years'
    const [displayDate, setDisplayDate] = useState(value ? new Date(value) : new Date());
    const [popupStyle, setPopupStyle] = useState({});
    const [animationClass, setAnimationClass] = useState('');

    const buttonRef = useRef(null);
    const popupRef = useRef(null);

    // --- Effects for positioning and closing the popup ---

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const popupHeight = 350; // Adjusted for new footer

            let top = rect.bottom + 8;
            if (spaceBelow < popupHeight && rect.top > popupHeight) {
                top = rect.top - popupHeight - 8;
            }

            setPopupStyle({
                top: `${top}px`,
                left: `${rect.left}px`,
                width: `${rect.width < 288 ? 288 : rect.width}px` // Minimum width
            });
            setAnimationClass('animate-fade-in');
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && buttonRef.current && !buttonRef.current.contains(event.target) && popupRef.current && !popupRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !buttonRef.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) setIsOpen(false);
        }, { threshold: 0.1 });
        observer.observe(buttonRef.current);
        return () => observer.disconnect();
    }, [isOpen]);

    // --- Date Formatting and Grid Generation ---

    const formatDate = (date) => {
        if (!date) return 'Select a date...';
        const d = new Date(date);
        const timeZoneOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() + timeZoneOffset).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    };
    
    const calendarGrid = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const paddingDays = Array.from({ length: firstDayOfMonth });
        return { days, paddingDays, year, month };
    }, [displayDate]);

    // --- Handlers for user interaction ---

    const handleDateSelect = (day) => {
        const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
        onChange(newDate.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const handleMonthSelect = (monthIndex) => {
        setDisplayDate(new Date(displayDate.getFullYear(), monthIndex, 1));
        setView('days');
        setAnimationClass('animate-zoom-in');
    };

    const handleYearSelect = (year) => {
        setDisplayDate(new Date(year, displayDate.getMonth(), 1));
        setView('months');
        setAnimationClass('animate-zoom-in');
    };

    const changeMonth = (offset) => {
        setAnimationClass(offset > 0 ? 'animate-slide-in-right' : 'animate-slide-in-left');
        setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };
    
    const changeYearBlock = (offset) => {
        setAnimationClass(offset > 0 ? 'animate-slide-in-right' : 'animate-slide-in-left');
        setDisplayDate(prev => new Date(prev.getFullYear() + (offset * 12), 0, 1));
    };

    const handleHeaderClick = () => {
        if (view === 'days') setView('months');
        if (view === 'months') setView('years');
        setAnimationClass('animate-zoom-out');
    };
    
    const handleTodayClick = () => {
        const today = new Date();
        onChange(today.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const handleClearClick = () => {
        onChange(null);
        setIsOpen(false);
    };

    // --- Render Logic for Different Views ---

    const renderDayView = () => {
        const today = new Date();
        const selectedDate = value ? new Date(value) : null;

        return (
            <div className={animationClass}>
                <div className="grid grid-cols-7 gap-1 text-center text-sm text-on-surface-variant">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="font-bold w-9 h-9 flex items-center justify-center">{day}</div>)}
                    {calendarGrid.paddingDays.map((_, i) => <div key={`pad-${i}`}></div>)}
                    {calendarGrid.days.map(day => {
                        const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === calendarGrid.month && selectedDate.getFullYear() === calendarGrid.year;
                        const isToday = today.getDate() === day && today.getMonth() === calendarGrid.month && today.getFullYear() === calendarGrid.year;
                        return (
                            <button
                                key={day}
                                onClick={() => handleDateSelect(day)}
                                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150 ${
                                    isSelected ? 'bg-primary text-on-primary font-bold' : 
                                    isToday ? 'border-2 border-primary text-primary' : 'hover:bg-surface-container-highest'
                                }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return (
            <div className={`grid grid-cols-3 gap-2 ${animationClass}`}>
                {months.map((month, index) => (
                    <button
                        key={month}
                        onClick={() => handleMonthSelect(index)}
                        className="p-3 rounded-lg text-center hover:bg-surface-container-highest transition-colors"
                    >
                        {month}
                    </button>
                ))}
            </div>
        );
    };

    const renderYearView = () => {
        const currentYear = displayDate.getFullYear();
        const startYear = Math.floor(currentYear / 12) * 12;
        const years = Array.from({ length: 12 }, (_, i) => startYear + i);
        return (
            <div className={`grid grid-cols-3 gap-2 ${animationClass}`}>
                {years.map(year => (
                    <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={`p-3 rounded-lg text-center hover:bg-surface-container-highest transition-colors ${year === currentYear ? 'font-bold text-primary' : ''}`}
                    >
                        {year}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="relative">
            <label htmlFor={id} className="block font-medium mb-1.5 text-on-surface-variant">{label}</label>
            <button
                ref={buttonRef}
                id={id}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                className="relative w-full text-left input-field rounded-xl flex justify-between items-center px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
                <div className="flex items-center gap-3">
                    <icons.CalendarIcon className="text-on-surface-variant" />
                    <span className="text-on-surface">{formatDate(value)}</span>
                </div>
                <icons.ChevronDownIcon isOpen={isOpen} className="text-on-surface-variant" />
            </button>

            {isOpen && ReactDOM.createPortal(
                <div
                    ref={popupRef}
                    role="dialog"
                    style={popupStyle}
                    className="fixed z-50 bg-surface-container-high border-glass glass-effect shadow-glass rounded-xl p-4 flex flex-col"
                >
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => view === 'years' ? changeYearBlock(-1) : changeMonth(-1)} className="p-2 rounded-full hover:bg-surface-container-highest"><icons.ChevronLeftIcon /></button>
                        <button onClick={handleHeaderClick} className="font-bold text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg">
                            {view === 'days' && displayDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            {view === 'months' && displayDate.getFullYear()}
                            {view === 'years' && `${Math.floor(displayDate.getFullYear() / 12) * 12} - ${Math.floor(displayDate.getFullYear() / 12) * 12 + 11}`}
                        </button>
                        <button onClick={() => view === 'years' ? changeYearBlock(1) : changeMonth(1)} className="p-2 rounded-full hover:bg-surface-container-highest"><icons.ChevronRightIcon /></button>
                    </div>
                    
                    <div className="flex-grow">
                        {view === 'days' && renderDayView()}
                        {view === 'months' && renderMonthView()}
                        {view === 'years' && renderYearView()}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-outline-variant">
                        <button onClick={handleClearClick} className="px-4 py-2 font-semibold text-on-surface-variant hover:bg-surface-container-highest rounded-md">Clear</button>
                        <button onClick={handleTodayClick} className="px-4 py-2 font-semibold text-primary hover:bg-primary-container/50 rounded-md">Today</button>
                    </div>
                </div>,
                document.getElementById('portal-root')
            )}
        </div>
    );
};

export default CustomDatePicker;