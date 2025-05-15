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
} from "react-icons/fi";
import {FaRegHandPointUp} from "react-icons/fa6";

export const metadata = {
  title: "Dua & Ruqyah | Hisnul Muslim Clone",
  description: "Hisnul Muslim dua app clone built with Next and TailwindCSS",
};

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
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen w-full font-sans">
        <div className="flex min-h-screen bg-gray-50">
          <div className="fixed top-0 left-0 h-full w-20 bg-[#f0f4ec] border-r border-gray-200 p-6 flex flex-col z-30">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-10 h-10 text-white bg-teal-700 rounded-lg"
            >
              <FaRegHandPointUp size={20} />
            </Link>
            <nav className="flex-1 flex flex-col items-center justify-center">
              <SidebarLink href="/" icon={FiHome} label="Home" />
              <SidebarLink href="/grid" icon={FiGrid} label="Dua" />
              <SidebarLink
                href="/bookmarks"
                icon={FiBookmark}
                label="Bookmark"
              />
              <SidebarLink href="/Ruqyah" icon={FiClipboard} label="Ruqyah" />
            </nav>
            <button className="mb-6 text-gray-600 hover:text-teal-700">
              <FiMenu size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col min-h-screen ml-20">
            <header className="fixed top-0 right-0 left-20 flex items-center justify-between px-8 py-3 bg-gray-50 border-b border-gray-200 z-20">
              <div className="flex items-center gap-3">
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
                  Support Us{" "}
                  <span className="text-lg leading-none">
                    <MdContactSupport className="text-white" />
                  </span>
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
