import React from 'react';
import { icons } from '../../constants/icons';
import { formatInputValue } from '../../utils/formatters';

export const PrepaymentSimulator = ({ prepayments, setPrepayments, formatCurrency }) => {

    const handleInteractiveClick = (callback) => (...args) => {
        if (navigator.vibrate) navigator.vibrate(20);
        if (callback) callback(...args);
    };

    const addPrepayment = () => {
        setPrepayments([...prepayments, { amount: '', month: '' }]);
    };

    const updatePrepayment = (i, field, value) => {
        const newPrepayments = [...prepayments];
        newPrepayments[i][field] = value;
        setPrepayments(newPrepayments);
    };

    const removePrepayment = (i) => {
        setPrepayments(prepayments.filter((_, idx) => i !== idx));
    };


    return (
        <div className="pt-4 border-t border-outline-variant mt-8 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-[1.25em] font-semibold text-on-surface font-display">Prepayment Simulator</h3>
                <button onClick={handleInteractiveClick(addPrepayment)} aria-label="Add Prepayment" className="flex items-center gap-1 px-3 py-1.5 font-semibold rounded-full bg-primary-container text-on-primary-container hover:opacity-90 transition-opacity active:scale-95">
                    <icons.Add width="16" height="16" />
                    <span>Add</span>
                </button>
            </div>
            <div className="space-y-3 overflow-y-auto p-1 -m-1 flex-grow max-h-[14rem]">
                {prepayments.length === 0 && (
                    <div className="p-3 flex items-start gap-3 bg-tertiary-container text-on-tertiary-container rounded-xl">
                        <icons.Lightbulb className="w-8 h-8 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold font-display">Smart Tip</h4>
                            <p>Add prepayments to see how much you can save on interest and reduce your loan tenure.</p>
                        </div>
                    </div>
                )}
                {prepayments.map((p, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                            <div className="relative input-field rounded-xl">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-on-surface-variant font-sans text-lg">₹</span>
                                </div>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    aria-label={`Prepayment amount for entry ${i + 1}`}
                                    placeholder="Amount"
                                    value={formatInputValue(p.amount)}
                                    onChange={e => {
                                        const rawValue = e.target.value.replace(/,/g, '');
                                        if (/^\d*$/.test(rawValue)) {
                                            updatePrepayment(i, 'amount', rawValue);
                                        }
                                    }}
                                    className="w-full pl-10 pr-2 py-2.5 bg-transparent border-none rounded-xl focus:ring-0 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="col-span-5">
                            <div className="relative input-field rounded-xl">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <icons.Calendar className="text-on-surface-variant" />
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    aria-label={`Prepayment month for entry ${i + 1}`}
                                    placeholder="Month"
                                    value={p.month}
                                    onChange={e => {
                                        if (/^\d*$/.test(e.target.value)) {
                                            updatePrepayment(i, 'month', e.target.value);
                                        }
                                    }}
                                    className="w-full pl-10 pr-2 py-2.5 bg-transparent border-none rounded-xl focus:ring-0 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="col-span-2 text-center">
                            <button onClick={handleInteractiveClick(() => removePrepayment(i))} aria-label={`Remove prepayment entry ${i + 1}`} className="group p-2.5 rounded-full text-error hover:bg-error-container/20 transition-colors duration-300">
                                <icons.Trash className="transition-transform duration-300 group-hover:scale-110" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const PrepaymentSavings = ({ results, formatCurrency }) => {
    if (!results || (results.interestSaved <= 0 && results.tenureReduced <= 0)) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto pt-4">
            {results.interestSaved > 0 && (
                <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-3">
                    <p className="text-green-800 dark:text-green-300">Interest Saved</p>
                    <p className="font-bold text-green-700 dark:text-green-200">{formatCurrency(results.interestSaved)}</p>
                </div>
            )}
            {results.tenureReduced > 0 && (
                <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-3">
                    <p className="text-green-800 dark:text-green-300">Tenure Reduced By</p>
                    <p className="font-bold text-green-700 dark:text-green-200">{results.tenureReduced} months</p>
                </div>
            )}
        </div>
    );
};
