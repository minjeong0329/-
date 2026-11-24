import React from 'react';
import { CharacterState, InventoryItem } from '../../types';
import { MirumiCharacter } from '../character/MirumiCharacter';
import { sound } from '../../lib/sound';

interface CharacterRoomProps {
  character: CharacterState;
  inventory: InventoryItem[];
  onToggleEquip: (item: InventoryItem) => void;
}

export const CharacterRoom: React.FC<CharacterRoomProps> = ({
  character,
  inventory,
  onToggleEquip,
}) => {
  const equippedRoomItems = character.equippedRoomItems || [];

  const hasItem = (id: string) => equippedRoomItems.includes(id);

  // Level title calculation
  const getLevelTitle = (lvl: number) => {
    if (lvl >= 10) return '완성형 프로 매니저';
    if (lvl >= 7) return '단단한 나무';
    if (lvl >= 4) return '자라나는 줄기';
    if (lvl >= 2) return '푸른 잎사귀';
    return '갓 돋아난 새싹';
  };

  const xpPercent = Math.min(100, Math.round((character.currentXp / character.xpToNextLevel) * 100));

  return (
    <div className="space-y-4">
      {/* Level & XP Status Banner */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#778C59] text-white">
              Lv.{character.level}
            </span>
            <span className="text-xs font-bold text-[#292D27]">{character.name}</span>
            <span className="text-[11px] text-[#858B7E]">({getLevelTitle(character.level)})</span>
          </div>
          <span className="text-xs font-bold text-[#586A41]">
            {character.currentXp} / {character.xpToNextLevel} XP
          </span>
        </div>

        {/* XP Bar */}
        <div className="w-full bg-[#EFECE3] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#778C59] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Cozy Visual Room Scene */}
      <div className="relative w-full h-72 rounded-3xl bg-[#FAF8F2] border border-[#E3DFD4] shadow-lifted overflow-hidden flex items-end justify-center">
        {/* Wall background & subtle wallpaper line */}
        <div className="absolute inset-x-0 top-0 h-44 bg-[#F2EFE6] border-b border-[#E0DBCF]">
          {/* Subtle Window */}
          <div className="absolute top-5 left-6 w-16 h-20 rounded-t-xl bg-[#EAF0F8] border-2 border-[#D5D0C0] overflow-hidden flex flex-col justify-between p-1">
            <div className="w-full h-1/2 border-b border-[#D5D0C0] relative">
              <span className="absolute top-1 right-1 text-[10px]">☀️</span>
            </div>
            <div className="w-full h-1/2" />
          </div>

          {/* Wall Clock if equipped */}
          {hasItem('item_wall_clock') && (
            <div className="absolute top-6 right-8 w-10 h-10 rounded-full bg-white border-2 border-[#586A41] shadow-sm flex items-center justify-center animate-pulse-subtle">
              <span className="text-[10px]">⏰</span>
            </div>
          )}
        </div>

        {/* Floor */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[#E5DEC9] border-t border-[#D5CCA8]" />

        {/* Rug on floor if equipped */}
        {hasItem('item_rug_cozy') && (
          <div className="absolute bottom-3 w-48 h-16 rounded-full bg-[#E8DDD0] border border-[#D5CCA8] shadow-inner transform -rotate-1" />
        )}

        {/* Desk & Lamp on right if equipped */}
        {hasItem('item_desk_lamp') && (
          <div className="absolute bottom-16 right-5 flex flex-col items-center">
            <div className="w-6 h-6 rounded-t-full bg-[#EBCB8B] shadow-sm flex items-center justify-center text-[10px]">
              💡
            </div>
            <div className="w-1.5 h-6 bg-[#C4BFB2]" />
            <div className="w-8 h-2 bg-[#AFA898] rounded-full" />
          </div>
        )}

        {/* Desk Plant on left if equipped */}
        {hasItem('item_desk_plant') && (
          <div className="absolute bottom-14 left-7 flex flex-col items-center">
            <span className="text-xl">🪴</span>
            <div className="w-6 h-4 bg-[#D08770] rounded-b-lg border border-[#B35D43]" />
          </div>
        )}

        {/* Mirumi in Room with accessories */}
        <div className="relative z-10 mb-4 flex flex-col items-center">
          {/* Leaf cushion under Mirumi if equipped */}
          {hasItem('item_cushion_basic') && (
            <div className="w-24 h-6 rounded-full bg-[#D5E5B5] border border-[#778C59] -mb-4 shadow-sm" />
          )}

          <MirumiCharacter
            expression={character.expressionState}
            equippedAccessory={character.equippedAccessory}
            size={120}
          />
        </div>
      </div>

      {/* Room Decor Items & Accessories Toggle Grid */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] space-y-3">
        <h4 className="text-xs font-bold text-[#292D27]">방 꾸미기 및 착용 관리</h4>

        <div className="grid grid-cols-2 gap-2">
          {inventory
            .filter((item) => item.isPurchased)
            .map((item) => {
              const isEquipped =
                item.type === 'accessory'
                  ? character.equippedAccessory === item.id
                  : character.equippedRoomItems.includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    onToggleEquip(item);
                  }}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isEquipped
                      ? 'bg-[#EDF4E4] border-[#778C59] ring-1 ring-[#778C59]'
                      : 'bg-[#F8F7F2] border-[#E3DFD4] text-[#686E63]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-xs font-bold text-[#292D27] truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold ${isEquipped ? 'text-[#586A41]' : 'text-[#858B7E]'}`}>
                    {isEquipped ? '착용 중' : '해제됨'}
                  </span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};
