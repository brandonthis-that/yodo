import { View } from 'react-native';
import { CoinIcon } from '@/src/components/CoinIcon';

type Props = {
  size?: number;
};

export function CoinStack({ size = 72 }: Props) {
  const back = Math.round(size * 0.78);

  return (
    <View style={{ width: size + 18, height: size + 10 }}>
      <View className="absolute" style={{ left: size * 0.28, top: 8, opacity: 0.55, transform: [{ rotate: '16deg' }] }}>
        <CoinIcon size={back} />
      </View>
      <View className="absolute" style={{ left: 0, top: 10, opacity: 0.7, transform: [{ rotate: '-14deg' }] }}>
        <CoinIcon size={back} />
      </View>
      <View className="absolute" style={{ left: size * 0.1, top: 0 }}>
        <CoinIcon size={size} />
      </View>
    </View>
  );
}
