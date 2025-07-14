'use client';

import React from 'react'; 

export default function Home() {
  const bannerLoading = true;
  const topUpLoading = true;
  const recLoading = true;

  // The useGraphQLQuery hook inside useGetStores will handle the initial fetch automatically.
  // const { data: storeData, isLoading: gsIsLoading, error: gsError, refetch: gsFetch } = useGetStores();

  // The useEffect block that called gsFetch() has been removed to prevent a double-fetch.

  return (
    <div className="px-4 sm:px-8 py-6 bg-gray-50 min-h-screen">
    </div>
  );
}
