import React, { ReactEventHandler, useState } from "react";

interface UseFormEvent<T> {
    onSubmit?: (values: T, reset?: () => void) => Promise<unknown>,
}

export const useForm = <T>(initialValue: T, events: UseFormEvent<T>) => {
    type Keys = keyof typeof initialValue;
    const [values, setValues] = useState<typeof initialValue>(initialValue);
    const setFieldValue = (key: Keys, value: unknown) => {
        const ff = {...values} as any;
        ff[key] = value;
        setValues(ff);
    }

    const reset = () => {
        setValues(initialValue);
    };

    const res = {
        values,
        setValues(vv: T) {
            setValues(vv);
        },
        setFieldValue,
        onChange(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) {
            const name = e.target.getAttribute('name');
            setFieldValue(name as keyof T, e.target.value);
        },
        onSubmit(e: React.FormEvent<HTMLFormElement>) {
            e.preventDefault();
            
            if (events.onSubmit) {
                events.onSubmit(values, reset);
            }
        },
        reset,
    };

    return res;
};
