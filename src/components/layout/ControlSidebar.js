import React from 'react';
import Card from '../common/Card';
import InputWithValidation from '../common/InputWithValidation';
import ExpressiveSlider from '../common/ExpressiveSlider';
import CalculationModeSwitcher from '../calculator/CalculationModeSwitcher';
import { icons } from '../../constants/icons';

const ControlSidebar = ({
    clientName, setClientName, loanAmount, handleInputChange, activeInput, formatInputValue,
    handleFocus, handleBlur, formErrors, calculationMode, setCalculationMode, tenureYears,
    setTenureYears, emi, interestRate, emiPaymentDay, startDate, setStartDate,
    onOpenPrepaymentModal, onOpenAffordabilityModal, prepayments, d, handleInteractiveClick
}) => {
    return (
        <Card className={`${d.p} h-full flex flex-col`}>
             <div className="relative group flex items-baseline whitespace-nowrap mb-4">
                <span className="text-lg font-semibold text-secondary mr-2">Client:</span>
                <span className="text-xl font-bold text-on-surface-variant mr-1">M/s</span>
                <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                    placeholder="Client Name"
                    className="text-xl font-bold text-on-surface-variant bg-transparent focus:outline-none w-full border-b-2 border-transparent group-hover:border-outline-variant focus:border-primary transition-colors duration-300"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    name="clientName"
                />
                <div className="absolute right-0 top-0 h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <icons.Edit className="w-5 h-5 text-on-surface-variant" />
                </div>
            </div>
            
            <CalculationModeSwitcher
                calculationMode={calculationMode}
                setCalculationMode={setCalculationMode}
                handleInteractiveClick={handleInteractiveClick}
            />
            <div className="flex-grow flex flex-col space-y-4 overflow-y-auto -mr-2 pr-2">
                <InputWithValidation id="loanAmount" name="loanAmount" label="Loan Amount" value={activeInput === 'loanAmount' ? loanAmount : formatInputValue(loanAmount)} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} error={formErrors.loanAmount} unit="₹" type="text" maxLength="12" inputMode="decimal" />
                
                <div className="p-3 flex items-center gap-3 bg-surface-container-high rounded-xl text-on-surface-variant">
                    <icons.Help className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm">
                        Not sure how much you can afford?{' '}
                        <button onClick={onOpenAffordabilityModal} className="font-semibold text-primary hover:underline">
                            Calculate here
                        </button>
                    </p>
                </div>

                {calculationMode !== 'tenure' && <ExpressiveSlider min={1} max={30} step={1} value={Number(tenureYears)} onChange={(v) => setTenureYears(String(v))} icon="Calendar" handleInteractiveClick={handleInteractiveClick} />}
                {calculationMode !== 'emi' && <InputWithValidation id="emi" name="emi" label="Monthly EMI" value={activeInput === 'emi' ? emi : formatInputValue(emi)} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} error={formErrors.emi} unit="₹" type="text" maxLength="9" inputMode="decimal" />}
                {calculationMode !== 'rate' && <InputWithValidation id="interestRate" name="interestRate" label="Interest Rate (%)" value={interestRate} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} error={formErrors.interestRate} icon="Percent" type="text" maxLength="5" inputMode="decimal" />}
                
                <InputWithValidation id="emiPaymentDay" name="emiPaymentDay" label="EMI Payment Day" value={emiPaymentDay} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} error={formErrors.emiPaymentDay} icon="Calendar" type="text" maxLength="2" inputMode="numeric" helpText="Day from 1-31." />
                <div>
                  <label htmlFor="startDate" className="block font-medium mb-1.5 text-on-surface-variant">Loan Start Date</label>
                  <div className="relative input-field rounded-xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><icons.Calendar className="text-on-surface-variant" /></div>
                    <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-transparent border-none rounded-xl text-on-surface" />
                  </div>
                </div>
                
                 <div className="pt-4 border-t border-outline-variant mt-auto">
                    <button onClick={onOpenPrepaymentModal} className="w-full flex justify-between items-center p-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-colors">
                        <div className="text-left">
                            <h3 className="font-semibold text-on-surface">Prepayment Simulator</h3>
                            <p className="text-sm text-on-surface-variant">{prepayments.length} prepayments added</p>
                        </div>
                        <icons.Add />
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default ControlSidebar;