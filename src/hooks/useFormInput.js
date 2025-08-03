import { useState } from 'react';

const useFormInput = (initialValue, validator = /^\d*\.?\d*$/) => {
    const [value, setValue] = useState(initialValue);

    const handleChange = (e) => {
        const { value: inputValue } = e.target;
        const rawValue = inputValue.replace(/,/g, '');

        if (validator.test(rawValue)) {
            setValue(rawValue);
        }
    };

    return [value, setValue, handleChange];
};

export default useFormInput;