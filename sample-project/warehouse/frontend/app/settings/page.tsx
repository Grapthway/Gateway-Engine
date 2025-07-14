"use client";

import React, { useState } from 'react';
import { CategorySection } from './components/sections/categorySection';
import { InventorySection } from './components/sections/inventorySection';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'category' | 'inventory'>('category');

    return (
        <div className="bg-gray-50 min-h-screen text-gray-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your product categories and inventory levels.</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('category')}
                            className={`${
                                activeTab === 'category'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Categories
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`${
                                activeTab === 'inventory'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Inventory
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="mt-8">
                    {activeTab === 'category' && <CategorySection />}
                    {activeTab === 'inventory' && <InventorySection />}
                </div>
            </div>
        </div>
    );
}