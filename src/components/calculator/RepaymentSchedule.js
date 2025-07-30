import React, { useState } from 'react';

const ChevronDownIcon = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ease-expressive ${isOpen ? 'rotate-180' : ''}`}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const RepaymentSchedule = ({ results, isOpen, setIsOpen, formatCurrency, density, isVisible }) => {
    const [expandedYear, setExpandedYear] = useState(null);
    const [closingYear, setClosingYear] = useState(null);

    const toggleYear = (year) => {
        if (expandedYear === year) {
            setClosingYear(year);
            const timer = setTimeout(() => {
                setExpandedYear(null);
                setClosingYear(null);
            }, 400); // Corresponds to animation duration
            return () => clearTimeout(timer);
        } else {
            setExpandedYear(year);
            setClosingYear(null);
        }
    };

    const d = density; // Use density passed from props

    return (
        <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-surface border-glass shadow-glass glass-effect rounded-2xl">
                <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left text-on-surface">
                    <h3 className="text-[1.5em] md:text-[1.75em] font-semibold text-on-surface font-display">Repayment Schedule</h3>
                    <ChevronDownIcon isOpen={isOpen} />
                </button>
                <div className={`collapsible-content ${isOpen ? 'open' : ''}`}>
                    <div>
                        <div className={`max-h-[500px] overflow-y-auto table-scrollbar ${d.tableP}`}>
                            {/* Desktop Table */}
                            <table className="w-full text-on-surface-variant border-separate border-spacing-y-1 hidden md:table table-fixed">
                                <thead className="text-[0.8em] uppercase sticky top-0 z-10">
                                    <tr>
                                        <th className={`${d.tableCell} rounded-l-2xl align-bottom text-left bg-surface/80 glass-effect`}>FY / Month</th>
                                        <th className={`${d.tableCell} align-bottom text-left bg-surface/80 glass-effect`}>Date</th>
                                        <th className={`${d.tableCell} align-bottom text-right bg-surface/80 glass-effect`}>Principal</th>
                                        <th className={`${d.tableCell} align-bottom text-right bg-surface/80 glass-effect`}>Interest</th>
                                        <th className={`${d.tableCell} align-bottom text-right bg-surface/80 glass-effect`}>Prepayment</th>
                                        <th className={`${d.tableCell} text-right rounded-r-2xl align-bottom bg-surface/80 glass-effect`}>Closing Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.financialYearBreakdown.map((fy) => (
                                        <React.Fragment key={fy.year}>
<tr
    onClick={() => toggleYear(fy.year)}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleYear(fy.year); }}
    tabIndex="0"
    aria-expanded={expandedYear === fy.year}
    className="cursor-pointer font-bold transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary">
    <td className={`${d.tableCell} rounded-l-2xl text-left bg-surface-container-highest`}>
        <div className="flex items-center gap-2 text-on-surface">
            <ChevronDownIcon isOpen={expandedYear === fy.year} />
            {fy.year}
        </div>
    </td>
    <td className={`${d.tableCell} text-left bg-surface-container-highest`}>-</td>
    <td className={`${d.tableCell} text-right text-on-primary-container bg-surface-container-highest`}>{formatCurrency(fy.principal)}</td>
    <td className={`${d.tableCell} text-right text-on-tertiary-container bg-surface-container-highest`}>{formatCurrency(fy.interest)}</td>
    <td className={`${d.tableCell} text-right text-on-secondary-container bg-surface-container-highest`}>{formatCurrency(fy.totalPrepayment)}</td>
    <td className={`${d.tableCell} text-right rounded-r-2xl bg-surface-container-highest`}>{formatCurrency(fy.closingBalance)}</td>
</tr>
                                            {(expandedYear === fy.year || closingYear === fy.year) && fy.months.map((month, index) => (
                                                <tr key={month.month} className={`bg-surface ${closingYear === fy.year ? 'animate-cascade-out' : 'animate-cascade-in'}`} style={{ animationDelay: `${index * 25}ms` }}>
                                                    <td className={`${d.tableCell} pl-12 rounded-l-2xl text-left`}>{month.month}</td>
                                                    <td className={`${d.tableCell} text-left`}>{month.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                    <td className={`${d.tableCell} text-right font-semibold text-primary`}>{formatCurrency(month.principal)}</td>
                                                    <td className={`${d.tableCell} text-right font-semibold text-tertiary`}>{formatCurrency(month.interest)}</td>
                                                    <td className={`${d.tableCell} text-right font-semibold text-secondary`}>{formatCurrency(month.prepayment)}</td>
                                                    <td className={`${d.tableCell} text-right rounded-r-2xl`}>{formatCurrency(month.endingBalance)}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                            {/* Mobile View */}
                            <div className="md:hidden space-y-4">
                                {results.financialYearBreakdown.map((fy) => (
                                    <div key={fy.year}>
                                        <div
                                            onClick={() => toggleYear(fy.year)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleYear(fy.year); }}
                                            tabIndex="0"
                                            aria-expanded={expandedYear === fy.year}
                                            className="p-3 font-bold flex justify-between items-center rounded-2xl bg-surface-container-highest cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary text-on-surface">
                                            <span>{fy.year}</span>
                                            <ChevronDownIcon isOpen={expandedYear === fy.year} />
                                        </div>
                                        {(expandedYear === fy.year) && (
                                            <div className="mt-2 space-y-2">
                                                {fy.months.map((month, index) => (
                                                    <div key={month.month} className="p-3 rounded-xl bg-surface-container animate-cascade-in" style={{ animationDelay: `${index * 25}ms` }}>
                                                        <div className="flex justify-between items-center font-bold mb-2">
                                                            <span className="text-on-surface">Month {month.month}</span>
                                                            <span className="text-[0.8em] text-on-surface-variant">{month.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between"><span className="text-on-surface-variant">Principal</span> <span className="font-medium text-primary">{formatCurrency(month.principal)}</span></div>
                                                            <div className="flex justify-between"><span className="text-on-surface-variant">Interest</span> <span className="font-medium text-tertiary">{formatCurrency(month.interest)}</span></div>
                                                            {month.prepayment > 0 && <div className="flex justify-between"><span className="text-on-surface-variant">Prepayment</span> <span className="font-medium text-secondary">{formatCurrency(month.prepayment)}</span></div>}
                                                            <div className="border-t border-outline-variant my-1 pt-1 flex justify-between"><span className="text-on-surface-variant">End Balance</span> <span className="font-bold text-on-surface">{formatCurrency(month.endingBalance)}</span></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepaymentSchedule;