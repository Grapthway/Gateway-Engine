'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IoHomeOutline,
  IoCashOutline,
  IoPieChartOutline,
  IoAnalyticsOutline,
  IoDocumentTextOutline,
  IoSettingsOutline,
  IoNotificationsOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoStorefrontOutline,
  IoArchiveOutline,
  IoSwapHorizontalOutline,
  IoReceiptOutline, // Added distribution icon
} from "react-icons/io5";

const Sidebar = () => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const navItems = [
    { name: "Dashboard", href: "/", icon: <IoHomeOutline size={20} /> },
    { name: "Sales", href: "/sales", icon: <IoCashOutline size={20} /> },
    { name: "Expense", href: "/expense", icon: <IoReceiptOutline size={20} /> },
    { name: "Store", href: "/store", icon: <IoStorefrontOutline size={20} /> },
    { 
      name: "Distribution Management", 
      href: "/distribution-management", 
      icon: <IoSwapHorizontalOutline size={20} /> 
    },
    { name: "Inventory Management", href: "/inventory-management", icon: <IoArchiveOutline size={20} /> },
    { name: "Settings", href: "/settings", icon: <IoSettingsOutline size={20} /> },
    { name: "Notifications", href: "", icon: <IoNotificationsOutline size={20} /> },
  ];

  return (
    <aside
      className={`bg-gray-800 text-white min-h-screen border-r border-primary-lightdark transition-width duration-300 
        ${isCollapsed ? "w-12" : "w-38 fixed top-[80px] md:top-[72px] left-0 z-50"} pt-2`}
    >
      <div className="flex flex-col h-screen">
        <div className="mb-6 mt-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full p-2 hover:bg-gray-700 rounded transition-colors"
          >
            {isCollapsed ? (
              <>
                <IoChevronForwardOutline size={20} />
                {!isCollapsed && <span className="ml-2 text-sm"></span>}
              </>
            ) : (
              <>
                <IoChevronBackOutline size={20} />
                {!isCollapsed && <span className="ml-2 text-sm"></span>}
              </>
            )}
          </button>
        </div>
        <nav className={`flex-1 ${isCollapsed ? "" : "p-4"}`}>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  onClick={() => router.push(item.href)}
                  className={`group relative flex items-center ${
                    isCollapsed ? "justify-center" : ""
                  } space-x-2 p-2 hover:bg-gray-700 rounded transition-colors cursor-pointer`}
                >
                  <span>{item.icon}</span>
                  {!isCollapsed && <span className="text-sm">{item.name}</span>}
                  
                  {/* Hover tooltip for collapsed state */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      {item.name}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;