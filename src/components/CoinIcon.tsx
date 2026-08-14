import { useId } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

const STAR =
  'M16.00 10.80 L17.07 13.68 L20.14 13.81 L17.73 15.71 L18.56 18.67 L16.00 16.97 L13.44 18.67 L14.27 15.71 L11.86 13.81 L14.93 13.68 Z';

type IconProps = {
  size?: number;
};

export function CoinIcon({ size = 22 }: IconProps) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const face = `coinFace${raw}`;
  const rim = `coinRim${raw}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessibilityLabel="coin">
      <Defs>
        <LinearGradient id={rim} x1="16" y1="3" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFE27A" />
          <Stop offset="0.45" stopColor="#F0B429" />
          <Stop offset="1" stopColor="#C56A08" />
        </LinearGradient>
        <RadialGradient id={face} cx="40%" cy="32%" r="68%">
          <Stop offset="0" stopColor="#FFF3B0" />
          <Stop offset="0.45" stopColor="#FFD24A" />
          <Stop offset="1" stopColor="#E8A317" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="16" cy="29.4" rx="9.5" ry="1.55" fill="rgba(0,0,0,0.16)" />
      <Circle cx="16" cy="17.55" r="12.15" fill="#B86A00" />
      <Circle cx="16" cy="15.15" r="12.15" fill={`url(#${rim})`} />
      <Circle cx="16" cy="15.15" r="12.15" fill="none" stroke="#8A4A00" strokeWidth="1.35" />
      <Circle cx="16" cy="15.15" r="9.55" fill={`url(#${face})`} />
      <Circle cx="16" cy="15.15" r="7.05" fill="none" stroke="#E09810" strokeWidth="1.2" />
      <Path d={STAR} fill="#D4890C" />
      <Ellipse
        cx="11.6"
        cy="11.1"
        rx="4.3"
        ry="2.05"
        fill="#fff"
        opacity={0.48}
        transform="rotate(-32 11.6 11.1)"
      />
    </Svg>
  );
}

type AmountProps = {
  value: number;
  size?: number;
  signed?: boolean;
  textClassName?: string;
};

export function CoinAmount({ value, size = 18, signed = false, textClassName }: AmountProps) {
  const label = signed && value > 0 ? `+${value}` : String(value);
  return (
    <View className="flex-row items-center gap-1" accessibilityLabel={`${label} coins`}>
      <CoinIcon size={size} />
      <Text
        className={
          textClassName ?? 'text-[15px] font-medium tabular-nums text-[#C47E0A] dark:text-[#FFD24A]'
        }
      >
        {label}
      </Text>
    </View>
  );
}
