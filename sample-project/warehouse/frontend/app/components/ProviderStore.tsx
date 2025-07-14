'use client';

import { Store, makeStore } from "@/src/store";
import { useRef } from "react";
import { Provider } from "react-redux";

export const ProviderStore = ({ children }: Readonly<{
    children: React.ReactNode;
  }>) => {
    const storeRef = useRef<Store>();
    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    return <Provider store={storeRef.current}>
        {children}
    </Provider>;
};