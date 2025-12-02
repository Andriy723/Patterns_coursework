import { useState, useCallback, useEffect } from 'react';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
    execute: () => Promise<T>;
    refetch: () => Promise<T>;
}

export function useApi<T>(
    asyncFunction: () => Promise<T>,
    immediate: boolean = true
): UseApiReturn<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: immediate,
        error: null,
    });

    const execute = useCallback(async () => {
        setState({ data: null, loading: true, error: null });
        try {
            const response = await asyncFunction();
            setState({ data: response, loading: false, error: null });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            setState({ data: null, loading: false, error: errorMessage });
            throw error;
        }
    }, [asyncFunction]);

    const refetch = useCallback(async () => {
        return execute();
    }, [execute]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { ...state, execute, refetch };
}