import React from "react";
import LeftCategory from "@/app/categories/LeftCategory";
import RightSidebar from "@/app/categories/SettingCategory";
import MainContent from "@/app/categories/MainContents";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#f9fbf9]">
      <LeftCategory />
      <MainContent />
      <RightSidebar />
    </div>
  );
}
