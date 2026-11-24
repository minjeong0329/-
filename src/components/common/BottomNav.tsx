import React from 'react';
import { Calendar, CheckCircle2, Clock, Smile } from 'lucide-react';
import { sound } from '../../lib/sound';

export type NavTab = 'today' | 'schedule' | 'focus' | 'manager';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveTask?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  hasActiveTask = false,
}) => {
  const tabs = [
    { id: 'today' as NavTab, label: '오늘', icon: Calendar },
    { id: 'schedule' as NavTab, label: '일정', icon: CheckCircle2 },
    { id: 'focus' as NavTab, label: '집중', icon: Clock, badge: hasActiveTask },
    { id: 'manager' as NavTab, label: '매니저', icon: Smile },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto bg-white/95 backdrop-blur-md border-t border-[#E8E5D8] px-2 py-1.5 pb-[max(env(safe-area-inset-bottom),10px)] flex justify-around items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              sound.playClick();
              onTabChange(tab.id);
            }}
            className={`min-h-[48px] min-w-[64px] flex flex-col items-center justify-center rounded-xl relative transition-all active:scale-90 ${
              isActive
                ? 'text-[#586A41] font-bold'
                : 'text-[#858B7E] font-medium hover:text-[#292D27]'
            }`}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute -top-1 w-6 h-1 bg-[#778C59] rounded-full" />
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {tab.badge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E06C75] ring-2 ring-white animate-pulse" />
              )}
            </div>
            <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
