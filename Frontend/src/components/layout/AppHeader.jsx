export default function AppHeader({ mode, tabs, activeTab, onTabChange, onSwitchRole, onLogoClick, avatarLabel }) {
  return (
    <header className="bg-ink text-stone sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-7 py-4 flex items-center justify-between gap-4 flex-wrap">
        <button onClick={onLogoClick} className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-brass text-ink flex items-center justify-center font-bold text-sm">M</div>
          <div className="text-left">
            <p className="m-0 text-[17px] font-semibold leading-tight">Meridian Hotels</p>
            <p className="m-0 text-[10.5px] text-brass uppercase tracking-wider leading-tight">
              {mode === 'admin' ? 'Hotel Admin' : 'Guest portal'}
            </p>
          </div>
        </button>

        <nav className="flex gap-1.5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`font-semibold text-[13.5px] px-4 py-2 rounded-lg transition ${
                activeTab === tab.key ? 'bg-white/10 text-stone' : 'text-stone/65 hover:text-stone/90'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onSwitchRole}
            className="border border-white/20 text-stone text-xs font-semibold px-3.5 py-2 rounded-full hover:bg-white/10 transition"
          >
            Switch to {mode === 'admin' ? 'Guest' : 'Admin'} view
          </button>
          <div className="w-[34px] h-[34px] rounded-full bg-moss text-white flex items-center justify-center font-bold text-[13px]">
            {avatarLabel}
          </div>
        </div>
      </div>
    </header>
  )
}
