import React from 'react';
import { AvatarConfig } from '../types';

interface PixelAvatarProps {
  config: AvatarConfig;
  size?: number;
  animated?: boolean;
  showLevelUp?: boolean;
}

const PixelAvatar: React.FC<PixelAvatarProps> = ({ 
  config, 
  size = 64, 
  animated = false,
  showLevelUp = false 
}) => {
  const pixelSize = size / 16; // 16x16ピクセルベース

  // ドット絵スタイル
  const pixelStyle = {
    width: `${size}px`,
    height: `${size}px`,
    imageRendering: 'pixelated' as const,
    position: 'relative' as const,
    display: 'inline-block'
  };

  // 基本キャラクター（16x16のボックスシャドウ）
  const createPixelChar = () => {
    
    // 頭部 (上部4行)
    const headPixels = [
      // 行1: 帽子/髪の輪郭
      [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
      // 行2: 髪の毛
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      // 行3: 顔の輪郭
      [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
      // 行4: 目と顔
      [0,1,2,2,3,2,2,2,2,2,2,3,2,2,1,0]
    ];

    // 胴体 (中央8行)
    const bodyPixels = [
      // 行5-6: 首/肩
      [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
      [0,1,4,4,4,4,4,4,4,4,4,4,4,4,1,0],
      // 行7-10: メインボディ
      [0,1,4,4,4,4,4,5,5,4,4,4,4,4,1,0],
      [0,1,4,4,4,4,5,5,5,5,4,4,4,4,1,0],
      [0,1,4,4,4,4,4,5,5,4,4,4,4,4,1,0],
      [0,1,4,4,4,4,4,4,4,4,4,4,4,4,1,0],
      // 行11-12: 腰部
      [0,0,1,4,4,4,4,4,4,4,4,4,4,1,0,0],
      [0,0,1,1,4,4,4,4,4,4,4,4,1,1,0,0]
    ];

    // 脚部 (下部4行)
    const legPixels = [
      [0,0,0,1,1,4,4,4,4,4,4,1,1,0,0,0],
      [0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0],
      [0,0,0,1,4,4,4,0,0,4,4,4,1,0,0,0],
      [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0]
    ];

    const allPixels = [...headPixels, ...bodyPixels, ...legPixels];
    
    // 色の定義
    const colors = {
      0: 'transparent',
      1: '#000000',           // 輪郭
      2: config.skinTone,     // 肌
      3: config.eyeColor,     // 目
      4: config.baseColor,    // 服
      5: getAccessoryColor()  // アクセサリー色
    };

    // ボックスシャドウ用の文字列生成
    let boxShadow = '';
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const colorKey = allPixels[y][x];
        if (colorKey !== 0) {
          const color = colors[colorKey as keyof typeof colors];
          if (boxShadow) boxShadow += ', ';
          boxShadow += `${x * pixelSize}px ${y * pixelSize}px 0 ${color}`;
        }
      }
    }

    return boxShadow;
  };

  // アクセサリーの色を取得
  const getAccessoryColor = () => {
    switch (config.accessory) {
      case 'glasses': return '#333333';
      case 'hat': return '#8B4513';
      case 'beret': return '#8B008B';
      case 'crown': return '#FFD700';
      case 'chef_hat': return '#FFFFFF';
      case 'wizard_hat': return '#4B0082';
      default: return config.baseColor;
    }
  };

  // オーラエフェクト
  const getAuraEffect = () => {
    if (!config.aura || config.aura === 'none') return {};
    
    const auraStyles = {
      glow: {
        filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))',
        animation: animated ? 'pulse 2s infinite' : undefined
      },
      sparkle: {
        filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.8))',
        animation: animated ? 'sparkle 1.5s infinite alternate' : undefined
      },
      radiance: {
        filter: 'drop-shadow(0 0 16px rgba(251, 191, 36, 1.0))',
        animation: animated ? 'radiance 1s infinite alternate' : undefined
      },
      wisdom: {
        filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.7))',
      },
      tech: {
        filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))',
      },
      creative: {
        filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.9))',
      }
    };

    return auraStyles[config.aura as keyof typeof auraStyles] || {};
  };

  // 武器/道具のアイコン
  const getWeaponEmoji = () => {
    switch (config.weapon) {
      case 'sword': return '⚔️';
      case 'book': return '📚';
      case 'brush': return '🖌️';
      case 'wrench': return '🔧';
      case 'coin': return '🪙';
      case 'knife': return '🔪';
      case 'staff': return '🪄';
      case 'hammer': return '🔨';
      case 'lyre': return '🎵';
      default: return null;
    }
  };

  return (
    <div className="relative inline-block">
      {/* レベルアップエフェクト */}
      {showLevelUp && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-yellow-400 font-bold animate-ping text-lg">
            ✨ LEVEL UP! ✨
          </div>
        </div>
      )}
      
      {/* メインキャラクター */}
      <div
        style={{
          ...pixelStyle,
          ...getAuraEffect(),
          boxShadow: createPixelChar()
        }}
        className={showLevelUp ? 'animate-bounce' : ''}
      />
      
      {/* 武器/道具 */}
      {config.weapon && (
        <div 
          className="absolute -bottom-2 -right-2 text-lg"
          style={{
            animation: animated ? 'float 2s ease-in-out infinite' : undefined
          }}
        >
          {getWeaponEmoji()}
        </div>
      )}

      {/* CSS アニメーション */}
      <style>
        {`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes sparkle {
          0% { filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.8)) hue-rotate(0deg); }
          100% { filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.8)) hue-rotate(360deg); }
        }
        
        @keyframes radiance {
          0% { filter: drop-shadow(0 0 16px rgba(251, 191, 36, 1.0)) brightness(1); }
          100% { filter: drop-shadow(0 0 20px rgba(251, 191, 36, 1.0)) brightness(1.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        `}
      </style>
    </div>
  );
};

export default PixelAvatar;