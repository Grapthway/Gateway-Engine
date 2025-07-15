import { useState } from "react";

export const useMutation = <T, U>(fn: (param: T) => Promise<U>) => {
    const [data, setData] = useState<U | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    return {
        mutate: async (param: T) => {
            setStatus('loading');
            try {
                const res = await fn(param);
                setStatus('success');
                setData(res);
                return res;
            } catch (err: any) {
                setStatus('error');
                setError(err?.response?.data?.error || err?.message || err);
                throw err;
            }
        },
        data,
        error,
        status,
        isIdle: status === 'idle',
        isLoading: status === 'loading',
        isSuccess: status === 'success',
        isError: status === 'error',
    };
};
