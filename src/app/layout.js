"use client";
import "./globals.css";
import Link from "next/link";
import {Tooltip} from "@heroui/tooltip";
import {MdContactSupport} from "react-icons/md";
import {
  FiHome,
  FiGrid,
  FiBookmark,
  FiMenu,
  FiClipboard,
  FiSearch,
  FiX,
} from "react-icons/fi";
import {FaRegHandPointUp} from "react-icons/fa6";
import {useState, useEffect} from "react";
import LeftCategory from "@/app/categories/LeftCategory";

const SidebarLink = ({href, icon: Icon, label}) => {
  return (
    <Tooltip
      content={label}
      placement="right"
      className="z-50 bg-black text-white p-2 text-center rounded-md transition-opacity duration-100"
    >
      <Link href={href} className="block">
        <div className="w-12 h-12 flex items-center justify-center rounded-md transition">
          <Icon className="w-6 h-6 text-gray-700 hover:text-teal-700 transition-colors" />
        </div>
      </Link>
    </Tooltip>
  );
};

export default function RootLayout({children}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer when screen size becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isDrawerOpen]);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isDrawerOpen]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen w-full font-sans">
        <div className="flex min-h-screen bg-gray-50">
          {/* Mobile Drawer */}
          {isDrawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/50"
                onClick={closeDrawer}
                aria-hidden="true"
              ></div>

              {/* Drawer panel */}
              <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-lg flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 text-white bg-teal-700 rounded-lg mr-3">
                        <FaRegHandPointUp size={16} />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          Dua & Ruqyah
                        </div>
                        <div className="text-xs text-gray-600">
                          Hisnul Muslim
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeDrawer}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                  <LeftCategory forceShow={true} closeDrawer={closeDrawer} />
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4">
                  <button className="w-full bg-teal-700 text-white hover:bg-teal-800 py-2 rounded-md flex items-center justify-center gap-2">
                    Support Us
                    <MdContactSupport />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar */}
          <div className="fixed bottom-0 left-0 w-full h-16 bg-[#f0f4ec] border-t border-gray-200 flex justify-around items-center z-30 lg:top-0 lg:left-0 lg:h-full lg:w-20 lg:border-r lg:border-t-0 lg:flex-col lg:justify-between lg:items-center lg:p-6">
            {/* Logo */}
            <Link
              href="/"
              className="hidden lg:flex items-center justify-center w-10 h-10 text-white bg-teal-700 rounded-lg"
            >
              <FaRegHandPointUp size={20} />
            </Link>

            {/* Navigation Links */}
            <nav className="flex flex-row gap-6 lg:flex-col lg:gap-0 lg:space-y-6 lg:items-center lg:flex-1 lg:justify-center">
              <SidebarLink href="/" icon={FiHome} label="Home" />
              <SidebarLink href="/grid" icon={FiGrid} label="Dua" />
              <SidebarLink
                href="/bookmarks"
                icon={FiBookmark}
                label="Bookmark"
              />
              <SidebarLink href="/Ruqyah" icon={FiClipboard} label="Ruqyah" />
            </nav>

            {/* Menu icon */}
            <button
              onClick={openDrawer}
              className="hidden lg:block text-gray-600 hover:text-teal-700"
            >
              <FiMenu size={24} />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-screen lg:ml-20">
            <header className="fixed top-0 right-0 lg:left-20 left-0 flex items-center justify-between px-8 py-3 bg-gray-50 border-b border-gray-200 z-20">
              <div className="flex items-center gap-3">
                <button
                  onClick={openDrawer}
                  className="block lg:hidden text-gray-600 hover:text-teal-700"
                >
                  <FiMenu size={24} />
                </button>
                <div>
                  <div className="text-lg font-bold text-gray-900 leading-tight">
                    Dua & Ruqyah
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Hisnul Muslim
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full text-teal-700 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-300">
                  <FiSearch size={20} />
                </button>
                <button className="h-10 flex items-center px-5 bg-teal-700 rounded-full text-white font-semibold text-sm gap-2 hover:bg-teal-800 transition-colors">
                  Support Us
                  <MdContactSupport className="text-white text-lg" />
                </button>
              </div>
            </header>
            <main className="flex-1 p-6 pt-20 overflow-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
