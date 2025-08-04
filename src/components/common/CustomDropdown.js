import React, { useState, useRef, useEffect } from 'react';
import { icons } from '../../constants/icons';

const CustomDropdown = ({ options, value, onChange, id, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Effect to handle closing the dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name: id, value: optionValue } }); // Mimic event object for compatibility
        setIsOpen(false);
    };

    const selectedOption = options.find(option => option.value === value);

    return (
        <div ref={dropdownRef} className="relative">
            <label htmlFor={id} className="block font-medium mb-1.5 text-on-surface-variant">{label}</label>
            <button
                id={id}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className="relative w-full text-left input-field rounded-xl flex justify-between items-center px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
                <span className="text-on-surface">{selectedOption ? selectedOption.label : 'Select...'}</span>
                <icons.ChevronDownIcon isOpen={isOpen} className="text-on-surface-variant" />
            </button>
            
            {isOpen && (
                <ul
                    role="listbox"
                    aria-labelledby={id}
                    className="absolute z-10 w-full mt-2 bg-surface-container-high border-glass glass-effect shadow-glass rounded-xl py-2 animate-cascade-in max-h-60 overflow-y-auto table-scrollbar"
                >
                    {options.map((option) => (
                        <li
                            key={option.value}
                            role="option"
                            aria-selected={value === option.value}
                            onClick={() => handleSelect(option.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleSelect(option.value);
                                }
                            }}
                            tabIndex="0"
                            className={`px-4 py-2 cursor-pointer text-on-surface hover:bg-primary-container/50 focus:bg-primary-container/50 focus:outline-none ${value === option.value ? 'font-bold bg-primary-container' : ''}`}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomDropdown;