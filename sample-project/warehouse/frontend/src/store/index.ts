import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { AuthStore } from './auth.store';

export const makeStore = () => configureStore({
    reducer: combineReducers({
        auth: AuthStore.reducer,
    }),
    middleware: (defaultMiddleware) => defaultMiddleware({
        serializableCheck: false,
    }),
});

export type Store = ReturnType<typeof makeStore>;
export type State = ReturnType<Store['getState']>;
export type Dispatch = Store['dispatch'];
