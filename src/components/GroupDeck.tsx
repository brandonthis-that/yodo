import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { CoinIcon } from '@/src/components/CoinIcon';
import { inkOn } from '@/src/theme';

const PEEK = 28;
const PEEK_STEP = 16;
const CARD_HEIGHT = 156;
const SWIPE_DISTANCE = 140;
const SPRING = { damping: 22, stiffness: 240, mass: 0.7 };

export type GroupDeckItem = {
  id: string;
  name: string;
  dueTime: string;
  done: number;
  total: number;
  bonusLabel: string;
  bonusEarned: boolean;
  color: string;
};

type Props = {
  items: GroupDeckItem[];
};

export function GroupDeck({ items }: Props) {
  const count = items.length;
  const [index, setIndex] = useState(0);
  const indexSV = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const countSV = useSharedValue(count);
  const indexRef = useRef(0);
  indexRef.current = index;

  const peekHeight = count <= 1 ? 0 : PEEK + Math.max(0, Math.min(count - 2, 1)) * PEEK_STEP;

  useEffect(() => {
    countSV.value = count;
  }, [count, countSV]);

  useEffect(() => {
    if (count === 0) return;
    const next = Math.min(index, count - 1);
    if (next !== index) setIndex(next);
    indexSV.value = withSpring(next, SPRING);
  }, [count, index, indexSV]);

  const snapTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(count - 1, next));
      indexSV.value = withSpring(clamped, SPRING);
      if (clamped !== indexRef.current) setIndex(clamped);
    },
    [count, indexSV],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => shouldClaimSwipe(count, indexRef.current, gesture.dx, gesture.dy, 8),
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          shouldClaimSwipe(count, indexRef.current, gesture.dx, gesture.dy, 12),
        onPanResponderGrant: () => {
          dragStart.value = indexSV.value;
        },
        onPanResponderMove: (_, gesture) => {
          const raw = dragStart.value - gesture.dy / SWIPE_DISTANCE;
          const max = Math.max(0, countSV.value - 1);
          if (raw < 0) indexSV.value = raw * 0.22;
          else if (raw > max) indexSV.value = max + (raw - max) * 0.22;
          else indexSV.value = raw;
        },
        onPanResponderRelease: (_, gesture) => {
          const projected = dragStart.value - gesture.dy / SWIPE_DISTANCE - gesture.vy * 0.45;
          const tappedPeek =
            Math.abs(gesture.dx) < 10 &&
            Math.abs(gesture.dy) < 10 &&
            gesture.y0 > CARD_HEIGHT;
          if (tappedPeek) {
            snapTo(indexRef.current + 1);
            return;
          }
          snapTo(Math.round(projected));
        },
        onPanResponderTerminate: () => {
          snapTo(indexRef.current);
        },
        onPanResponderTerminationRequest: (_, gesture) => {
          if (indexRef.current <= 0 && gesture.dy > 0) return true;
          if (indexRef.current >= count - 1 && gesture.dy < 0) return true;
          return false;
        },
      }),
    [count, countSV, dragStart, indexSV, snapTo],
  );

  if (count === 0) return null;

  return (
    <View className="mb-2" collapsable={false}>
      <View
        {...(count > 1 ? panResponder.panHandlers : {})}
        className="relative"
        style={{ height: CARD_HEIGHT + peekHeight }}
        collapsable={false}
      >
        {items.map((item, itemIndex) => (
          <DeckCard key={item.id} item={item} itemIndex={itemIndex} count={count} indexSV={indexSV} />
        ))}
        {count > 1 && index < count - 1 && peekHeight > 0 ? (
          <Pressable
            onPress={() => snapTo(index + 1)}
            accessibilityRole="button"
            accessibilityLabel="Show next routine"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 50,
              height: peekHeight,
            }}
          />
        ) : null}
      </View>
    </View>
  );
}

function shouldClaimSwipe(count: number, index: number, dx: number, dy: number, threshold: number) {
  if (count <= 1) return false;
  if (Math.abs(dy) < threshold || Math.abs(dy) < Math.abs(dx) * 1.15) return false;
  if (index <= 0 && dy > 0) return false;
  if (index >= count - 1 && dy < 0) return false;
  return true;
}

function DeckCard({
  item,
  itemIndex,
  count,
  indexSV,
}: {
  item: GroupDeckItem;
  itemIndex: number;
  count: number;
  indexSV: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const rel = itemIndex - indexSV.value;
    const peek1 = count > 1 ? PEEK : 0;
    const peek2 = count > 2 ? PEEK + PEEK_STEP : peek1;
    const y = interpolate(rel, [-1.15, 0, 1, 2], [-CARD_HEIGHT * 0.22, 0, peek1, peek2], Extrapolation.CLAMP);
    const scale = interpolate(rel, [-1, 0, 1, 2], [0.98, 1, 0.97, 0.94], Extrapolation.CLAMP);
    const opacity = interpolate(rel, [-1.1, -0.35, 0, 2, 2.35], [0, 1, 1, 1, 0], Extrapolation.CLAMP);
    const z = rel < 0 ? 8 + rel : 20 - rel;

    return {
      opacity,
      zIndex: Math.round(z * 10),
      transform: [{ translateY: y }, { scale }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: CARD_HEIGHT,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 14,
          elevation: 4,
        },
        style,
      ]}
    >
      <GroupCard item={item} />
    </Animated.View>
  );
}

function GroupCard({ item }: { item: GroupDeckItem }) {
  const progress = item.total > 0 ? item.done / item.total : 0;
  const ink = inkOn(item.color);

  return (
    <View className="h-full overflow-hidden rounded-[26px]" style={{ backgroundColor: item.color }}>
      <View className="flex-1 justify-between px-5 py-4">
        <View>
          <Text className="text-[22px] font-medium tracking-tight" numberOfLines={1} style={{ color: ink.fg }}>
            {item.name}
          </Text>
          <Text className="mt-0.5 text-[13px]" style={{ color: ink.muted }}>
            Due {item.dueTime}
          </Text>
        </View>

        <View>
          <View className="mb-2 flex-row items-baseline justify-between">
            <Text className="text-[15px] tabular-nums" style={{ color: ink.fg }}>
              {item.done}/{item.total}
            </Text>
            <Text className="text-[13px]" style={{ color: ink.muted }}>
              {item.total === 1 ? 'task' : 'tasks'}
            </Text>
          </View>
          <View className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: ink.track }}>
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: item.bonusEarned || progress >= 1 ? ink.success : ink.fill,
              }}
            />
          </View>
          <View className="mt-2 flex-row items-center gap-1">
            <CoinIcon size={14} />
            <Text
              className="flex-1 text-[13px]"
              numberOfLines={1}
              style={{ color: item.bonusEarned ? ink.success : ink.muted }}
            >
              {item.bonusLabel}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
