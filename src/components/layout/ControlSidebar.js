import React from 'react';
import Card from '../common/Card';
import InputWithValidation from '../common/InputWithValidation';
import ExpressiveSlider from '../common/ExpressiveSlider';
import CalculationModeSwitcher from '../calculator/CalculationModeSwitcher';
import { PrepaymentSimulator } from '../calculator/PrepaymentSimulator';
import { icons } from '../../constants/icons';

const ControlSidebar = ({
    clientName, setClientName, loanAmount, handleInputChange, activeInput, formatInputValue,
    handleFocus, handleBlur, formErrors, calculationMode, setCalculationMode, tenureYears,
    setTenureYears, emi, interestRate, emiPaymentDay, startDate, setStartDate,
    prepayments, setPrepayments, formatCurrency, d
}) => {

    const handleNameChange = (e) => {
        setClientName(e.target.value);
    };

    const handleNameInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    return (
        <Card className={`${d.p} h-full flex flex-col`}>
             <div className="flex items-baseline whitespace-nowrap mb-4">
                <span className="text-lg font-semibold text-secondary mr-2">Client:</span>
                <span className="text-xl font-bold text-on-surface-variant mr-1">M/s</span>
                <input
                    type="text"
                    value={clientName}
                    onChange={handleNameChange}
                    onKeyDown={handleNameInputKeyDown}
                    placeholder="Client Name"
                    className={`text-xl font-bold text-on-surface-variant bg-transparent focus:outline-none w-full border-b transition-colors duration-300 ${
                        !clientName ? 'border-dashed border-outline' : 'border-transparent'
                    } focus:border-solid focus:border-primary`}
                />
            </div>
            
            <CalculationModeSwitcher
                calculationMode={calculationMode}
                setCalculationMode={setCalculationMode}
            />
            <div className="space-y-4 flex-grow flex flex-col">
                <InputWithValidation id="loanAmount" name="loanAmount" label="Loan Amount" value={activeInput === 'loanAmount' ? loanAmount : formatInputValue(loanAmount)} onChange={handleInputChange} onFocus={handleFocus} onBlur={handleBlur} error={formErrors.loanAmount} unit="₹" type="text" maxLength="12" inputMode="decimal" />
                {calculationMode !== 'tenure' && <ExpressiveSlider min={1} max={30} step={1} value={Number(tenureYears)} onChange={(v) => setTenureYears(String(v))} icon="Calendar" />}
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
                
                <PrepaymentSimulator prepayments={prepayments} setPrepayments={setPrepayments} formatCurrency={formatCurrency} />
            </div>
        </Card>
    );
};

export default ControlSidebar;