import React, { useLayoutEffect, useRef, useState } from 'react';

const SettingsModal = ({ isOpen, onClose, themes, themeName, setThemeName, layoutDensity, setLayoutDensity, fontSize, setFontSize, handleInteractiveClick }) => {
    const [layoutDensitySliderStyle, setLayoutDensitySliderStyle] = useState({});
    const [fontSizeSliderStyle, setFontSizeSliderStyle] = useState({});

    const layoutContainerRef = useRef(null);
    const comfortableBtnRef = useRef(null);
    const compactBtnRef = useRef(null);

    const fontContainerRef = useRef(null);
    const smallBtnRef = useRef(null);
    const baseBtnRef = useRef(null);
    const largeBtnRef = useRef(null);

    useLayoutEffect(() => {
        if (!isOpen) return;

        const updateStyles = () => {
            const activeLayoutBtn = layoutDensity === 'comfortable' ? comfortableBtnRef.current : compactBtnRef.current;
            if (activeLayoutBtn) {
                setLayoutDensitySliderStyle({
                    left: `${activeLayoutBtn.offsetLeft}px`,
                    width: `${activeLayoutBtn.offsetWidth}px`,
                });
            }

            let activeFontBtn;
            if (fontSize === 'sm') activeFontBtn = smallBtnRef.current;
            else if (fontSize === 'lg') activeFontBtn = largeBtnRef.current;
            else activeFontBtn = baseBtnRef.current;

            if (activeFontBtn) {
                setFontSizeSliderStyle({
                    left: `${activeFontBtn.offsetLeft}px`,
                    width: `${activeFontBtn.offsetWidth}px`,
                });
            }
        };

        // Delay to ensure elements are rendered and positioned correctly before measuring
        const timer = setTimeout(updateStyles, 50);

        const observer = new ResizeObserver(updateStyles);
        if (layoutContainerRef.current) observer.observe(layoutContainerRef.current);
        if (fontContainerRef.current) observer.observe(fontContainerRef.current);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };

    }, [isOpen, layoutDensity, fontSize]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="rounded-2xl shadow-glass w-full max-w-md bg-surface-container-high flex flex-col glass-effect border-glass" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
                <h2 className="text-[1.75em] font-bold p-6 pb-4 text-on-surface font-display flex-shrink-0">Settings</h2>
                <div className="overflow-y-auto px-6 pb-6 space-y-6">
                    <div>
                        <label className="block font-medium mb-3 text-on-surface-variant">Color Theme</label>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.keys(themes).map(name => (
                                <button
                                    key={name}
                                    onClick={handleInteractiveClick(() => setThemeName(name))}
                                    className={`flex items-center gap-3 p-2 rounded-xl text-left transition-all ${themeName === name ? 'ring-2 ring-primary' : 'ring-1 ring-outline'}`}
                                    aria-label={`Select ${name} theme`}
                                    aria-pressed={themeName === name}
                                >
                                    <div className="w-8 h-8 rounded-md flex-shrink-0" style={{ backgroundColor: themes[name].light.primary }}></div>
                                    <span className="font-semibold text-on-surface">{name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-outline-variant pt-4 space-y-4">
                        <h3 className="text-lg font-semibold text-on-surface-variant">Display & Layout</h3>
                        <div>
                            <label className="block font-medium mb-2 text-on-surface-variant">Layout Density</label>
                            <div ref={layoutContainerRef} className="relative flex rounded-full p-1 bg-surface-container-high border border-outline-variant shadow-inner">
                                <div className="absolute top-1 bottom-1 bg-primary rounded-full shadow-md transition-all duration-500" style={{ ...layoutDensitySliderStyle, transitionTimingFunction: 'var(--ease-spring)' }}></div>
                                <button ref={comfortableBtnRef} onClick={handleInteractiveClick(() => setLayoutDensity('comfortable'))} className={`relative w-full py-1.5 font-semibold rounded-full transition-colors ${layoutDensity === 'comfortable' ? 'text-on-primary' : 'text-on-surface-variant'}`} aria-pressed={layoutDensity === 'comfortable'}>Comfortable</button>
                                <button ref={compactBtnRef} onClick={handleInteractiveClick(() => setLayoutDensity('compact'))} className={`relative w-full py-1.5 font-semibold rounded-full transition-colors ${layoutDensity === 'compact' ? 'text-on-primary' : 'text-on-surface-variant'}`} aria-pressed={layoutDensity === 'compact'}>Compact</button>
                            </div>
                        </div>
                        <div>
                            <label className="block font-medium mb-2 text-on-surface-variant">Font Size</label>
                            <div ref={fontContainerRef} className="relative flex rounded-full p-1 bg-surface-container-high border border-outline-variant shadow-inner">
                                <div className="absolute top-1 bottom-1 bg-primary rounded-full shadow-md transition-all duration-500" style={{ ...fontSizeSliderStyle, transitionTimingFunction: 'var(--ease-spring)' }}></div>
                                <button ref={smallBtnRef} onClick={handleInteractiveClick(() => setFontSize('sm'))} className={`relative w-full py-1.5 font-semibold rounded-full transition-colors ${fontSize === 'sm' ? 'text-on-primary' : 'text-on-surface-variant'}`} aria-pressed={fontSize === 'sm'}>Small</button>
                                <button ref={baseBtnRef} onClick={handleInteractiveClick(() => setFontSize('base'))} className={`relative w-full py-1.5 font-semibold rounded-full transition-colors ${fontSize === 'base' ? 'text-on-primary' : 'text-on-surface-variant'}`} aria-pressed={fontSize === 'base'}>Default</button>
                                <button ref={largeBtnRef} onClick={handleInteractiveClick(() => setFontSize('lg'))} className={`relative w-full py-1.5 font-semibold rounded-full transition-colors ${fontSize === 'lg' ? 'text-on-primary' : 'text-on-surface-variant'}`} aria-pressed={fontSize === 'lg'}>Large</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 pt-4 mt-auto flex-shrink-0 border-t border-outline-variant">
                    <button onClick={handleInteractiveClick(onClose)} className="w-full py-2.5 font-bold rounded-full bg-primary text-on-primary shadow-md hover:opacity-90 transition-opacity active:scale-95">Done</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;