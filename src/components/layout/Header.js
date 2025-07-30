import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { icons } from '../../constants/icons';
import Tooltip from '../common/Tooltip';

const AnimatedIcon = ({ isToggled, OnIcon, OffIcon }) => (
    <div className={`transition-transform duration-500 ease-expressive ${isToggled ? 'rotate-180' : ''}`}>
        {isToggled ? <OnIcon /> : <OffIcon />}
    </div>
);

// MODIFIED: Simplified Header component
const Header = ({
    appMode, setAppMode, isDarkMode, setIsDarkMode,
    setIsSettingsOpen, handleReset
}) => {
    const appModeSwitchContainerRef = useRef(null);
    const calculatorModeButtonRef = useRef(null);
    const affordabilityModeButtonRef = useRef(null);
    const [appModeSliderStyle, setAppModeSliderStyle] = useState({});
    const [headerVisible, setHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const handleInteractiveClick = (callback) => (...args) => {
        if (navigator.vibrate) navigator.vibrate(20);
        if (callback) callback(...args);
    };

    useLayoutEffect(() => {
        const updateSliderPosition = () => {
            const activeButton = appMode === 'calculator'
                ? calculatorModeButtonRef.current
                : affordabilityModeButtonRef.current;

            if (activeButton) {
                setAppModeSliderStyle({
                    left: `${activeButton.offsetLeft}px`,
                    width: `${activeButton.offsetWidth}px`,
                });
            }
        };

        updateSliderPosition();

        const observer = new ResizeObserver(updateSliderPosition);
        const container = appModeSwitchContainerRef.current;
        if (container) observer.observe(container);
        
        return () => {
            if (container) observer.unobserve(container);
        };
    }, [appMode]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setHeaderVisible(false);
            } else {
                setHeaderVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <header className={`sticky top-0 z-30 p-2 md:p-4 -mx-4 mb-4 no-print transition-transform duration-300 ease-in-out ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="max-w-8xl mx-auto p-3 lg:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-x-4 gap-y-3 bg-surface/80 border-glass glass-effect shadow-glass">
                
                {/* NEW: Centered Title and Logo */}
                <div className="flex-1 flex justify-center items-center flex-col">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary text-on-primary shadow-md">
                        <icons.LoanLogo className="w-8 h-8" />
                    </div>
                    <h1 className="text-[1.8em] md:text-[2.2em] font-bold text-primary font-display leading-tight mt-1">
                        Loan Advisory Tool
                    </h1>
                </div>

                <div className="w-full lg:w-auto order-last lg:order-none flex justify-center">
                    <div ref={appModeSwitchContainerRef} className="relative flex rounded-full p-1 bg-surface-container-high border border-outline-variant shadow-inner">
                        <div className="absolute top-1 bottom-1 bg-primary rounded-full shadow-md transition-all duration-500" style={{ ...appModeSliderStyle, transitionTimingFunction: 'var(--ease-spring)' }}></div>
                        <button ref={calculatorModeButtonRef} onClick={handleInteractiveClick(() => { setAppMode('calculator'); })} className={`relative px-4 py-1.5 font-semibold rounded-full transition-colors ${appMode === 'calculator' ? 'text-on-primary' : 'text-on-surface-variant'}`}>Loan Calculator</button>
                        <button ref={affordabilityModeButtonRef} onClick={handleInteractiveClick(() => { setAppMode('affordability'); })} className={`relative px-4 py-1.5 font-semibold rounded-full transition-colors ${appMode === 'affordability' ? 'text-on-primary' : 'text-on-surface-variant'}`}>Affordability</button>
                    </div>
                </div>
                
                <div className="flex-1 flex justify-end items-center gap-1 md:gap-2 text-on-surface-variant">
                    <Tooltip text="Reset Data"><button aria-label="Reset Data" onClick={handleInteractiveClick(handleReset)} className="p-2 rounded-full hover:bg-surface-container-high transition-colors"><icons.RotateCcw className="w-5 h-5 md:w-6 md:h-6" /></button></Tooltip>
                    <Tooltip text="Settings"><button aria-label="Settings" onClick={handleInteractiveClick(() => setIsSettingsOpen(true))} className="p-2 rounded-full hover:bg-surface-container-high transition-colors"><icons.Settings className="w-5 h-5 md:w-6 md:h-6" /></button></Tooltip>
                    <Tooltip text={isDarkMode ? "Light Mode" : "Dark Mode"}><button aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} onClick={handleInteractiveClick(() => setIsDarkMode(!isDarkMode))} className="p-2 rounded-full hover:bg-surface-container-high transition-colors"><AnimatedIcon isToggled={isDarkMode} OnIcon={() => <icons.Sun className="w-5 h-5 md:w-6 md:h-6" />} OffIcon={() => <icons.Moon className="w-5 h-5 md:w-6 md:h-6" />} /></button></Tooltip>
                </div>
            </div>
        </header>
    );
};

export default Header;