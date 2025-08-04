import React from 'react';
import { icons } from '../../constants/icons';
import { formatInputValue } from '../../utils/formatters';

export const PrepaymentModal = ({ isOpen, onClose, prepayments, setPrepayments, formatCurrency, handleInteractiveClick }) => {
    if (!isOpen) return null;

    const addPrepayment = () => {
        setPrepayments([...prepayments, { amount: '', month: '', frequency: 'one-time' }]);
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="rounded-2xl shadow-glass w-full max-w-lg bg-surface-container-high flex flex-col glass-effect border-glass" onClick={e => e.stopPropagation()}>
                <div className="p-6 flex justify-between items-center border-b border-outline-variant">
                    <h2 className="text-2xl font-bold text-on-surface font-display">Prepayment Simulator</h2>
                    <button onClick={handleInteractiveClick(addPrepayment)} className="flex items-center gap-2 px-4 py-2 font-semibold rounded-full bg-primary-container text-on-primary-container hover:opacity-90 transition-opacity active:scale-95">
                        <icons.AddIcon /> Add New
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                    {prepayments.length === 0 ? (
                         <div className="p-4 flex items-start gap-4 bg-tertiary-container text-on-tertiary-container rounded-xl">
                            <icons.LightbulbIcon className="w-10 h-10 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold font-display text-lg">Smart Tip</h4>
                                <p>Add prepayments to see how much you can save on interest and reduce your loan tenure.</p>
                            </div>
                        </div>
                    ) : prepayments.map((p, i) => (
                         <div key={i} className="grid grid-cols-12 gap-3 items-center animate-cascade-in" style={{animationDelay: `${i*50}ms`}}>
                            <div className="col-span-4">
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
                            <div className="col-span-3">
                                <div className="relative input-field rounded-xl">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <icons.CalendarIcon className="text-on-surface-variant" />
                                    </div>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        aria-label={`Prepayment month for entry ${i + 1}`}
                                        placeholder="Month No."
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
                             <div className="col-span-3">
                                 <select
                                     value={p.frequency}
                                     onChange={(e) => updatePrepayment(i, 'frequency', e.target.value)}
                                     className="w-full px-3 py-2.5 bg-surface-container border border-outline rounded-xl text-on-surface"
                                 >
                                     <option value="one-time">One-time</option>
                                     <option value="monthly">Monthly</option>
                                     <option value="quarterly">Quarterly</option>
                                     <option value="annually">Annually</option>
                                 </select>
                             </div>
                            <div className="col-span-2 text-center">
                                <button onClick={handleInteractiveClick(() => removePrepayment(i))} aria-label={`Remove prepayment entry ${i + 1}`} className="group p-2.5 rounded-full text-error hover:bg-error-container/20 transition-colors duration-300">
                                    <icons.TrashIcon className="transition-transform duration-300 group-hover:scale-110" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="p-4 bg-surface-container/50 flex justify-end gap-3 rounded-b-2xl">
                    <button onClick={handleInteractiveClick(onClose)} className="px-6 py-2.5 font-bold rounded-full bg-primary text-on-primary shadow-md hover:opacity-90 transition-opacity active:scale-95">Done</button>
                </div>
            </div>
        </div>
    );
};