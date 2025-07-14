"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clear_auth, initializeAuth } from "@/src/store/auth.store";
import { usePathname } from "next/navigation";

export default function AuthInitializer() {
  const dispatch = useDispatch();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check tokens from localStorage.
      const storeToken = localStorage.getItem("Store-Token");
      const authToken = localStorage.getItem("Authorization");

      // Only perform redirect logic when on /login or /register.
      if (pathname === "/login" || pathname === "/register") {
        if (storeToken) {
          // If the user has a Store-Token, redirect them to the home page.
          window.location.href = "/";
          return;
        }
        if (authToken) {
          // If the user only has an Authorization token, redirect them to /store.
          // window.location.href = "/store";
          return;
        }
      }
    }

    // Initialize authentication.
    initializeAuth(dispatch);
  }, [dispatch, pathname]);

  return null;
}


// 'use client';

// import { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { clear_auth, initializeAuth } from '@/src/store/auth.store';
// import { usePathname } from 'next/navigation';
// import { initializeSharing } from '@/src/federations/federation-utils';

// export default function AuthInitializer() {
//   const dispatch = useDispatch();
//   const pathname = usePathname();

//   useEffect(() => {
//     // Initialize Module Federation sharing
//     console.log('Initializing Module Federation Share Scope...');
//     initializeSharing();
//   }, []);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       // Check tokens from localStorage.
//       const storeToken = localStorage.getItem('Store-Token');
//       const authToken = localStorage.getItem('Authorization');

//       // Redirect logic when on /login or /register.
//       if (pathname === '/login' || pathname === '/register') {
//         if (storeToken) {
//           window.location.href = '/';
//           return;
//         }
//         if (authToken) {
//           // window.location.href = '/store';
//           return;
//         }
//       }
//     }

//     // Initialize authentication.
//     initializeAuth(dispatch);
//   }, [dispatch, pathname]);

//   return null;
// }
