import React from 'react';
import { icons } from '../../constants/icons';

export const VariableRateModal = ({ isOpen, onClose, variableRates, setVariableRates, handleInteractiveClick }) => {
    if (!isOpen) return null;

    const addRate = () => {
        setVariableRates([...variableRates, { month: '', rate: '' }]);
    };

    const updateRate = (i, field, value) => {
        const newRates = [...variableRates];
        newRates[i][field] = value;
        setVariableRates(newRates);
    };

    const removeRate = (i) => {
        setVariableRates(variableRates.filter((_, idx) => i !== idx));
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="rounded-2xl shadow-glass w-full max-w-lg bg-surface-container-high flex flex-col glass-effect border-glass" onClick={e => e.stopPropagation()}>
                <div className="p-6 flex justify-between items-center border-b border-outline-variant">
                    <h2 className="text-2xl font-bold text-on-surface font-display">Variable Rates</h2>
                    <button onClick={handleInteractiveClick(addRate)} className="flex items-center gap-2 px-4 py-2 font-semibold rounded-full bg-primary-container text-on-primary-container hover:opacity-90 transition-opacity active:scale-95">
                        <icons.AddIcon /> Add New
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                    {variableRates.length === 0 ? (
                        <div className="p-4 flex items-start gap-4 bg-tertiary-container text-on-tertiary-container rounded-xl">
                           <icons.LightbulbIcon className="w-10 h-10 flex-shrink-0 mt-1" />
                           <div>
                               <h4 className="font-bold font-display text-lg">Variable Rates</h4>
                               <p>Define interest rate changes that occur over the life of the loan.</p>
                           </div>
                       </div>
                   ) : variableRates.map((r, i) => (
                        <div key={i} className="grid grid-cols-12 gap-3 items-center animate-cascade-in" style={{animationDelay: `${i*50}ms`}}>
                           <div className="col-span-5">
                               <div className="relative input-field rounded-xl">
                                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                       <icons.CalendarIcon className="text-on-surface-variant" />
                                   </div>
                                   <input
                                       type="text"
                                       inputMode="numeric"
                                       pattern="[0-9]*"
                                       aria-label={`Month for rate change ${i + 1}`}
                                       placeholder="Month No."
                                       value={r.month}
                                       onChange={e => {
                                           if (/^\d*$/.test(e.target.value)) {
                                               updateRate(i, 'month', e.target.value);
                                           }
                                       }}
                                       className="w-full pl-10 pr-2 py-2.5 bg-transparent border-none rounded-xl focus:ring-0 focus:outline-none"
                                   />
                               </div>
                           </div>
                           <div className="col-span-5">
                               <div className="relative input-field rounded-xl">
                                   <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                       <icons.PercentIcon className="text-on-surface-variant" />
                                   </div>
                                   <input
                                       type="text"
                                       inputMode="decimal"
                                       aria-label={`New interest rate for entry ${i + 1}`}
                                       placeholder="New Rate"
                                       value={r.rate}
                                       onChange={e => {
                                           if (/^[0-9.]*$/.test(e.target.value)) {
                                               updateRate(i, 'rate', e.target.value);
                                           }
                                       }}
                                       className="w-full pl-10 pr-2 py-2.5 bg-transparent border-none rounded-xl focus:ring-0 focus:outline-none"
                                   />
                               </div>
                           </div>
                           <div className="col-span-2 text-center">
                               <button onClick={handleInteractiveClick(() => removeRate(i))} aria-label={`Remove rate change entry ${i + 1}`} className="group p-2.5 rounded-full text-error hover:bg-error-container/20 transition-colors duration-300">
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