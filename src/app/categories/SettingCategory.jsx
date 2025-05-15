import React from "react";
const SettingsItem = ({emoji, title}) => {
  return (
    <div className="flex items-center gap-3 text-[#607660] font-semibold text-base">
      <span className="w-8 h-8 bg-[#f1f7ee] rounded-md flex justify-center items-center">
        {emoji}
      </span>
      {title}
    </div>
  );
};

const RightSidebar = () => {
  return (
    <aside
      className="w-80 shrink-0 border-l border-[#e7efe4] bg-[#f7faf7] px-6 py-8 hidden lg:block"
      style={{minWidth: 320}}
    >
      <div className="space-y-3">
        <SettingsItem emoji="🌐" title="Language Settings" />
        <SettingsItem emoji="🅰️" title="Font Setting" />
        <SettingsItem emoji="👁️" title="View Setting" />
        <SettingsItem emoji="🎨" title="Appearance Settings" />
      </div>
    </aside>
  );
};

export default RightSidebar;
