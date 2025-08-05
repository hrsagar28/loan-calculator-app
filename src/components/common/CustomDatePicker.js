import React, { useState, useRef, useCallback, useLayoutEffect, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { icons } from '../../constants/icons';

// --- Helper Functions ---

/**
 * Generates the full 42-day grid for the calendar view.
 * Includes days from the previous, current, and next months.
 * @param {Date} displayDate - The date for which to generate the calendar month.
 * @returns {object} An object containing arrays for previous, current, and next month days, and the current year/month.
 */
const generateCalendarGrid = (displayDate) => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();

    const prevMonthDays = [];
    // Get the last few days of the previous month to fill the grid's start
    for (let i = firstDayOfMonth; i > 0; i--) {
        prevMonthDays.push({ day: daysInPrevMonth - i + 1, isCurrentMonth: false, monthOffset: -1 });
    }

    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
        currentMonthDays.push({ day: i, isCurrentMonth: true, monthOffset: 0 });
    }

    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingCells = 42 - totalDays; // Always render 6 weeks (42 cells) for consistent height

    const nextMonthDays = [];
    for (let i = 1; i <= remainingCells; i++) {
        nextMonthDays.push({ day: i, isCurrentMonth: false, monthOffset: 1 });
    }

    return { allDays: [...prevMonthDays, ...currentMonthDays, ...nextMonthDays], year, month };
};


const CustomDatePicker = ({ label, value, onChange, id }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('days'); // 'days', 'months', 'years'
    const [displayDate, setDisplayDate] = useState(value ? new Date(value) : new Date());
    const [popupStyle, setPopupStyle] = useState({});
    const [animationClass, setAnimationClass] = useState('');
    const [yearInput, setYearInput] = useState(displayDate.getFullYear());
    const [opensUp, setOpensUp] = useState(false);

    const buttonRef = useRef(null);
    const popupRef = useRef(null);
    
    const minYear = 1901;
    const maxYear = 2099;
    
    const closePopup = useCallback(() => {
        setAnimationClass(opensUp ? 'animate-slide-out-up' : 'animate-slide-out-down');
        setTimeout(() => {
            setIsOpen(false);
        }, 200); // Duration should match animation
    }, [opensUp]);

    // --- Effects for positioning, closing, and focus management ---

    useLayoutEffect(() => {
        if (isOpen && buttonRef.current && popupRef.current) {
            // --- Positioning Logic ---
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const popupHeight = 350; // Estimated height for decision making

            let newStyle = {
                left: `${rect.left}px`,
                width: `${rect.width < 320 ? 320 : rect.width}px` // M3 recommends wider popups
            };
            
            const shouldOpenUp = spaceBelow < popupHeight && rect.top > popupHeight;
            setOpensUp(shouldOpenUp);

            if (shouldOpenUp) {
                newStyle.bottom = `${window.innerHeight - rect.top + 8}px`;
                setAnimationClass('animate-slide-in-up');
            } else {
                newStyle.top = `${rect.bottom + 8}px`;
                setAnimationClass('animate-slide-in-down');
            }
            setPopupStyle(newStyle);

            // --- Focus Management Logic ---
            const selectedButton = popupRef.current.querySelector('button[aria-selected="true"]') || popupRef.current.querySelector('button[data-day]');
            if (selectedButton) {
                selectedButton.focus();
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setDisplayDate(value ? new Date(value) : new Date());
            setView('days');
        }
    }, [isOpen, value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && buttonRef.current && !buttonRef.current.contains(event.target) && popupRef.current && !popupRef.current.contains(event.target)) {
                closePopup();
            }
        };
        const handleScroll = () => {
            if (isOpen) {
                closePopup();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen, closePopup]);
    
    // --- Date Formatting and Grid Generation ---

    const formatDate = useCallback((date) => {
        if (!date) return 'Select a date...';
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
    }, []);
    
    const calendarGrid = useMemo(() => generateCalendarGrid(displayDate), [displayDate]);

    // --- Handlers for user interaction ---

    const handleDateSelect = useCallback((day, monthOffset = 0) => {
        const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth() + monthOffset, day);
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const selectedDay = String(newDate.getDate()).padStart(2, '0');
        onChange(`${year}-${month}-${selectedDay}`);
        closePopup();
    }, [displayDate, onChange, closePopup]);

    const handleMonthSelect = useCallback((monthIndex) => {
        setDisplayDate(new Date(displayDate.getFullYear(), monthIndex, 1));
        setView('days');
        setAnimationClass('animate-zoom-in');
    }, [displayDate]);

    const handleYearSelect = useCallback((year) => {
        setDisplayDate(new Date(year, displayDate.getMonth(), 1));
        setView('months');
        setAnimationClass('animate-zoom-in');
    }, [displayDate]);

    const runAnimation = useCallback((animation) => {
        setAnimationClass('');
        setTimeout(() => {
            setAnimationClass(animation);
        }, 10);
    }, []);

    const changeMonth = useCallback((offset) => {
        runAnimation(offset > 0 ? 'animate-slide-in-right' : 'animate-slide-in-left');
        setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    }, [runAnimation]);
    
    const changeYear = useCallback((offset) => {
        runAnimation(offset > 0 ? 'animate-slide-in-right' : 'animate-slide-in-left');
        setDisplayDate(prev => new Date(prev.getFullYear() + offset, prev.getMonth(), 1));
    }, [runAnimation]);

    const changeYearBlock = useCallback((offset) => {
        runAnimation(offset > 0 ? 'animate-slide-in-right' : 'animate-slide-in-left');
        setDisplayDate(prev => new Date(prev.getFullYear() + (offset * 12), 0, 1));
    }, [runAnimation]);

    const handleHeaderClick = useCallback(() => {
        if (view === 'days') setView('months');
        if (view === 'months') {
            setYearInput(displayDate.getFullYear());
            setView('years');
        }
        setAnimationClass('animate-zoom-out');
    }, [view, displayDate]);
    
    const handleTodayClick = useCallback(() => {
        const today = new Date();
        // Check if the calendar is already displaying the current month and year
        if (
          displayDate.getFullYear() === today.getFullYear() &&
          displayDate.getMonth() === today.getMonth() &&
          view === 'days'
        ) {
          // If already on the correct month, just focus the button as a visual cue
          const todayButton = popupRef.current?.querySelector('button[data-istoday="true"]');
          todayButton?.focus();
          return;
        }
    
        // If not on the current month, navigate to it without selecting the date
        setDisplayDate(today);
        setView('days');
        runAnimation('animate-zoom-in');
    }, [displayDate, view, runAnimation]);

    const handleClearClick = useCallback(() => {
        onChange(null);
        closePopup();
    }, [onChange, closePopup]);
    
    const handlePrevClick = useCallback(() => {
        if (view === 'days') changeMonth(-1);
        else if (view === 'months') changeYear(-1);
        else if (view === 'years') changeYearBlock(-1);
    }, [view, changeMonth, changeYear, changeYearBlock]);

    const handleNextClick = useCallback(() => {
        if (view === 'days') changeMonth(1);
        else if (view === 'months') changeYear(1);
        else if (view === 'years') changeYearBlock(1);
    }, [view, changeMonth, changeYear, changeYearBlock]);

    // --- Render Logic for Different Views ---

    const renderDayView = () => {
        const today = new Date();
        const selectedDate = value ? new Date(value) : null;
        
        if (selectedDate) {
            selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());
        }
        
        return (
            <div className={animationClass}>
                <div className="grid grid-cols-7 gap-1 text-center text-sm text-on-surface-variant">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i} className="font-bold w-10 h-10 flex items-center justify-center">{day}</div>)}
                    
                    {calendarGrid.allDays.map(({ day, isCurrentMonth, monthOffset }, index) => {
                        const currentDate = new Date(calendarGrid.year, calendarGrid.month + monthOffset, day);
                        const isSelected = selectedDate && selectedDate.getTime() === currentDate.getTime();
                        const isToday = today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
                        
                        const shapeClass = isSelected ? 'rounded-xl' : 'rounded-full';
                        const monthClass = isCurrentMonth ? 'text-on-surface' : 'text-on-surface-variant opacity-60';

                        const stylingClasses = isSelected
                            ? 'bg-primary text-on-primary font-bold border-primary'
                            : isToday
                            ? `border-primary ${monthClass}`
                            : `border-transparent hover:border-outline-variant ${monthClass}`;

                        return (
                            <button
                                key={`${monthOffset}-${day}-${index}`}
                                data-day={day}
                                data-istoday={isToday}
                                onClick={() => handleDateSelect(day, monthOffset)}
                                aria-selected={isSelected}
                                className={`w-10 h-10 flex items-center justify-center transition-all duration-150 border-2 ${shapeClass} ${stylingClasses}`}
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
                        className="p-3 rounded-lg text-center text-on-surface hover:bg-surface-container-highest transition-colors"
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
             <div className={`flex flex-col ${animationClass}`}>
                <input
                    type="number"
                    value={yearInput}
                    onChange={(e) => {
                        const newYear = e.target.value;
                        if (/^\d{0,4}$/.test(newYear)) {
                            setYearInput(newYear);
                        }
                    }}
                    onBlur={() => {
                        let year = parseInt(yearInput, 10);
                        if (isNaN(year) || year < minYear || year > maxYear) {
                            year = displayDate.getFullYear();
                        }
                        setYearInput(year);
                        handleYearSelect(year);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.target.blur();
                        }
                    }}
                    className="w-full text-center p-2 mb-3 bg-surface-container text-on-surface rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary"
                    aria-label="Enter year"
                />
                <div className="grid grid-cols-3 gap-2">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => handleYearSelect(year)}
                            disabled={year < minYear || year > maxYear}
                            className={`p-3 rounded-lg text-center text-on-surface hover:bg-surface-container-highest transition-colors ${year === currentYear ? 'font-bold text-primary' : ''} disabled:opacity-25 disabled:cursor-not-allowed`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
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
                    className={`fixed z-50 bg-surface-container-high border-glass glass-effect shadow-glass rounded-2xl p-4 flex flex-col ${animationClass}`}
                >
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={handlePrevClick} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed"><icons.ChevronLeftIcon /></button>
                        <button onClick={handleHeaderClick} className="font-bold text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg">
                            {view === 'days' && displayDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            {view === 'months' && displayDate.getFullYear()}
                            {view === 'years' && `${Math.floor(displayDate.getFullYear() / 12) * 12} - ${Math.floor(displayDate.getFullYear() / 12) * 12 + 11}`}
                        </button>
                        <button onClick={handleNextClick} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed"><icons.ChevronRightIcon /></button>
                    </div>
                    
                    <div className="flex-grow">
                        {view === 'days' && renderDayView()}
                        {view === 'months' && renderMonthView()}
                        {view === 'years' && renderYearView()}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-outline-variant">
                        <button onClick={handleClearClick} className="px-4 py-2 font-semibold text-on-surface-variant hover:bg-surface-container-highest rounded-full">Clear</button>
                        <button onClick={handleTodayClick} className="px-4 py-2 font-semibold bg-primary text-on-primary rounded-full">Today</button>
                    </div>
                </div>,
                document.getElementById('portal-root')
            )}
        </div>
    );
};

export default CustomDatePicker;
