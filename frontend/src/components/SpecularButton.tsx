'use client';

import { 
  useEffect, 
  useRef, 
  useState, 
  type ButtonHTMLAttributes, 
  type ReactNode,
  type MouseEvent 
} from 'react';

export type SpecularButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZES: Record<SpecularButtonSize, string> = {
  xs: 'px-3 py-1.5 text-xs',
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base'
};

export interface SpecularButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  children?: ReactNode;
  size?: SpecularButtonSize;
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  idleIntensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  glow?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function SpecularButton({
  children = 'Forecast',
  size = 'xs',
  radius = 10,
  tint = '#4f46e5',
  tintOpacity = 1,
  blur = 0,
  textColor = '#ffffff',
  lineColor = '#ffffff',
  baseColor = '#818cf8',
  intensity = 1.5,
  idleIntensity = 0.5,
  shineSize = 60,
  shineFade = 40,
  thickness = 1.5,
  glow = 1.2,
  speed = 0.4,
  followMouse = true,
  proximity = 250,
  autoAnimate = true,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  style,
  ...rest
}: SpecularButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number; isHovered: boolean; angle: number }>({
    x: 50,
    y: 50,
    isHovered: false,
    angle: 0
  });

  // Smooth auto-animating specular loop
  useEffect(() => {
    if (!autoAnimate) return;
    let animId: number;
    const start = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - start) / 1000;
      // Rotate specular angle smoothly (degrees)
      const currentAngle = (elapsed * (speed * 120)) % 360;
      setCoords(prev => {
        if (prev.isHovered && followMouse) return prev; // Mouse takes priority when hovered
        return {
          ...prev,
          angle: currentAngle,
          // Calculate perimeter point from angle
          x: 50 + 50 * Math.cos((currentAngle * Math.PI) / 180),
          y: 50 + 50 * Math.sin((currentAngle * Math.PI) / 180)
        };
      });
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [autoAnimate, speed, followMouse]);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || !followMouse || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Calculate angle from center
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;

    setCoords({ x, y, isHovered: true, angle });
  };

  const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
    handleMouseMove(e);
  };

  const handleMouseLeave = () => {
    setCoords(prev => ({ ...prev, isHovered: false }));
  };

  const currentIntensity = coords.isHovered ? intensity : idleIntensity;

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative isolate inline-flex items-center justify-center gap-1.5 font-bold leading-none tracking-tight select-none outline-none transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden cursor-pointer ${
        SIZES[size] ?? SIZES.xs
      } ${className}`}
      style={{
        borderRadius: `${radius}px`,
        backgroundColor: tint,
        color: textColor,
        boxShadow: coords.isHovered
          ? `0 0 16px ${baseColor}66, 0 4px 12px rgba(0,0,0,0.15)`
          : `0 1px 3px rgba(0,0,0,0.1)`,
        ...style
      }}
      {...rest}
    >
      {/* Specular Rim Border: Conic + Radial Specular Highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-300"
        style={{
          borderRadius: `${radius}px`,
          padding: `${thickness}px`,
          background: `conic-gradient(from ${coords.angle}deg at ${coords.x}% ${coords.y}%, 
            transparent 0deg, 
            ${lineColor} 25deg, 
            ${baseColor} 45deg, 
            transparent 70deg, 
            transparent 360deg)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: currentIntensity
        }}
      />

      {/* Internal Glass Reflection / Specular Pool */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-200"
        style={{
          borderRadius: `${radius}px`,
          background: `radial-gradient(circle ${shineSize}px at ${coords.x}% ${coords.y}%, rgba(255,255,255,${
            coords.isHovered ? 0.35 : 0.15
          }), transparent 75%)`,
          opacity: currentIntensity
        }}
      />

      {/* Subtle Rim Edge Light Sweep */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] border border-white/20 transition-colors duration-200 group-hover:border-white/40"
        style={{ borderRadius: `${radius}px` }}
      />

      {/* Button Content */}
      <span className="relative z-[2] inline-flex items-center gap-1.5 drop-shadow-xs">
        {children}
      </span>
    </button>
  );
}
