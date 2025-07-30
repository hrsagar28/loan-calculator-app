import React from 'react';
import { icons } from '../../constants/icons';

const IconWrapper = ({ children }) => <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{children}</div>;

const InputWithValidation = ({ id, label, value, onChange, onFocus, onBlur, error, helpText, type = "text", disabled = false, icon, unit, maxLength, inputMode = "text" }) => {
    const IconComponent = icon ? icons[icon] : null;
    const hasError = !!error;
    return (
        <div id={`anchor-${id}`}>
            <label htmlFor={id} className="block font-medium mb-1.5 text-on-surface-variant">{label}</label>
            <div className={`relative input-field rounded-xl transition-colors ${hasError ? 'border-error' : 'border-outline'}`}>
                {IconComponent && <IconWrapper><IconComponent className="text-on-surface-variant" /></IconWrapper>}
                {unit && <IconWrapper><span className="text-on-surface-variant font-sans text-xl">{unit}</span></IconWrapper>}
                <input
                    type={type}
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    disabled={disabled}
                    maxLength={maxLength}
                    inputMode={inputMode}
                    aria-invalid={hasError}
                    aria-describedby={`${id}-feedback`}
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none rounded-xl disabled:opacity-50 text-on-surface"
                />
            </div>
            <div id={`${id}-feedback`} aria-live="polite" className="text-[0.8em] mt-1.5 min-h-[1rem]">
                {hasError ? (
                    <span className="text-error">{error}</span>
                ) : helpText ? (
                    <span className="text-on-surface-variant">{helpText}</span>
                ) : null}
            </div>
        </div>
    );
};

export default InputWithValidation;
