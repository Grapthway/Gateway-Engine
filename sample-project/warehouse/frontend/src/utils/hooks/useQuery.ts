// useQuery.ts
import { useState, useCallback } from "react"; // <-- Import useCallback

export const useQuery = <T,>(fn: () => Promise<T>) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
   
    // Wrap fetchData in useCallback to stabilize the function reference.
    // It will only be re-created if the 'fn' it depends on changes.
    const fetchData = useCallback(async () => {
        setStatus('loading');
        try {
            const result = await fn();
            setData(result);
            setStatus('success');
        } catch (err: any) {
            setError(err?.response?.data?.error || err?.message || err);
            setStatus('error');
        }
    }, [fn]); // <-- Dependency array for useCallback

    return {
        fetch: fetchData,
        data,
        error,
        status,
        isIdle: status === 'idle',
        isLoading: status === 'loading',
        isSuccess: status === 'success',
        isError: status === 'error',
    };
};