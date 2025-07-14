"use client";

import React, { useState } from 'react';
import { ConnectionsSection } from './components/sections/connectionsSection';
import { ShippingSection } from './components/sections/shippingSection';

export default function ShippingPage() {
    const [activeTab, setActiveTab] = useState<'connections' | 'shipping'>('connections');

    return (
        <div className="bg-gray-50 min-h-screen text-gray-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Shipping</h1>
                    <p className="text-gray-500 mt-1">Manage your warehouse connections and view shipping history.</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('connections')}
                            className={`${
                                activeTab === 'connections'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Warehouse Connections
                        </button>
                        <button
                            onClick={() => setActiveTab('shipping')}
                            className={`${
                                activeTab === 'shipping'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Shipping History
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="mt-8">
                    {activeTab === 'connections' && <ConnectionsSection />}
                    {activeTab === 'shipping' && <ShippingSection />}
                </div>
            </div>
        </div>
    );
}