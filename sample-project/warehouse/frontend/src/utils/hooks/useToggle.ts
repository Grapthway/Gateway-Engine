import { useState } from "react";

export const useToggle = (initial: boolean = false) => {
    const [value, setValue] = useState(initial);

    return {
        value,
        toggle() {
            setValue((v) => !v);
        },
        setTrue() {
            setValue(true);
        },
        setFalse() {
            setValue(false);
        },
    };
};
