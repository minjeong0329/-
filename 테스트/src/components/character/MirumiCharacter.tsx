import React from 'react';
import { CharacterExpression } from '../../types';

interface MirumiCharacterProps {
  expression: CharacterExpression;
  equippedAccessory?: string | null;
  size?: number; // width in px, default 140
  className?: string;
  onClick?: () => void;
}

export const MirumiCharacter: React.FC<MirumiCharacterProps> = ({
  expression,
  equippedAccessory,
  size = 140,
  className = '',
  onClick,
}) => {
  // Animation classes depending on expression state
  const getAnimationClass = () => {
    switch (expression) {
      case 'idle':
        return 'animate-float';
      case 'prompt':
        return 'animate-bounce-gentle';
      case 'delay_warning':
        return 'animate-pulse-subtle';
      case 'repeated_delay':
        return 'animate-wiggle';
      case 'focusing':
        return 'transition-transform duration-300 scale-105';
      case 'completed':
        return 'animate-bounce-gentle';
      case 'rest':
        return 'transition-all duration-500 opacity-95';
      case 'daily_goal_achieved':
        return 'animate-bounce-gentle';
      default:
        return 'animate-float';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95 ${getAnimationClass()} ${className}`}
      style={{ width: size, height: size * 1.15 }}
      title="미루미"
    >
      <svg
        viewBox="0 0 200 230"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow under feet */}
        <ellipse cx="100" cy="216" rx="48" ry="8" fill="#292D27" opacity="0.1" />

        {/* Character Organic Body */}
        {/* Soft sprout teardrop body shape */}
        <path
          d="M100 35 C155 35 178 95 172 155 C166 200 135 212 100 212 C65 212 34 200 28 155 C22 95 45 35 100 35 Z"
          fill="#D5E5B5"
          stroke="#778C59"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Belly subtle highlight */}
        <path
          d="M100 115 C132 115 146 150 142 185 C138 202 120 206 100 206 C80 206 62 202 58 185 C54 150 68 115 100 115 Z"
          fill="#E5F0D0"
          opacity="0.65"
        />

        {/* Sprout Leaves on Top of Head */}
        <g id="sprout-top">
          {/* Main Leaf */}
          <path
            d="M100 35 Q115 5 138 18 Q124 45 100 36"
            fill="#778C59"
            stroke="#586A41"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Secondary Leaf */}
          <path
            d="M100 35 Q84 10 68 24 Q82 46 100 36"
            fill="#94A876"
            stroke="#586A41"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Stem anchor */}
          <circle cx="100" cy="35" r="4" fill="#586A41" />
        </g>

        {/* Tiny Little Hands / Arms based on state */}
        {expression === 'prompt' && (
          <g id="arms-prompt">
            {/* Left arm waving high */}
            <path d="M42 125 Q20 90 28 80" stroke="#778C59" strokeWidth="6" strokeLinecap="round" />
            <circle cx="28" cy="80" r="7" fill="#D5E5B5" stroke="#778C59" strokeWidth="4" />
            {/* Right arm pointing forward */}
            <path d="M158 125 Q180 130 186 122" stroke="#778C59" strokeWidth="6" strokeLinecap="round" />
            <circle cx="186" cy="122" r="7" fill="#D5E5B5" stroke="#778C59" strokeWidth="4" />
          </g>
        )}

        {(expression === 'delay_warning' || expression === 'repeated_delay') && (
          <g id="arms-warning">
            {/* Crossed arms / hands on hips */}
            <path d="M38 135 Q20 155 45 160" stroke="#778C59" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M162 135 Q180 155 155 160" stroke="#778C59" strokeWidth="6" strokeLinecap="round" fill="none" />
            {expression === 'repeated_delay' && (
              /* Little clock held in hand */
              <g transform="translate(148, 110)">
                <circle cx="18" cy="18" r="16" fill="#FFFFFF" stroke="#292D27" strokeWidth="3" />
                <line x1="18" y1="18" x2="18" y2="9" stroke="#E06C75" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="18" y1="18" x2="25" y2="18" stroke="#292D27" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="18" cy="18" r="2.5" fill="#292D27" />
              </g>
            )}
          </g>
        )}

        {expression === 'completed' && (
          <g id="arms-celebrate">
            {/* Both arms raised up */}
            <path d="M40 120 Q16 85 24 72" stroke="#778C59" strokeWidth="6" strokeLinecap="round" fill="none" />
            <circle cx="24" cy="72" r="7" fill="#D5E5B5" stroke="#778C59" strokeWidth="4" />
            <path d="M160 120 Q184 85 176 72" stroke="#778C59" strokeWidth="6" strokeLinecap="round" fill="none" />
            <circle cx="176" cy="72" r="7" fill="#D5E5B5" stroke="#778C59" strokeWidth="4" />
            {/* Celebration sparkles around */}
            <path d="M30 45 L35 48 L32 54 L27 51 Z" fill="#F0AA95" />
            <path d="M170 42 L176 46 L171 52 L166 48 Z" fill="#D08770" />
            <circle cx="98" cy="12" r="4" fill="#F0AA95" />
          </g>
        )}

        {expression === 'focusing' && (
          <g id="arms-focusing">
            {/* Clenched hands of determination */}
            <path d="M40 135 Q30 160 62 165" stroke="#778C59" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M160 135 Q170 160 138 165" stroke="#778C59" strokeWidth="6" strokeLinecap="round" fill="none" />
            <circle cx="62" cy="165" r="7" fill="#D5E5B5" stroke="#778C59" strokeWidth="4" />
            <circle cx="138" cy="165" r="7" fill="#D5E5B5" stroke="#778C59" strokeWidth="4" />
            {/* Pencil in right hand */}
            <path d="M140 168 L154 182" stroke="#586A41" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {(expression === 'idle' || expression === 'rest' || expression === 'daily_goal_achieved') && (
          <g id="arms-idle">
            {/* Relaxed hands at sides */}
            <circle cx="36" cy="148" r="7" fill="#D5E5B5" stroke="#778C59" strokeWidth="4" />
            <circle cx="164" cy="148" r="7" fill="#D5E5B5" stroke="#778C59" strokeWidth="4" />
          </g>
        )}

        {/* Eyes & Eyebrows & Cheeks */}
        {/* Cheeks: Always soft peach coral */}
        <ellipse cx="64" cy="136" rx="9" ry="5.5" fill="#F0AA95" opacity="0.85" />
        <ellipse cx="136" cy="136" rx="9" ry="5.5" fill="#F0AA95" opacity="0.85" />

        {/* Expressions Logic */}
        {expression === 'idle' && (
          <g id="face-idle">
            {/* Happy Blinking Round Eyes */}
            <circle cx="76" cy="116" r="7" fill="#292D27" />
            <circle cx="124" cy="116" r="7" fill="#292D27" />
            <circle cx="78.5" cy="113.5" r="2.5" fill="#FFFFFF" />
            <circle cx="126.5" cy="113.5" r="2.5" fill="#FFFFFF" />
            {/* Gentle Smile */}
            <path d="M88 136 Q100 148 112 136" fill="none" stroke="#292D27" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {expression === 'prompt' && (
          <g id="face-prompt">
            {/* Wide Enthusiastic Eyes */}
            <circle cx="75" cy="114" r="8" fill="#292D27" />
            <circle cx="125" cy="114" r="8" fill="#292D27" />
            <circle cx="78" cy="111" r="3" fill="#FFFFFF" />
            <circle cx="128" cy="111" r="3" fill="#FFFFFF" />
            {/* Energetic open smile */}
            <path d="M86 132 Q100 152 114 132 Z" fill="#292D27" />
            <path d="M92 142 Q100 148 108 142" fill="#F0AA95" />
          </g>
        )}

        {expression === 'delay_warning' && (
          <g id="face-delay-warning">
            {/* Skeptical / Half-closed eyes */}
            <path d="M68 116 Q76 110 84 116" fill="none" stroke="#292D27" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="76" cy="118" r="4" fill="#292D27" />
            <circle cx="124" cy="116" r="7" fill="#292D27" />
            <circle cx="126" cy="113.5" r="2" fill="#FFFFFF" />
            {/* Raised left eyebrow */}
            <path d="M68 104 Q76 98 84 103" fill="none" stroke="#292D27" strokeWidth="3" strokeLinecap="round" />
            <path d="M116 104 Q124 104 132 106" fill="none" stroke="#292D27" strokeWidth="3" strokeLinecap="round" />
            {/* Skeptical wavy mouth */}
            <path d="M88 140 Q98 136 112 141" fill="none" stroke="#292D27" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {expression === 'repeated_delay' && (
          <g id="face-repeated-delay">
            {/* Flustered sweat drop */}
            <path d="M142 85 Q148 76 150 85 Q150 90 145 90 Q142 90 142 85 Z" fill="#5E81AC" />
            {/* Squinting / dramatic concerned eyes */}
            <path d="M68 114 L84 122 M68 122 L84 114" stroke="#292D27" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M116 114 L132 122 M116 122 L132 114" stroke="#292D27" strokeWidth="3.5" strokeLinecap="round" />
            {/* Worried open mouth */}
            <ellipse cx="100" cy="142" rx="7" ry="10" fill="#292D27" />
          </g>
        )}

        {expression === 'focusing' && (
          <g id="face-focusing">
            {/* Fiery determined eyes */}
            <path d="M68 116 L84 118" stroke="#292D27" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M116 118 L132 116" stroke="#292D27" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="76" cy="122" r="5" fill="#292D27" />
            <circle cx="124" cy="122" r="5" fill="#292D27" />
            {/* Determined tight mouth */}
            <line x1="90" y1="140" x2="110" y2="140" stroke="#292D27" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}

        {expression === 'completed' && (
          <g id="face-completed">
            {/* Star sparkle / happy curve eyes */}
            <path d="M66 116 Q76 102 86 116" fill="none" stroke="#292D27" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M114 116 Q124 102 134 116" fill="none" stroke="#292D27" strokeWidth="4.5" strokeLinecap="round" />
            {/* Big beaming smile */}
            <path d="M84 130 Q100 156 116 130 Z" fill="#292D27" />
            <path d="M92 144 Q100 152 108 144" fill="#F0AA95" />
          </g>
        )}

        {expression === 'rest' && (
          <g id="face-rest">
            {/* Cozy sleeping / resting curved eyes */}
            <path d="M68 118 Q76 126 84 118" fill="none" stroke="#292D27" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M116 118 Q124 126 132 118" fill="none" stroke="#292D27" strokeWidth="3.5" strokeLinecap="round" />
            {/* Relaxed content mouth */}
            <path d="M94 136 Q100 142 106 136" fill="none" stroke="#292D27" strokeWidth="3" strokeLinecap="round" />
            {/* Cozy tea mug in front */}
            <g transform="translate(85, 175)">
              <rect x="0" y="4" width="30" height="24" rx="4" fill="#FFFFFF" stroke="#778C59" strokeWidth="2.5" />
              <path d="M30 10 Q38 10 38 16 Q38 22 30 22" fill="none" stroke="#778C59" strokeWidth="2.5" />
              {/* Steam */}
              <path d="M10 0 Q12 -6 10 -10" fill="none" stroke="#94A876" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20 -2 Q22 -8 20 -12" fill="none" stroke="#94A876" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </g>
        )}

        {expression === 'daily_goal_achieved' && (
          <g id="face-goal-achieved">
            {/* Proud joy eyes */}
            <path d="M66 114 Q76 102 86 114" fill="none" stroke="#292D27" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M114 114 Q124 102 134 114" fill="none" stroke="#292D27" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M84 130 Q100 154 116 130 Z" fill="#292D27" />
            <path d="M92 144 Q100 150 108 144" fill="#F0AA95" />
            {/* Proud medal around neck */}
            <path d="M85 168 L100 188 L115 168" stroke="#E06C75" strokeWidth="4" fill="none" />
            <circle cx="100" cy="192" r="10" fill="#EBCB8B" stroke="#D08770" strokeWidth="2.5" />
            <text x="96" y="196" fontSize="10" fontWeight="bold" fill="#292D27">★</text>
          </g>
        )}

        {/* Equipped Accessories Overlay */}
        {equippedAccessory === 'acc_glasses' && (
          <g id="accessory-glasses">
            <circle cx="76" cy="116" r="16" fill="none" stroke="#292D27" strokeWidth="3.5" />
            <circle cx="124" cy="116" r="16" fill="none" stroke="#292D27" strokeWidth="3.5" />
            <line x1="92" y1="116" x2="108" y2="116" stroke="#292D27" strokeWidth="3.5" />
            <line x1="60" y1="116" x2="48" y2="114" stroke="#292D27" strokeWidth="3" />
            <line x1="140" y1="116" x2="152" y2="114" stroke="#292D27" strokeWidth="3" />
          </g>
        )}

        {equippedAccessory === 'acc_headband' && (
          <g id="accessory-headband">
            <rect x="42" y="82" width="116" height="12" rx="6" fill="#E06C75" stroke="#BF616A" strokeWidth="2" />
            <circle cx="100" cy="88" r="4" fill="#FFFFFF" />
            {/* Headband tail */}
            <path d="M152 86 Q168 92 174 105" fill="none" stroke="#E06C75" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {equippedAccessory === 'acc_crown' && (
          <g id="accessory-crown" transform="translate(62, 10)">
            <path
              d="M0 32 L15 12 L38 24 L61 12 L76 32 Z"
              fill="#EBCB8B"
              stroke="#D08770"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <circle cx="15" cy="12" r="3" fill="#E06C75" />
            <circle cx="38" cy="24" r="3" fill="#5E81AC" />
            <circle cx="61" cy="12" r="3" fill="#E06C75" />
          </g>
        )}

        {equippedAccessory === 'acc_scarf' && (
          <g id="accessory-scarf">
            <path
              d="M52 165 C70 178 130 178 148 165 C140 185 60 185 52 165 Z"
              fill="#BF616A"
              stroke="#882C35"
              strokeWidth="3"
            />
            {/* Scarf hanging tail */}
            <path d="M125 174 L128 205 L144 205 L138 174 Z" fill="#BF616A" stroke="#882C35" strokeWidth="2.5" />
          </g>
        )}

        {equippedAccessory === 'acc_party_hat' && (
          <g id="accessory-party-hat" transform="translate(85, -2)">
            <path d="M15 0 L0 42 L30 42 Z" fill="#F0AA95" stroke="#DB8E78" strokeWidth="2.5" />
            <circle cx="15" cy="0" r="5" fill="#EBCB8B" />
            <line x1="5" y1="20" x2="25" y2="20" stroke="#778C59" strokeWidth="2" />
            <line x1="8" y1="32" x2="22" y2="32" stroke="#5E81AC" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
};
