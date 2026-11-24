import React from 'react';
import { InventoryItem, CharacterState } from '../../types';
import { sound } from '../../lib/sound';
import { ShoppingBag, Check } from 'lucide-react';

interface ItemShopProps {
  character: CharacterState;
  inventory: InventoryItem[];
  onPurchase: (item: InventoryItem) => void;
}

export const ItemShop: React.FC<ItemShopProps> = ({
  character,
  inventory,
  onPurchase,
}) => {
  const accessories = inventory.filter((i) => i.type === 'accessory');
  const roomItems = inventory.filter((i) => i.type === 'room');

  const handleBuy = (item: InventoryItem) => {
    if (character.totalPoints < item.price) {
      alert(`씨앗 포인트가 부족합니다. (필요: ${item.price}P, 보유: ${character.totalPoints}P)\n작업이나 집중 세션을 완료해 포인트를 모아보세요!`);
      return;
    }
    sound.playSuccess();
    onPurchase(item);
  };

  return (
    <div className="space-y-5">
      {/* Points Banner */}
      <div className="bg-[#EDF4E4] p-3.5 rounded-2xl border border-[#B8CE90] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-4 h-4 text-[#586A41]" />
          <span className="text-xs font-bold text-[#586A41]">미루미 씨앗 상점</span>
        </div>
        <div className="text-sm font-black text-[#586A41]">
          보유: 🌱 {character.totalPoints}P
        </div>
      </div>

      {/* Accessories Section */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-[#292D27] flex items-center justify-between">
          <span>캐릭터 악세서리</span>
          <span className="text-[11px] text-[#858B7E]">미루미가 직접 착용해요</span>
        </h4>

        <div className="grid grid-cols-1 gap-2">
          {accessories.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3 rounded-2xl border border-[#E3DFD4] shadow-soft flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F7F2] border border-[#E8E5D8] flex items-center justify-center text-lg">
                  {item.icon}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#292D27]">{item.name}</h5>
                  <p className="text-[11px] text-[#686E63]">{item.description}</p>
                </div>
              </div>

              <div>
                {item.isPurchased ? (
                  <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-[#F4F2E9] text-[#778C59] flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>보유중</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    className="min-h-[36px] px-3 rounded-xl bg-[#778C59] text-white text-xs font-bold active:scale-95 shadow-soft"
                  >
                    🌱 {item.price}P
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Decor Items Section */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-[#292D27] flex items-center justify-between">
          <span>방 꾸미기 소품</span>
          <span className="text-[11px] text-[#858B7E]">미루미의 공간을 채워주세요</span>
        </h4>

        <div className="grid grid-cols-1 gap-2">
          {roomItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3 rounded-2xl border border-[#E3DFD4] shadow-soft flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F7F2] border border-[#E8E5D8] flex items-center justify-center text-lg">
                  {item.icon}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#292D27]">{item.name}</h5>
                  <p className="text-[11px] text-[#686E63]">{item.description}</p>
                </div>
              </div>

              <div>
                {item.isPurchased ? (
                  <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-[#F4F2E9] text-[#778C59] flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>보유중</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    className="min-h-[36px] px-3 rounded-xl bg-[#778C59] text-white text-xs font-bold active:scale-95 shadow-soft"
                  >
                    🌱 {item.price}P
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
