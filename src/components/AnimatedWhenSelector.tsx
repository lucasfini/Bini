// src/components/AnimatedWhenSelector.tsx - iOS-Style Time & Date Picker
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Modal,
  Platform,
  Haptics,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ITEM_HEIGHT = 44; // iOS standard row height
const VISIBLE_ITEMS = 5; // Show 5 items for better iOS feel
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface AnimatedWhenSelectorProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  durationMinutes: number;
}

const AnimatedWhenSelector: React.FC<AnimatedWhenSelectorProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  durationMinutes,
}) => {
  const [showCalendarTray, setShowCalendarTray] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values for the time picker wheel
  const scrollY = useSharedValue(0);
  const calendarButtonScale = useSharedValue(1);

  // iOS Human Interface Guidelines theme
  const theme = {
    // iOS system colors
    systemBackground: '#FFFFFF',
    secondarySystemBackground: '#F2F2F7',
    tertiarySystemBackground: '#FFFFFF',
    systemBlue: '#007AFF',
    systemGray: '#8E8E93',
    systemGray2: '#AEAEB2',
    systemGray3: '#C7C7CC',
    systemGray4: '#D1D1D6',
    systemGray5: '#E5E5EA',
    systemGray6: '#F2F2F7',
    label: '#000000',
    secondaryLabel: '#3C3C43',
    tertiaryLabel: '#3C3C43',
    quaternaryLabel: '#3C3C43',
    separator: '#C6C6C8',
    // iOS blue tint
    accent: '#007AFF',
  };

  // Generate time options for the iOS-style picker wheel
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 5; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();
  const selectedIndex = timeOptions.findIndex(option => option.value === selectedTime);

  // Calculate end time for display (iOS style)
  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    
    // Convert to 12-hour format for display
    const displayHour = endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours;
    const ampm = endHours < 12 ? 'AM' : 'PM';
    const displayEndTime = `${displayHour}:${String(endMins).padStart(2, '0')} ${ampm}`;
    
    return displayEndTime;
  };

  // Calendar state for monthly view
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const generateCalendarDates = () => {
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
    const dates = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      dates.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(day);
    }
    
    return dates;
  };

  // iOS-style scroll handler with haptic feedback
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  
  // Handle time selection with iOS haptic feedback
  const handleTimeScroll = (event: any) => {
    const offsetY = event?.nativeEvent?.contentOffset?.y || 0;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, timeOptions.length - 1));
    
    if (timeOptions[clampedIndex] && timeOptions[clampedIndex].value !== selectedTime) {
      // iOS haptic feedback
      if (Platform.OS === 'ios') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          console.log('Haptics not available');
        }
      }
      onTimeChange(timeOptions[clampedIndex].value);
    }
  };
  
  // Handle calendar button press with iOS-style animation
  const handleCalendarPress = () => {
    if (Platform.OS === 'ios') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available');
      }
    }
    calendarButtonScale.value = withSpring(0.98, { duration: 100 }, () => {
      calendarButtonScale.value = withSpring(1, { duration: 100 });
    });
    setShowCalendarTray(true);
  };
  
  // Handle date selection from calendar
  const handleDateSelect = (day: number) => {
    const dateString = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateChange(dateString);
    setShowCalendarTray(false);
    if (Platform.OS === 'ios') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not available');
      }
    }
  };
  
  // Navigate calendar months
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (Platform.OS === 'ios') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available');
      }
    }
    
    if (direction === 'prev') {
      if (calendarMonth === 0) {
        setCalendarMonth(11);
        setCalendarYear(calendarYear - 1);
      } else {
        setCalendarMonth(calendarMonth - 1);
      }
    } else {
      if (calendarMonth === 11) {
        setCalendarMonth(0);
        setCalendarYear(calendarYear + 1);
      } else {
        setCalendarMonth(calendarMonth + 1);
      }
    }
  };

  // Animated styles for calendar button
  const calendarButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: calendarButtonScale.value }],
    };
  });
  
  // Initialize scroll position to selected time
  useEffect(() => {
    if (selectedIndex >= 0 && scrollViewRef.current) {
      const offsetY = selectedIndex * ITEM_HEIGHT;
      scrollViewRef.current.scrollTo({ y: offsetY, animated: false });
    }
  }, [selectedIndex]);

  // Format date display as YYYY-MM-DD
  const formatDateDisplay = (dateString: string) => {
    return dateString; // Already in YYYY-MM-DD format
  };
  
  // Check if date is selected
  const isDateSelected = (day: number) => {
    const dateString = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateString === selectedDate;
  };
  
  // Check if date is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      calendarMonth === today.getMonth() &&
      calendarYear === today.getFullYear()
    );
  };
  
  // Render iOS-style time item with native picker feel
  const renderTimeItem = (item: { value: string; display: string }, index: number) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 2) * ITEM_HEIGHT,
        (index - 1) * ITEM_HEIGHT,
        index * ITEM_HEIGHT,
        (index + 1) * ITEM_HEIGHT,
        (index + 2) * ITEM_HEIGHT,
      ];
      
      // iOS-style scale effect - more subtle
      const scale = interpolate(
        scrollY.value,
        inputRange,
        [0.85, 0.92, 1.0, 0.92, 0.85],
        'clamp'
      );
      
      // iOS-style opacity effect - center is prominent
      const opacity = interpolate(
        scrollY.value,
        inputRange,
        [0.3, 0.6, 1.0, 0.6, 0.3],
        'clamp'
      );
      
      return {
        transform: [{ scale }],
        opacity,
      };
    });
    
    const isSelected = item.value === selectedTime;
    
    return (
      <Animated.View key={item.value} style={[styles.timeItem, animatedStyle]}>
        <Text style={[styles.timeText, isSelected && styles.selectedTimeText]}>
          {item.display}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* iOS-Style Time Picker */}
      <View style={styles.timeSection}>
        <View style={styles.timePickerContainer}>
          {/* iOS-style selection overlay */}
          <View style={styles.selectionOverlay} />
          
          {/* Vertical scrolling time picker */}
          <Animated.ScrollView
            ref={scrollViewRef}
            style={styles.timePickerWheel}
            contentContainerStyle={styles.timePickerContent}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onScroll={scrollHandler}
            onMomentumScrollEnd={handleTimeScroll}
            scrollEventThrottle={16}
          >
            {/* Padding for centering */}
            <View style={styles.paddingItem} />
            <View style={styles.paddingItem} />
            {timeOptions.map((item, index) => renderTimeItem(item, index))}
            <View style={styles.paddingItem} />
            <View style={styles.paddingItem} />
          </Animated.ScrollView>
        </View>
        
        {/* iOS-style duration text */}
        <Text style={styles.durationText}>
          {durationMinutes} min
        </Text>
        <Text style={styles.endTimeText}>
          until {calculateEndTime(selectedTime, durationMinutes)}
        </Text>
      </View>

      {/* Date Button - YYYY-MM-DD format */}
      <Animated.View style={[styles.dateButton, calendarButtonAnimatedStyle]}>
        <TouchableOpacity
          style={styles.dateButtonTouchable}
          onPress={handleCalendarPress}
          activeOpacity={0.6}
        >
          <Text style={styles.dateButtonText}>
            {formatDateDisplay(selectedDate)}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* iOS-Style Calendar Modal */}
      <Modal
        visible={showCalendarTray}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendarTray(false)}
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarTray}>
            {/* Calendar Header with Navigation */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => navigateMonth('prev')}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>
              
              <View style={styles.monthYearContainer}>
                <Text style={styles.monthText}>
                  {months[calendarMonth]}
                </Text>
                <TouchableOpacity style={styles.yearButton}>
                  <Text style={styles.yearText}>{calendarYear}</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                onPress={() => navigateMonth('next')}
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>
            
            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {/* Day headers */}
              <View style={styles.dayHeaderRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <Text key={day} style={styles.dayHeader}>{day}</Text>
                ))}
              </View>
              
              {/* Calendar dates */}
              <View style={styles.datesContainer}>
                {generateCalendarDates().map((day, index) => (
                  <View key={index} style={styles.dateCell}>
                    {day && (
                      <TouchableOpacity
                        style={[
                          styles.dateButton,
                          isDateSelected(day) && styles.selectedDate,
                          isToday(day) && !isDateSelected(day) && styles.todayDate,
                        ]}
                        onPress={() => handleDateSelect(day)}
                      >
                        <Text
                          style={[
                            styles.dateText,
                            isDateSelected(day) && styles.selectedDateText,
                            isToday(day) && !isDateSelected(day) && styles.todayDateText,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
            
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCalendarTray(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14, // iOS standard
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // iOS Time Picker Section
  timeSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  timePickerContainer: {
    height: PICKER_HEIGHT,
    position: 'relative',
    marginBottom: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  
  // iOS-style selection overlay (subtle borders)
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2, // Center of 5 items
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#C6C6C8',
    zIndex: 1,
    backgroundColor: 'rgba(0, 122, 255, 0.04)',
  },
  
  // Vertical scrolling wheel
  timePickerWheel: {
    flex: 1,
    zIndex: 2,
  },
  timePickerContent: {
    paddingVertical: 0,
  },
  
  // iOS-style time items
  timeItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  timeText: {
    fontSize: 22, // iOS picker size
    fontWeight: '400', // iOS system weight
    color: '#000000',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
  },
  selectedTimeText: {
    color: '#007AFF', // iOS blue
    fontWeight: '600',
  },
  
  // Padding items for centering
  paddingItem: {
    height: ITEM_HEIGHT,
  },
  
  // iOS-style duration text
  durationText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#3C3C43',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  endTimeText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  
  // Date Button - iOS style
  dateButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    marginTop: 8,
  },
  dateButtonTouchable: {
    padding: 16,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 17, // iOS standard
    fontWeight: '400',
    color: '#007AFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  
  // iOS Calendar Modal
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarTray: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: screenWidth - 32,
    maxHeight: screenHeight * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  
  // Calendar Header with Navigation
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#007AFF',
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
  },
  yearButton: {
    marginTop: 2,
  },
  yearText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#007AFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  
  // Calendar Grid
  calendarGrid: {
    padding: 16,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    paddingVertical: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  datesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: `${100/7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dateButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  selectedDate: {
    backgroundColor: '#007AFF',
  },
  todayDate: {
    backgroundColor: '#E5E5EA',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
  selectedDateText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayDateText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  
  // Close Button
  closeButton: {
    margin: 16,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
  },
});

export default AnimatedWhenSelector;