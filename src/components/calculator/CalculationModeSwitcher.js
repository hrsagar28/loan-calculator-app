import React, { useRef, useLayoutEffect, useState } from 'react';

const CalculationModeSwitcher = ({ calculationMode, setCalculationMode }) => {
    const [sliderIndicatorStyle, setSliderIndicatorStyle] = useState({});
    const calcModeSwitchContainerRef = useRef(null);
    const rateButtonRef = useRef(null);
    const emiButtonRef = useRef(null);
    const tenureButtonRef = useRef(null);

    const handleInteractiveClick = (callback) => (...args) => {
        if (navigator.vibrate) navigator.vibrate(20);
        if (callback) callback(...args);
    };

    useLayoutEffect(() => {
        const updateSliderPosition = () => {
            let activeButton;
            if (calculationMode === 'rate') activeButton = rateButtonRef.current;
            else if (calculationMode === 'emi') activeButton = emiButtonRef.current;
            else activeButton = tenureButtonRef.current;

            if (activeButton) {
                setSliderIndicatorStyle({
                    left: `${activeButton.offsetLeft}px`,
                    width: `${activeButton.offsetWidth}px`,
                });
            }
        };

        updateSliderPosition();
        const observer = new ResizeObserver(updateSliderPosition);
        const container = calcModeSwitchContainerRef.current;
        if (container) observer.observe(container);

        return () => {
            if (container) observer.unobserve(container);
        };
    }, [calculationMode]);

    return (
        <div className="mb-6">
            <h2 className="text-[1.25em] font-semibold text-on-surface font-display mb-3 text-center md:text-left">Calculate by:</h2>
            <div ref={calcModeSwitchContainerRef} className="relative flex rounded-full p-1 bg-surface-container-high border border-outline-variant shadow-inner">
                <div className="absolute top-1 bottom-1 bg-primary rounded-full shadow-md transition-all duration-500" style={{ ...sliderIndicatorStyle, transitionTimingFunction: 'var(--ease-spring)' }}></div>
                {[{ id: 'rate', label: 'Rate' }, { id: 'emi', label: 'EMI' }, { id: 'tenure', label: 'Tenure' }].map(mode => (
                    <button
                        key={mode.id}
                        ref={mode.id === 'rate' ? rateButtonRef : mode.id === 'emi' ? emiButtonRef : tenureButtonRef}
                        onClick={handleInteractiveClick(() => {
                            setCalculationMode(mode.id);
                            // setFormErrors({}); // This state is in App.js, so we'll pass a handler or manage it there
                        })}
                        className={`relative w-full py-2 font-bold rounded-full transition-colors duration-300 ${calculationMode === mode.id ? 'text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CalculationModeSwitcher;
