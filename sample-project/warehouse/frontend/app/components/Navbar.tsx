'use client';

import React from 'react';
import Image from '@/node_modules/next/image';
import { useRouter } from 'next/navigation';
import { MdOutlinePowerSettingsNew } from 'react-icons/md';

// Utils and hooks
import { ImageAsset } from '@/src/utils/index';
import { useAppDispatch, useAppSelector } from '@/src/utils/hooks/store';


// Services and store
import { AuthStore, logout } from '@/src/store/auth.store';

const NavbarSecond = () => {

  // Hooks
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Selectors and services
  const { username } = useAppSelector(state => state.auth);

  // Computed values
  const isUserConnected = username || "";

  // Event handlers
  const handleLogout = async () => {
    const success = await logout(dispatch);
    if (success) router.push('/login');
  };

  const handleDisconnect = () => {
    dispatch(AuthStore.actions.clear_auth());
  };

  const navigateToHome = () => {
    router.push('/');
  };

  const navigateToPage = (path: any) => {
    router.push(path);
  };

  // Navigation items
  const navItems = [
    { label: 'Shipping', path: '/shipping' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Main Navigation */}
      <nav className="w-full fixed bg-black z-40 font-maisonNeue">
        <div className="flex flex-col md:flex-row justify-between md:items-center border border-primary-lightdark border-l-0 border-r-0">
          <div className="flex justify-between items-center w-full md:w-auto">
            {/* Left Section - Logo and Title (Clickable for mobile menu) */}
            <div className="flex items-center">
              <div>
                <Image 
                  alt="nav-logo" 
                  src={ImageAsset.IGTCLogo} 
                  className="w-[80px] md:w-[70px]" 
                />
              </div>
              <div
                className="hidden lg:flex border-r border-primary-lightdark pr-5 cursor-pointer"
                onClick={navigateToHome}
              >
                <h1 className="font-extrabold text-[16px] whitespace-nowrap">
                  IGTC - Warehouse
                </h1>
              </div>
            </div>

            {/* Right Section - User Actions Only on Mobile */}
            <div className="flex md:hidden items-center h-[40px] mr-2">
              {isUserConnected ? (
                <div className="w-auto flex justify-center items-center h-full">

                  {/* Action Buttons Section */}
                  <div className="flex h-full">
                    {/* Main Profile Card */}
                    <div className="px-3 bg-primary-lightdark rounded-l-[4px] text-black font-bold text-sm py-1.5 flex items-center gap-x-2 cursor-pointer flex-1 h-full">
                      {/* Name and Balance Column */}
                      <div className="flex flex-col justify-center h-full min-w-0">
                        {/* Username/Address */}
                        {username  !== "" ? (
                          <p className="text-primary-semiwhite truncate max-w-[120px] text-sm leading-tight">
                            {username}
                          </p>
                        ) : ""}
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      type="button"
                      className="bg-primary-lightdark text-red-600 px-2 py-0 text-xs font-semibold min-w-[40px] rounded-r-[4px] transition-colors flex items-center justify-center h-full"
                      onClick={handleLogout}
                      title="Logout"
                    >
                      <MdOutlinePowerSettingsNew size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-auto flex justify-center items-center h-full">
                  <div
                    className="px-4 bg-white rounded-[4px] text-black font-bold text-sm py-0 flex items-center justify-center hover:bg-gray-100 transition-colors h-full"
                  >
                    <span>Please Login</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Navigation and User Actions (Desktop) */}
          <div className="hidden md:flex w-full md:w-auto border border-l-transparent border-t-transparent md:border-transparent border-primary-lightdark p-[10.2px] justify-end items-center">
            {/* Desktop Navigation Links */}
            <div className="hidden md:inline">
              <ol className="flex gap-x-2 md:gap-x-4 items-center h-full">
                {navItems.map((item, index) => (
                  <li key={index} className="text-xs text-primary-semiwhite md:text-sm cursor-pointer hover:text-white">
                    <span onClick={() => navigateToPage(item.path)}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* User Section (Desktop) */}
            <div className="hidden md:flex items-center ml-4 h-[40px]">
              {isUserConnected ? (
                <div className="w-auto pl-1 flex justify-center items-center md:border-l md:border-primary-lightdark h-full">
                  {/* Main Profile Card */}
                  <div className="px-3 bg-primary-lightdark rounded-l-[4px] text-black font-bold text-sm py-1.5 flex items-center gap-x-2 cursor-pointer flex-1 h-full">
                    {/* Name Column */}
                    <div className="flex flex-col justify-center h-full min-w-0">
                      {/* Username/Address */}
                      {username  !== "" ? (
                        <p className="text-primary-semiwhite truncate max-w-[120px] text-sm leading-tight">
                          {username}
                        </p>
                      ) : ""}
                    </div>
                  </div>

                  {/* Action Buttons Section */}
                  <div className="flex h-full">

                    {/* Logout Button */}
                    <button
                      type="button"
                      className="bg-primary-lightdark text-red-600 px-2 py-0 text-xs font-semibold min-w-[40px] rounded-r-[4px] transition-colors flex items-center justify-center h-full"
                      onClick={handleLogout}
                      title="Logout"
                    >
                      <MdOutlinePowerSettingsNew size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-auto pl-1 flex justify-center items-center md:border-l md:border-primary-lightdark h-full">
                  <div
                    className="px-4 w-full bg-white rounded-[4px] text-black font-bold text-sm py-0 flex items-center justify-center hover:bg-gray-100 transition-colors h-full"
                  >
                    <span>Please Login</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavbarSecond;