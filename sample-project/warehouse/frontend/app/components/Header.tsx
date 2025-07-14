'use client';

import React from "react";
import Image from "next/image";
import { IoNotificationsOutline } from "react-icons/io5";

const Header = () => {
  return (
    <header className="w-full fixed top-0 bg-black z-40 font-maisonNeue border-b border-primary-lightdark">
      <div className="w-full h-full flex items-center justify-between px-4 py-2">
        {/* Logo and App Name */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = "/"}>
          <Image alt="IGTC Logo" src="/logo.svg" width={70} height={70} className="w-[70px]" />
          <h1 className="font-extrabold text-[16px] text-white">IGTC Network</h1>
        </div>
        {/* Notification and User Avatar */}
        <div className="flex items-center space-x-4">
          <button className="relative p-2 hover:bg-gray-800 rounded">
            <IoNotificationsOutline size={24} className="text-white" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-black bg-red-500"></span>
          </button>
          <Image alt="User Avatar" src="/avatar.png" width={32} height={32} className="rounded-full" />
        </div>
      </div>
    </header>
  );
};

export default Header;
