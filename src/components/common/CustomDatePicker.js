import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { icons } from '../../constants/icons';

const CustomDatePicker = ({ label, value, onChange, id }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
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
    
    const closePopup = () => {
        setIsClosing(true);
        setAnimationClass(opensUp ? 'animate-slide-out-up' : 'animate-slide-out-down');
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 200); // Duration should match animation
    };

    // --- Effects for positioning, closing, and focus management ---

    useLayoutEffect(() => {
        if (isOpen && buttonRef.current && popupRef.current) {
            // --- Positioning Logic ---
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const popupHeight = 350; // Estimated height for decision making

            let newStyle = {
                left: `${rect.left}px`,
                width: `${rect.width < 288 ? 288 : rect.width}px`
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
        } else if (!isOpen && document.activeElement !== buttonRef.current) {
            buttonRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !isClosing && buttonRef.current && !buttonRef.current.contains(event.target) && popupRef.current && !popupRef.current.contains(event.target)) {
                closePopup();
            }
        };
        const handleScroll = () => {
            if (isOpen && !isClosing) {
                closePopup();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen, isClosing, opensUp]);
    
    // --- Date Formatting and Grid Generation ---

    const formatDate = (date) => {
        if (!date) return 'Select a date...';
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
    };
    
    const calendarGrid = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const paddingDays = Array.from({ length: firstDayOfMonth });
        
        const totalCells = paddingDays.length + days.length;
        const remainingCells = 42 - totalCells;
        const trailingPaddingDays = Array.from({ length: remainingCells > 0 ? remainingCells : 0 });

        return { days, paddingDays, trailingPaddingDays, year, month };
    }, [displayDate]);

    // --- Handlers for user interaction ---

    const handleDateSelect = (day) => {
        const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const selectedDay = String(day).padStart(2, '0');
        onChange(`${year}-${month}-${selectedDay}`);
        closePopup();
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

    const runAnimation = (animation) => {
        setAnimationClass('');
        setTimeout(() => {
            setAnimationClass(animation);
        }, 10);
    };

    const changeMonth = (offset) => {
        runAnimation(offset > 0 ? 'animate-slide-in-right' : 'animate-slide-in-left');
        setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };
    
    const changeYear = (offset) => {
        runAnimation(offset > 0 ? 'animate-slide-in-right' : 'animate-slide-in-left');
        setDisplayDate(prev => new Date(prev.getFullYear() + offset, prev.getMonth(), 1));
    };

    const changeYearBlock = (offset) => {
        runAnimation(offset > 0 ? 'animate-slide-in-right' : 'animate-slide-in-left');
        setDisplayDate(prev => new Date(prev.getFullYear() + (offset * 12), 0, 1));
    };

    const handleHeaderClick = () => {
        if (view === 'days') setView('months');
        if (view === 'months') {
            setYearInput(displayDate.getFullYear());
            setView('years');
        }
        setAnimationClass('animate-zoom-out');
    };
    
    const handleTodayClick = () => {
        setDisplayDate(new Date());
        setView('days');
        setAnimationClass('animate-zoom-in');
    };

    const handleClearClick = () => {
        onChange(null);
        closePopup();
    };

    const handleDayKeyDown = (e, day) => {
        e.preventDefault();
        const { key } = e;
        let newDay = day;
    
        if (key === 'ArrowRight') newDay++;
        else if (key === 'ArrowLeft') newDay--;
        else if (key === 'ArrowDown') newDay += 7;
        else if (key === 'ArrowUp') newDay -= 7;
        else if (key === 'Enter' || key === ' ') {
            handleDateSelect(day);
            return;
        } else {
            return;
        }
    
        if (newDay > 0 && newDay <= calendarGrid.days.length) {
            const newDayButton = popupRef.current.querySelector(`[data-day='${newDay}']`);
            if (newDayButton) {
                newDayButton.focus();
            }
        }
    };

    const handleYearInputChange = (e) => {
        const newYear = e.target.value;
        if (/^\d{0,4}$/.test(newYear)) {
            setYearInput(newYear);
        }
    };
    
    const handleYearInputBlur = () => {
        let year = parseInt(yearInput, 10);
        if (isNaN(year) || year < minYear || year > maxYear) {
            year = displayDate.getFullYear();
        }
        setYearInput(year);
        handleYearSelect(year);
    };
    
    const handlePrevClick = () => {
        if (view === 'days') changeMonth(-1);
        else if (view === 'months') changeYear(-1);
        else if (view === 'years') changeYearBlock(-1);
    };

    const handleNextClick = () => {
        if (view === 'days') changeMonth(1);
        else if (view === 'months') changeYear(1);
        else if (view === 'years') changeYearBlock(1);
    };

    // --- Render Logic for Different Views ---

    const renderDayView = () => {
        const today = new Date();
        const selectedDate = value ? new Date(value) : null;

        return (
            <div className={animationClass}>
                <div className="grid grid-cols-7 gap-1 text-center text-sm text-on-surface-variant">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="font-bold w-9 h-9 flex items-center justify-center">{day}</div>)}
                    
                    {calendarGrid.paddingDays.map((_, i) => <div key={`pad-${i}`} className="w-9 h-9"></div>)}

                    {calendarGrid.days.map(day => {
                        const isSelected = selectedDate && selectedDate.getUTCDate() === day && selectedDate.getUTCMonth() === calendarGrid.month && selectedDate.getUTCFullYear() === calendarGrid.year;
                        const isToday = today.getDate() === day && today.getMonth() === calendarGrid.month && today.getFullYear() === calendarGrid.year;
                        // MODIFICATION START: Conditional shape based on isSelected
                        const shapeClass = isSelected ? 'rounded-lg' : 'rounded-full';
                        // MODIFICATION END

                        return (
                            <button
                                key={day}
                                data-day={day}
                                onClick={() => handleDateSelect(day)}
                                onKeyDown={(e) => handleDayKeyDown(e, day)}
                                aria-selected={isSelected}
                                className={`w-9 h-9 flex items-center justify-center transition-all duration-150 ${shapeClass} ${
                                    isSelected ? 'bg-primary text-on-primary font-bold' : 
                                    isToday ? 'border-2 border-primary text-primary' : 'hover:bg-surface-container-highest'
                                }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                    
                    {calendarGrid.trailingPaddingDays.map((_, i) => <div key={`trail-pad-${i}`} className="w-9 h-9"></div>)}
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
             <div className={`flex flex-col ${animationClass}`}>
                <input
                    type="number"
                    value={yearInput}
                    onChange={handleYearInputChange}
                    onBlur={handleYearInputBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleYearInputBlur()}
                    className="w-full text-center p-2 mb-3 bg-surface-container rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary"
                    aria-label="Enter year"
                />
                <div className="grid grid-cols-3 gap-2">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => handleYearSelect(year)}
                            disabled={year < minYear || year > maxYear}
                            className={`p-3 rounded-lg text-center hover:bg-surface-container-highest transition-colors ${year === currentYear ? 'font-bold text-primary' : ''} disabled:opacity-25 disabled:cursor-not-allowed`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>
        );
    };
    
    const currentYearForNav = displayDate.getFullYear();
    const currentMonthForNav = displayDate.getMonth();
    const startYearForNav = Math.floor(currentYearForNav / 12) * 12;
    
    const canGoBackInYears = startYearForNav > minYear;
    const canGoForwardInYears = startYearForNav + 11 < maxYear;

    const canGoBackInMonths = currentYearForNav > minYear || (currentYearForNav === minYear && currentMonthForNav > 0);
    const canGoForwardInMonths = currentYearForNav < maxYear || (currentYearForNav === maxYear && currentMonthForNav < 11);
    
    const canGoBackInMonthsView = currentYearForNav > minYear;
    const canGoForwardInMonthsView = currentYearForNav < maxYear;

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
                    className={`fixed z-50 bg-surface-container-high border-glass glass-effect shadow-glass rounded-xl p-4 flex flex-col ${animationClass}`}
                >
                    <div className="flex justify-between items-center mb-4">
                        <button 
                            onClick={handlePrevClick} 
                            disabled={
                                (view === 'days' && !canGoBackInMonths) ||
                                (view === 'months' && !canGoBackInMonthsView) ||
                                (view === 'years' && !canGoBackInYears)
                            }
                            className="p-2 rounded-full hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <icons.ChevronLeftIcon />
                        </button>
                        <button onClick={handleHeaderClick} className="font-bold text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg">
                            {view === 'days' && displayDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            {view === 'months' && displayDate.getFullYear()}
                            {view === 'years' && `${startYearForNav} - ${startYearForNav + 11}`}
                        </button>
                        <button 
                            onClick={handleNextClick} 
                            disabled={
                                (view === 'days' && !canGoForwardInMonths) ||
                                (view === 'months' && !canGoForwardInMonthsView) ||
                                (view === 'years' && !canGoForwardInYears)
                            }
                            className="p-2 rounded-full hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <icons.ChevronRightIcon />
                        </button>
                    </div>
                    
                    <div className="flex-grow">
                        {view === 'days' && renderDayView()}
                        {view === 'months' && renderMonthView()}
                        {view === 'years' && renderYearView()}
                    </div>

                    {/* MODIFICATION START: Give "Today" a distinct, pill-shaped button style */}
                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-outline-variant">
                        <button onClick={handleClearClick} className="px-4 py-2 font-semibold text-on-surface-variant hover:bg-surface-container-highest rounded-full">Clear</button>
                        <button onClick={handleTodayClick} className="px-4 py-2 font-semibold text-primary-container bg-primary text-on-primary rounded-full">Today</button>
                    </div>
                    {/* MODIFICATION END */}
                </div>,
                document.getElementById('portal-root')
            )}
        </div>
    );
};

export default CustomDatePicker;