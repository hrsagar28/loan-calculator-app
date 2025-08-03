import React, { useState, useEffect, useRef } from 'react';
import { icons } from '../../constants/icons';
import Tooltip from '../common/Tooltip';

const AnimatedIcon = ({ isToggled, OnIcon, OffIcon }) => (
    <div className={`transition-transform duration-500 ease-expressive ${isToggled ? 'rotate-180' : ''}`}>
        {isToggled ? <OnIcon /> : <OffIcon />}
    </div>
);

const Header = ({
    isDarkMode, setIsDarkMode,
    setIsSettingsOpen, handleReset, handleInteractiveClick
}) => {
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerWidth < 1024) {
                const currentScrollY = window.scrollY;
                if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                    setHeaderVisible(false);
                } else {
                    setHeaderVisible(true);
                }
                lastScrollY.current = currentScrollY;
            } else {
                setHeaderVisible(true);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    return (
        <header className={`sticky top-0 z-30 p-2 md:p-4 no-print transition-transform duration-300 ease-in-out ${headerVisible ? 'translate-y-0' : '-translate-y-full'} lg:translate-y-0`}>
            <div className="max-w-8xl mx-auto p-3 lg:p-4 rounded-2xl flex items-center justify-between bg-surface/80 border-glass glass-effect shadow-glass">
                
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary text-on-primary shadow-md">
                        <icons.LoanLogoIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-[1.8em] md:text-[2.2em] font-bold text-primary font-display leading-tight hidden sm:block">
                           Loan Advisory Tool
                        </h1>
                         <h1 className="text-[1.8em] md:text-[2.2em] font-bold text-primary font-display leading-tight sm:hidden">
                           Loan Advisor
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2 text-on-surface-variant">
                    <Tooltip text="Reset Data"><button aria-label="Reset Data" onClick={handleInteractiveClick(handleReset)} className="p-2 rounded-full hover:bg-surface-container-high transition-colors"><icons.RotateCcwIcon className="w-5 h-5 md:w-6 md:h-6" /></button></Tooltip>
                    <Tooltip text="Settings"><button aria-label="Settings" onClick={handleInteractiveClick(() => setIsSettingsOpen(true))} className="p-2 rounded-full hover:bg-surface-container-high transition-colors"><icons.SettingsIcon className="w-5 h-5 md:w-6 md:h-6" /></button></Tooltip>
                    <Tooltip text={isDarkMode ? "Light Mode" : "Dark Mode"}><button aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} onClick={handleInteractiveClick(() => setIsDarkMode(!isDarkMode))} className="p-2 rounded-full hover:bg-surface-container-high transition-colors"><AnimatedIcon isToggled={isDarkMode} OnIcon={() => <icons.SunIcon className="w-5 h-5 md:w-6 md:h-6" />} OffIcon={() => <icons.MoonIcon className="w-5 h-5 md:w-6 md:h-6" />} /></button></Tooltip>
                </div>
            </div>
        </header>
    );
};

export default Header;