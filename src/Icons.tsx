import Svg, { Circle, Path } from 'react-native-svg';

type IconProps = { size?: number; color?: string };

const stroke = (color: string, width: number) => ({
  fill: 'none',
  stroke: color,
  strokeWidth: width,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function Globe({ size = 14, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2)}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M2 12h20" />
      <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Svg>
  );
}

export function ChevronLeft({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2.2)}>
      <Path d="M15 18l-6-6 6-6" />
    </Svg>
  );
}

export function ChevronRight({ size = 22, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2.2)}>
      <Path d="M9 18l6-6-6-6" />
    </Svg>
  );
}

export function Check({ size = 26, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2.6)}>
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

export function Cross({ size = 24, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2.6)}>
      <Path d="M18 6L6 18" />
      <Path d="M6 6l12 12" />
    </Svg>
  );
}

export function Replay({ size = 20, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2.2)}>
      <Path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <Path d="M21 3v5h-5" />
      <Path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <Path d="M3 21v-5h5" />
    </Svg>
  );
}

const STAR = 'M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.53L12 17.49l-5.87 3.08 1.12-6.53L2.5 9.41l6.56-.95L12 2.5z';

export function Star({ size = 28, filled = false, color = '#FFC93C', emptyColor = 'rgba(255,255,255,0.35)' }: IconProps & { filled?: boolean; emptyColor?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={STAR}
        fill={filled ? color : 'none'}
        stroke={filled ? color : emptyColor}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArrowRight({ size = 20, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...stroke(color, 2.2)}>
      <Path d="M5 12h14" />
      <Path d="M13 6l6 6-6 6" />
    </Svg>
  );
}
