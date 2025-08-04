import React, { useState, useEffect, useCallback, useRef, useLayoutEffect, Suspense, lazy } from 'react';

// Hooks
import usePersistentState from './hooks/usePersistentState';
import useLoanCalculator from './hooks/useLoanCalculator';

// Eagerly load components that are visible on initial render
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ControlSidebar from './components/layout/ControlSidebar';
import DashboardView from './components/layout/DashboardView';

// Constants & Utils
import { themes } from './constants/themes';
import { icons } from './constants/icons';
import { formatInputValue, formatCurrency } from './utils/formatters';
import { generatePdf } from './utils/pdfGenerator';

// Lazy load components that are not immediately visible
const RepaymentSchedule = lazy(() => import('./components/calculator/RepaymentSchedule'));
const AffordabilityCalculator = lazy(() => import('./components/affordability/AffordabilityCalculator'));
const Snackbar = lazy(() => import('./components/common/Snackbar'));
const ConfirmationModal = lazy(() => import('./components/common/ConfirmationModal'));
const SettingsModal = lazy(() => import('./components/common/SettingsModal'));
const PrepaymentModal = lazy(() => import('./components/calculator/PrepaymentSimulator').then(module => ({ default: module.PrepaymentModal })));

// Fallback component for Suspense
const Loader = () => <div className="w-full h-full flex items-center justify-center"><p>Loading...</p></div>;


export default function App() {
    // App-level state
    const [isDarkMode, setIsDarkMode] = usePersistentState('isDarkMode', false);
    const [themeName, setThemeName] = usePersistentState('themeName', 'Crystal Graphite');
    const [layoutDensity, setLayoutDensity] = usePersistentState('layoutDensity', 'comfortable');
    const [fontSize, setFontSize] = usePersistentState('fontSize', 'base');
    const [appMode, ] = usePersistentState('appMode', 'calculator');

    // Form Inputs & State
    const [loanAmount, setLoanAmount] = usePersistentState('loanAmount', '');
    const [tenureYears, setTenureYears] = usePersistentState('tenureYears', '15');
    const [emi, setEmi] = usePersistentState('emi', '');
    const [interestRate, setInterestRate] = usePersistentState('interestRate', '');
    const [startDate, setStartDate] = usePersistentState('startDate', new Date().toISOString().split('T')[0]);
    const [emiPaymentDay, setEmiPaymentDay] = usePersistentState('emiPaymentDay', '5');
    const [clientName, setClientName] = usePersistentState('clientName', '');
    const [prepayments, setPrepayments] = usePersistentState('loanPrepayments', []);

    // UI State
    const [formErrors, ] = useState({});
    const [activeInput, setActiveInput] = useState(null);
    const [calculationMode, setCalculationMode] = useState('rate');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isPrepaymentModalOpen, setIsPrepaymentModalOpen] = useState(false);
    const [isAffordabilityModalOpen, setIsAffordabilityModalOpen] = useState(false);
    
    const [notification, setNotification] = useState({ message: '', type: 'success', id: null });
    const notificationTimeoutRef = useRef(null);
    
    const [pdfStatus, setPdfStatus] = useState('idle');
    const [areScriptsReady, setAreScriptsReady] = useState(false);
    
    const [mainView, setMainView] = useState('dashboard');
    const [mobileTab, setMobileTab] = useState('inputs');

    const [tabSliderStyle, setTabSliderStyle] = useState({});
    const mobileTabContainerRef = useRef(null);
    const inputsTabRef = useRef(null);
    const resultsTabRef = useRef(null);
    
    // Custom Hook for Calculations
    const { calculationResults, error, isLoading, performCalculation } = useLoanCalculator({
        loanAmount, tenureYears, emi, interestRate, startDate, emiPaymentDay, calculationMode, prepayments, formErrors, appMode
    });

    const showNotification = useCallback((message, type = 'success') => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }

        const newId = Date.now();
        setNotification({ message, type, id: newId });

        notificationTimeoutRef.current = setTimeout(() => {
            setNotification((currentNotification) => 
                currentNotification.id === newId ? { message: '', type: 'success', id: null } : currentNotification
            );
        }, 3000);
    }, []);

    const handleCalculate = useCallback(() => {
        performCalculation();
    }, [performCalculation]);
    
    useEffect(() => {
        if (calculationResults) {
            setMobileTab('results');
        }
    }, [calculationResults]);

    useEffect(() => {
        if (error) {
            showNotification(error, 'error');
            setMobileTab('inputs');
        }
    }, [error, showNotification]);

    useLayoutEffect(() => {
        const updateSliderPosition = () => {
            const activeButton = mobileTab === 'inputs' ? inputsTabRef.current : resultsTabRef.current;
            if (activeButton && mobileTabContainerRef.current) {
                setTabSliderStyle({
                    left: `${activeButton.offsetLeft}px`,
                    width: `${activeButton.offsetWidth}px`,
                });
            }
        };
        updateSliderPosition();
        const observer = new ResizeObserver(updateSliderPosition);
        const container = mobileTabContainerRef.current;
        if (container) {
            observer.observe(container);
        }
        return () => {
            if (container) {
                observer.unobserve(container);
            }
        };
    }, [mobileTab]);

    useEffect(() => {
        const lightTheme = themes[themeName]?.light;
        const darkTheme = themes[themeName]?.dark;
        if (!lightTheme || !darkTheme) return;
        const generateCssVars = (theme) => Object.entries(theme).map(([key, value]) => `--color-${key}: ${value};`).join('\n');
        const lightVars = generateCssVars(lightTheme);
        const darkVars = generateCssVars(darkTheme);
        let style = document.getElementById('dynamic-theme-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'dynamic-theme-styles';
            document.head.appendChild(style);
        }
        style.innerHTML = `:root { ${lightVars} } .dark { ${darkVars} }`;
    }, [themeName]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

     useEffect(() => {
        const loadScript = (src, id) => new Promise((resolve, reject) => {
            if (document.getElementById(id)) { resolve(); return; }
            const script = document.createElement('script');
            script.src = src; script.id = id; script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.body.appendChild(script);
        });
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js", "html2canvas-lib")
            .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "jspdf-lib"))
            .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js", "jspdf-autotable-lib"))
            .then(() => setAreScriptsReady(true))
            .catch(err => {
                console.error("External script loading failed:", err);
                showNotification("Failed to load PDF libraries.", "error");
            });
    }, [showNotification]);

    const handleInteractiveClick = (callback) => (...args) => {
        if (navigator.vibrate) navigator.vibrate(20);
        if (callback) callback(...args);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const rawValue = value.replace(/,/g, '');

        const stateSetters = {
            loanAmount: setLoanAmount,
            emi: setEmi,
            interestRate: setInterestRate,
        };

        if (name === 'loanAmount' || name === 'emi') {
            if (!/^\d*\.?\d*$/.test(rawValue)) return;
            stateSetters[name](rawValue);
        } else if (name === 'interestRate') {
            if (!/^[0-9.]*$/.test(value)) return;
            stateSetters[name](value);
        } else if (name === 'emiPaymentDay') {
            const day = parseInt(rawValue, 10);
            if (rawValue === '' || (day > 0 && day <= 31)) {
                setEmiPaymentDay(rawValue);
            }
        }
    };

    const handleFocus = (e) => setActiveInput(e.target.name);
    const handleBlur = (e) => setActiveInput(null);
    
    const handleReset = () => setIsResetModalOpen(true);

    const confirmReset = () => {
        setLoanAmount(''); setTenureYears('15'); setEmi(''); setInterestRate('');
        setStartDate(new Date().toISOString().split('T')[0]); setEmiPaymentDay('5');
        setClientName(''); setPrepayments([]); setMainView('dashboard'); setMobileTab('inputs');
        setIsResetModalOpen(false); showNotification('All data has been reset.');
    };

    const handleDownloadPdf = async () => {
        if (!areScriptsReady) { showNotification("PDF library is loading. Please try again.", "error"); return; }
        if (!calculationResults) { showNotification("Please calculate a loan schedule first.", "error"); return; }
        setPdfStatus('generating');
        try {
            await generatePdf(calculationResults, { loanAmount, interestRate, startDate, clientName, calculationMode }, themes[themeName]['light']);
            showNotification('PDF downloaded successfully!', 'success');
        } catch (err) {
            console.error("Failed to generate PDF:", err);
            showNotification("Could not generate PDF. Please try again.", "error");
        } finally {
            setPdfStatus('idle');
        }
    };

    const handleExportCsv = () => {
        if (!calculationResults) return;
        const headers = ["Month", "Date", "Beginning Balance", "EMI", "Principal", "Interest", "Prepayment", "Ending Balance"];
        const rows = calculationResults.monthlySchedule.map(row =>
            [row.month, row.date.toLocaleDateString('en-CA'), row.beginningBalance.toFixed(2), row.emi.toFixed(2), row.principal.toFixed(2), row.interest.toFixed(2), row.prepayment.toFixed(2), row.endingBalance.toFixed(2)].join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `amortization_schedule_${clientName.replace(/ /g, '_') || 'general'}.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        showNotification('CSV export started!');
    };

    const densityClasses = {
        comfortable: { gap: 'gap-8', p: 'p-6', summaryGap: 'gap-4', summaryP: 'p-3', tableP: 'p-4', tableCell: 'py-4 px-6' },
        compact: { gap: 'gap-4', p: 'p-4', summaryGap: 'gap-3', summaryP: 'p-2.5', tableP: 'p-2', tableCell: 'py-3 px-4' }
    };
    const d = densityClasses[layoutDensity];
    const fontSizes = { base: 'text-base', sm: 'text-sm', lg: 'text-lg' };

    const controlSidebarProps = {
      clientName, setClientName, loanAmount, handleInputChange, activeInput, formatInputValue,
      handleFocus, handleBlur, formErrors, calculationMode, setCalculationMode, tenureYears,
      setTenureYears, emi, interestRate, emiPaymentDay, startDate, setStartDate,
      onOpenPrepaymentModal: () => setIsPrepaymentModalOpen(true),
      onOpenAffordabilityModal: () => setIsAffordabilityModalOpen(true),
      prepayments, d, handleInteractiveClick
    };
    
    return (
        <div className={`min-h-screen transition-colors duration-300 bg-background text-on-background ${fontSizes[fontSize]} flex flex-col overflow-x-hidden`}>
            <Header
                isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} setIsSettingsOpen={setIsSettingsOpen}
                handleReset={handleReset} handleInteractiveClick={handleInteractiveClick}
            />

            {/* --- Mobile Layout Fix --- */}
            {/* Increased top padding to prevent overlap and added vertical margin to the switcher to center it. */}
            <div className="flex-grow flex flex-col pt-36 md:pt-40">
                <main className="flex-grow flex flex-col lg:flex-row p-2 sm:p-4 lg:p-8 pt-0 gap-6 relative">
                    <Suspense fallback={<Loader />}>
                        {isSettingsOpen && <SettingsModal
                            isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
                            themes={themes} themeName={themeName} setThemeName={setThemeName}
                            layoutDensity={layoutDensity} setLayoutDensity={setLayoutDensity}
                            fontSize={fontSize} setFontSize={setFontSize}
                            handleInteractiveClick={handleInteractiveClick}
                        />}
                        {isResetModalOpen && <ConfirmationModal
                            isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)}
                            onConfirm={confirmReset} title="Confirm Reset" handleInteractiveClick={handleInteractiveClick}
                        >
                            <p>Are you sure you want to reset all data? This will clear all your inputs, including prepayments. This action cannot be undone.</p>
                        </ConfirmationModal>}
                        {isPrepaymentModalOpen && <PrepaymentModal 
                            isOpen={isPrepaymentModalOpen} onClose={() => setIsPrepaymentModalOpen(false)}
                            prepayments={prepayments} setPrepayments={setPrepayments}
                            formatCurrency={formatCurrency} handleInteractiveClick={handleInteractiveClick}
                        />}
                        {isAffordabilityModalOpen && <AffordabilityCalculator
                            isOpen={isAffordabilityModalOpen} onClose={() => setIsAffordabilityModalOpen(false)}
                            setLoanAmount={setLoanAmount} setEmi={setEmi} setCalculationMode={setCalculationMode}
                            setTenureYears={setTenureYears}
                            showNotification={showNotification} density={d} handleInteractiveClick={handleInteractiveClick}
                        />}
                    </Suspense>
                    <div ref={mobileTabContainerRef} className="lg:hidden w-full flex-shrink-0 p-1 bg-surface-container-high rounded-full border border-outline-variant shadow-inner relative flex my-4">
                        <div className="absolute top-1 bottom-1 bg-primary rounded-full shadow-md transition-all duration-500" style={{ ...tabSliderStyle, transitionTimingFunction: 'var(--ease-spring)' }}></div>
                        <button ref={inputsTabRef} onClick={handleInteractiveClick(() => setMobileTab('inputs'))} className="relative w-1/2 py-2 font-bold rounded-full z-10 transition-colors duration-300">
                            <span className={mobileTab === 'inputs' ? 'text-on-primary' : 'text-on-surface-variant'}>Inputs</span>
                        </button>
                        <button ref={resultsTabRef} onClick={handleInteractiveClick(() => { setMobileTab('results'); handleCalculate(); })} className="relative w-1/2 py-2 font-bold rounded-full z-10 transition-colors duration-300">
                            <span className={mobileTab === 'results' ? 'text-on-primary' : 'text-on-surface-variant'}>Results</span>
                        </button>
                    </div>


                    <div className={`w-full lg:w-1/3 lg:max-w-md flex-shrink-0 ${mobileTab === 'inputs' ? 'block' : 'hidden'} lg:block`}>
                        <ControlSidebar {...controlSidebarProps} />
                    </div>
                    
                    <div className={`flex-grow min-w-0 ${mobileTab === 'results' ? 'block' : 'hidden'} lg:block`}>
                        <Suspense fallback={<Loader />}>
                            {mainView === 'dashboard' ? (
                                <DashboardView
                                    results={calculationResults} isLoading={isLoading}
                                    hasError={!!error} errorMessage={error}
                                    onShowSchedule={() => setMainView('schedule')}
                                    formatCurrency={formatCurrency} loanAmount={loanAmount}
                                    interestRate={interestRate} calculationMode={calculationMode}
                                    density={d}
                                />
                            ) : (
                                <RepaymentSchedule
                                    results={calculationResults} onBack={() => setMainView('dashboard')}
                                    formatCurrency={formatCurrency} density={d}
                                    handleExportCsv={handleExportCsv} handleDownloadPdf={handleDownloadPdf}
                                    pdfStatus={pdfStatus} areScriptsReady={areScriptsReady}
                                    handleInteractiveClick={handleInteractiveClick}
                                />
                            )}
                        </Suspense>
                    </div>
                    
                    {mobileTab === 'inputs' && (
                        <div className="fixed bottom-6 right-6 lg:hidden z-20">
                            <button 
                                onClick={handleInteractiveClick(handleCalculate)}
                                className="w-16 h-16 rounded-2xl bg-primary text-on-primary shadow-lg flex items-center justify-center transform active:scale-90 transition-transform duration-200 ease-expressive"
                            >
                                <icons.CalculatorIcon className="w-8 h-8"/>
                            </button>
                        </div>
                    )}
                </main>
                <Footer />
            </div>
            <Suspense>
               {notification.message && <Snackbar key={notification.id} message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: 'success', id: null })} />}
            </Suspense>
        </div>
    );
}
