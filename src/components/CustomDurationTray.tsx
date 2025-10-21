// src/components/CustomDurationTray.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import Tray from './Tray';
import { colors } from '../styles';
import { useTheme } from '../context/ThemeContext';
import CircularTimePicker from './CircularTimePicker';

interface CustomDurationTrayProps {
  visible: boolean;
  onClose: () => void;
  onBack?: () => void;
  selectedDuration: number; // in minutes
  onDurationChange: (duration: number) => void;
  useCircularPicker?: boolean; // New prop to enable circular picker
}

const CustomDurationTray: React.FC<CustomDurationTrayProps> = ({
  visible,
  onClose,
  onBack,
  selectedDuration,
  onDurationChange,
  useCircularPicker = false,
}) => {
  const { theme } = useTheme();
  
  // Force dark theme for this component
  const darkTheme = {
    background: '#1A1A1A',
    surface: '#2A2A2A',
    border: '#3A3A3A',
    textPrimary: '#FFFFFF',
    textSecondary: '#CCCCCC',
    textTertiary: '#999999',
    primary: '#FF6B9D',
  };
  const [hours, setHours] = useState(Math.floor(selectedDuration / 60));
  const [minutes, setMinutes] = useState(selectedDuration % 60);

  const [circularPickerValue, setCircularPickerValue] = useState(selectedDuration);

  // Sync internal state when selectedDuration prop changes
  React.useEffect(() => {
    setHours(Math.floor(selectedDuration / 60));
    setMinutes(selectedDuration % 60);
    setCircularPickerValue(selectedDuration);
  }, [selectedDuration]);

  const handleClose = () => {
    // Apply changes when closing
    const totalMinutes = useCircularPicker ? circularPickerValue : hours * 60 + minutes;
    onDurationChange(totalMinutes);
    onClose();
  };

  const formatDuration = () => {
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  const SphericalPicker = ({ 
    data, 
    selectedValue, 
    onValueChange, 
    unit 
  }: {
    data: number[],
    selectedValue: number,
    onValueChange: (value: number) => void,
    unit: string
  }) => {
    const scrollY = useSharedValue(0);
    const scrollRef = useRef<any>(null);
    const itemHeight = 40;
    const wheelHeight = 200;
    const visibleItems = 5;
    
    // Get initial index
    const selectedIndex = data.indexOf(selectedValue);
    const initialScrollY = selectedIndex * itemHeight;
    
    React.useEffect(() => {
      scrollY.value = initialScrollY;
      scrollRef.current?.scrollTo({ y: initialScrollY, animated: false });
    }, []);

    const scrollHandler = useAnimatedScrollHandler({
      onScroll: (event) => {
        scrollY.value = event.contentOffset.y;
      },
      onMomentumEnd: (event) => {
        const index = Math.round(event.contentOffset.y / itemHeight);
        const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
        runOnJS(onValueChange)(data[clampedIndex]);
      },
    });

    const renderItem = (value: number, index: number) => {
      const animatedStyle = useAnimatedStyle(() => {
        const centerY = wheelHeight / 2;
        const itemCenterY = (index * itemHeight) + (itemHeight / 2);
        const scrollOffset = scrollY.value + centerY;
        const distanceFromCenter = itemCenterY - scrollOffset;
        
        // Create cylindrical effect
        const maxDistance = itemHeight * 2.5;
        const normalizedDistance = Math.abs(distanceFromCenter) / maxDistance;
        
        const rotateX = interpolate(
          distanceFromCenter,
          [-maxDistance, 0, maxDistance],
          [45, 0, -45],
          Extrapolate.CLAMP
        );

        const opacity = interpolate(
          normalizedDistance,
          [0, 0.5, 1],
          [1, 0.8, 0.3],
          Extrapolate.CLAMP
        );

        const scale = interpolate(
          normalizedDistance,
          [0, 0.5, 1],
          [1, 0.95, 0.8],
          Extrapolate.CLAMP
        );

        const translateY = interpolate(
          distanceFromCenter,
          [-maxDistance, 0, maxDistance],
          [10, 0, -10],
          Extrapolate.CLAMP
        );

        return {
          transform: [
            { perspective: 1000 },
            { rotateX: `${rotateX}deg` },
            { scale },
            { translateY },
          ],
          opacity,
        };
      });

      // Check if this item is in the center
      const isCenterItem = useAnimatedStyle(() => {
        const centerY = wheelHeight / 2;
        const itemCenterY = (index * itemHeight) + (itemHeight / 2);
        const scrollOffset = scrollY.value + centerY;
        const distanceFromCenter = Math.abs(itemCenterY - scrollOffset);
        const isCenter = distanceFromCenter < itemHeight / 2;
        
        return {
          // This will be used to determine text styling
        };
      });
      
      return (
        <Animated.View key={value} style={[styles.pickerItem, animatedStyle]}>
          <Animated.View style={isCenterItem}>
            <Text style={[
              styles.pickerItemText,
              { color: darkTheme.textPrimary }
            ]}>
              {value}
            </Text>
            {/* Show unit only for center item - we'll handle this differently */}
          </Animated.View>
        </Animated.View>
      );
    };

    // Find center item for unit display
    const centerItemStyle = useAnimatedStyle(() => {
      const centerIndex = Math.round(scrollY.value / itemHeight);
      const centerValue = data[centerIndex] || 0;
      return {};
    });

    return (
      <View style={styles.pickerSection}>
        <View style={styles.pickerWheel}>
          {/* Center selection indicator */}
          <View style={styles.centerIndicator} />
          
          {/* Unit label overlay for center item */}
          <Animated.View style={[styles.centerUnitLabel, centerItemStyle]}>
            <Text style={styles.unitText}>{unit}</Text>
          </Animated.View>
          
          <Animated.ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={itemHeight}
            decelerationRate="fast"
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingVertical: wheelHeight / 2, // Center the first and last items
            }}
          >
            {data.map((value, index) => renderItem(value, index))}
          </Animated.ScrollView>
        </View>
      </View>
    );
  };

  const renderTimePicker = () => {
    const hoursData = Array.from({ length: 24 }, (_, i) => i);
    const minutesData = Array.from({ length: 60 }, (_, i) => i);

    return (
      <View style={styles.pickerContainer}>
        <SphericalPicker
          data={hoursData}
          selectedValue={hours}
          onValueChange={setHours}
          unit="hours"
        />
        <SphericalPicker
          data={minutesData}
          selectedValue={minutes}
          onValueChange={setMinutes}
          unit="minutes"
        />
      </View>
    );
  };

  return (
    <Tray
      visible={visible}
      onClose={handleClose}
      title="Set custom time"
      height="short"
    >
      <View style={styles.container}>
        {/* Quick Presets */}
        <View style={styles.presetsSection}>
          <Text style={[styles.sectionTitle, { color: darkTheme.textPrimary }]}>Quick Select</Text>
          <View style={styles.presetButtons}>
            {[
              { label: '15m', value: 15 },
              { label: '30m', value: 30 },
              { label: '1h', value: 60 },
              { label: '1h 30m', value: 90 },
              { label: '2h', value: 120 },
              { label: '3h', value: 180 },
            ].map((preset) => (
              <TouchableOpacity
                key={preset.value}
                style={[
                  styles.presetButton,
                  { backgroundColor: darkTheme.surface },
                  (useCircularPicker ? circularPickerValue : (hours * 60 + minutes)) === preset.value && { 
                    backgroundColor: darkTheme.primary 
                  }
                ]}
                onPress={() => {
                  if (useCircularPicker) {
                    setCircularPickerValue(preset.value);
                    onDurationChange(preset.value); // Real-time sync
                  } else {
                    setHours(Math.floor(preset.value / 60));
                    setMinutes(preset.value % 60);
                  }
                }}
              >
                <Text style={[
                  styles.presetButtonText,
                  { color: (useCircularPicker ? circularPickerValue : (hours * 60 + minutes)) === preset.value ? '#FFFFFF' : darkTheme.textPrimary }
                ]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Time Picker */}
        <View style={styles.customSection}>
          {useCircularPicker ? (
            <CircularTimePicker
              initialMinutes={circularPickerValue}
              onTimeChange={(minutes) => {
                setCircularPickerValue(minutes);
                onDurationChange(minutes); // Real-time sync
              }}
            />
          ) : (
            renderTimePicker()
          )}
        </View>
      </View>
    </Tray>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  presetsSection: {
    marginBottom: 16,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 6,
  },
  presetButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  customSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 20,
    flex: 1,
    height: 200,
    alignItems: 'center',
  },
  pickerSection: {
    flex: 1,
    height: 200,
  },
  pickerWheel: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  centerIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
    zIndex: 1,
    marginTop: -20,
  },
  centerUnitLabel: {
    position: 'absolute',
    top: '50%',
    right: 20,
    marginTop: -10,
    zIndex: 2,
  },
  unitText: {
    fontSize: 14,
    color: '#EC4899',
    fontWeight: '600',
  },
  pickerItem: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  pickerItemText: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CustomDurationTray;