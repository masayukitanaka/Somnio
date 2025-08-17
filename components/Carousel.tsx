import React from 'react';
import {
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  useSharedValue,
  SharedValue,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface CarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number, scrollX: SharedValue<number>) => React.ReactElement;
  itemWidth: number;
  spacing?: number;
  onSnapToItem?: (index: number, item: T) => void;
  showsHorizontalScrollIndicator?: boolean;
  contentContainerStyle?: any;
  style?: any;
}

export default function Carousel<T>({
  data,
  renderItem,
  itemWidth,
  spacing = 15,
  onSnapToItem,
  showsHorizontalScrollIndicator = false,
  contentContainerStyle,
  style,
}: CarouselProps<T>) {
  const scrollX = useSharedValue(0);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    scrollX.value = x;
    
    if (onSnapToItem) {
      // Calculate which item is currently centered
      const index = Math.round(x / (itemWidth + spacing));
      const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
      const item = data[clampedIndex];
      
      if (item) {
        onSnapToItem(clampedIndex, item);
      }
    }
  };


  const containerPadding = (screenWidth - itemWidth) / 2 - spacing;

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled={false}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      onScroll={onScroll}
      scrollEventThrottle={16}
      snapToInterval={itemWidth + spacing}
      decelerationRate="fast"
      contentContainerStyle={[
        {
          paddingHorizontal: containerPadding,
        },
        contentContainerStyle,
      ]}
      style={style}
    >
      {data.map((item, index) => (
        <React.Fragment key={index}>
          {renderItem(item, index, scrollX)}
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

export { type SharedValue };