// src/components/ModernDateTimePicker.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { colors } from '../styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ModernDateTimePickerProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

const ModernDateTimePicker: React.FC<ModernDateTimePickerProps> = ({
  visible,
  onClose,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}) => {
  const [currentView, setCurrentView] = useState<'calendar' | 'month' | 'year'>(
    'calendar',
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    // Handle case where selectedDate might be invalid
    const date = new Date(selectedDate);
    return isNaN(date.getTime()) ? new Date() : date;
  });
  const [slideAnim] = useState(new Animated.Value(0));
  const [trayHeightAnim] = useState(new Animated.Value(screenHeight * 0.65));
  const [contentFadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Smooth tray height animation for seamless transitions
  useEffect(() => {
    if (showTimePicker) {
      // Sequence: Fade out content → Contract tray from top → Fade in new content
      Animated.sequence([
        Animated.timing(contentFadeAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(trayHeightAnim, {
          toValue: screenHeight * 0.5,
          duration: 280,
          useNativeDriver: false,
        }),
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Sequence: Fade out content → Expand tray from top → Fade in new content
      Animated.sequence([
        Animated.timing(contentFadeAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(trayHeightAnim, {
          toValue: screenHeight * 0.65,
          duration: 280,
          useNativeDriver: false,
        }),
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showTimePicker]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the first day of the week (Sunday = 0)
    const firstDayOfWeek = firstDay.getDay();

    const days = [];
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);

    // Add empty cells for days before the month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push({
        date: prevDate.getDate(),
        fullDate: prevDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        dateString: prevDate.toISOString().split('T')[0],
      });
    }

    // Add all days in the current month
    const daysInMonth = lastDay.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected =
        currentDate.toISOString().split('T')[0] === selectedDate;

      days.push({
        date: day,
        fullDate: currentDate,
        isCurrentMonth: true,
        isToday,
        isSelected,
        dateString: currentDate.toISOString().split('T')[0],
      });
    }

    // Fill remaining cells with next month's days
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    for (let i = days.length; i < totalCells; i++) {
      const nextDate = new Date(year, month + 1, nextMonthDay);
      days.push({
        date: nextMonthDay,
        fullDate: nextDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        dateString: nextDate.toISOString().split('T')[0],
      });
      nextMonthDay++;
    }

    return days;
  };

  // Generate time options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        const displayTime = new Date(
          `2000-01-01T${timeString}`,
        ).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        times.push({ value: timeString, display: displayTime });
      }
    }
    return times;
  };

  // Generate months for month view
  const generateMonths = () => {
    const months = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    return months.map((month, index) => ({
      short: month,
      index,
      isSelected: index === viewDate.getMonth(),
    }));
  };

  // Generate years for year view
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 10; year++) {
      years.push({
        year,
        isSelected: year === viewDate.getFullYear(),
      });
    }
    return years;
  };

  const handleDateSelect = (dateString: string) => {
    onDateChange(dateString);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(monthIndex);
    setViewDate(newDate);
    setCurrentView('calendar');
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(year);
    setViewDate(newDate);
    setCurrentView('month');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + (direction === 'next' ? 1 : -1));
    setViewDate(newDate);
  };

  // Time helper functions
  const formatDisplayTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getAMPM = (timeString: string) => {
    const [hours] = timeString.split(':').map(Number);
    return hours < 12 ? 'AM' : 'PM';
  };

  const handleAMPMToggle = () => {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const newHours = hours < 12 ? hours + 12 : hours - 12;
    const newTime = `${newHours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
    onTimeChange(newTime);
  };

  // Generate 12-hour time options for picker
  const generate12HourTimes = () => {
    const times = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const displayTime = `${hour}:${minute.toString().padStart(2, '0')}`;
        times.push(displayTime);
      }
    }
    return times;
  };

  const handleTimePickerSelect = (displayTime: string) => {
    const [displayHour, minutes] = displayTime.split(':').map(Number);
    const currentAMPM = getAMPM(selectedTime);
    let hour24 = displayHour;

    if (currentAMPM === 'PM' && displayHour !== 12) {
      hour24 = displayHour + 12;
    } else if (currentAMPM === 'AM' && displayHour === 12) {
      hour24 = 0;
    }

    const newTime = `${hour24.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
    onTimeChange(newTime);
    setShowTimePicker(false);
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const calendarDays = generateCalendarDays();
  const timeOptions = generateTimeOptions();
  const months = generateMonths();
  const years = generateYears();

  // Debug logging
  console.log('Calendar Debug:', {
    currentView,
    viewDate: viewDate.toString(),
    calendarDaysLength: calendarDays.length,
    firstDay: calendarDays[0],
    visible,
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <Animated.View style={[styles.container, { height: trayHeightAnim }]}>
          <Animated.View
            style={[
              styles.containerInner,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                  {
                    scale: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
                opacity: slideAnim,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {showTimePicker ? 'Select Time' : 'Select Date & Time'}
              </Text>
              <TouchableOpacity
                onPress={
                  showTimePicker ? () => setShowTimePicker(false) : onClose
                }
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Animated.ScrollView
              style={[styles.content, { opacity: contentFadeAnim }]}
              showsVerticalScrollIndicator={false}
            >
              {!showTimePicker ? (
                <>
                  {/* Date Section */}
                  <View style={styles.section}>
                    {/* Calendar Header */}
                    <View style={styles.calendarHeader}>
                      <TouchableOpacity onPress={() => navigateMonth('prev')}>
                        <Text style={styles.navButton}>‹</Text>
                      </TouchableOpacity>

                      <View style={styles.monthYearContainer}>
                        <TouchableOpacity
                          onPress={() => setCurrentView('month')}
                        >
                          <Text style={styles.monthYear}>
                            {monthNames[viewDate.getMonth()]}{' '}
                            {viewDate.getFullYear()}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity onPress={() => navigateMonth('next')}>
                        <Text style={styles.navButton}>›</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Calendar Views */}
                    {currentView === 'calendar' && (
                      <View style={styles.calendar}>
                        {/* Week headers */}
                        <View style={styles.weekHeader}>
                          {[
                            'SUN',
                            'MON',
                            'TUE',
                            'WED',
                            'THU',
                            'FRI',
                            'SAT',
                          ].map((day, index) => (
                            <View key={index} style={styles.weekHeaderDay}>
                              <Text style={styles.weekHeaderText}>{day}</Text>
                            </View>
                          ))}
                        </View>

                        {/* Calendar grid */}
                        <View style={styles.calendarGrid}>
                          {calendarDays.length > 0 ? (
                            calendarDays.map((day, index) => (
                              <TouchableOpacity
                                key={`${day.dateString}-${index}`}
                                style={[
                                  styles.calendarDay,
                                  day.isToday && styles.calendarDayToday,
                                  day.isSelected && styles.calendarDaySelected,
                                  !day.isCurrentMonth &&
                                    styles.calendarDayInactive,
                                ]}
                                onPress={() =>
                                  day.isCurrentMonth &&
                                  handleDateSelect(day.dateString)
                                }
                                disabled={!day.isCurrentMonth}
                              >
                                <Text
                                  style={[
                                    styles.calendarDayText,
                                    day.isToday && styles.calendarDayTextToday,
                                    day.isSelected &&
                                      styles.calendarDayTextSelected,
                                    !day.isCurrentMonth &&
                                      styles.calendarDayTextInactive,
                                  ]}
                                >
                                  {day.date}
                                </Text>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <Text style={{ color: 'red', padding: 20 }}>
                              No calendar days generated! Debug: View=
                              {currentView}, Date={viewDate.toString()}
                            </Text>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Month View */}
                    {currentView === 'month' && (
                      <View style={styles.monthGrid}>
                        {months.map((month, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.monthItem,
                              month.isSelected && styles.monthItemSelected,
                            ]}
                            onPress={() => handleMonthSelect(month.index)}
                          >
                            <Text
                              style={[
                                styles.monthText,
                                month.isSelected && styles.monthTextSelected,
                              ]}
                            >
                              {month.short}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Year View */}
                    {currentView === 'year' && (
                      <ScrollView
                        style={styles.yearList}
                        showsVerticalScrollIndicator={false}
                      >
                        {years.map((year, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.yearItem,
                              year.isSelected && styles.yearItemSelected,
                            ]}
                            onPress={() => handleYearSelect(year.year)}
                          >
                            <Text
                              style={[
                                styles.yearText,
                                year.isSelected && styles.yearTextSelected,
                              ]}
                            >
                              {year.year}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>

                  {/* Time Section */}
                  <View style={[styles.section, { paddingBottom: 0 }]}>
                    <View style={styles.timeRow}>
                      <Text style={styles.timeRowTitle}>Time</Text>

                      <TouchableOpacity
                        style={styles.timeDisplayCompact}
                        onPress={() => setShowTimePicker(true)}
                      >
                        <Text style={styles.timeDisplayTextCompact}>
                          {formatDisplayTime(selectedTime)}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.ampmTabs}>
                        <TouchableOpacity
                          style={[
                            styles.ampmTab,
                            getAMPM(selectedTime) === 'AM' &&
                              styles.ampmTabActive,
                          ]}
                          onPress={() => {
                            if (getAMPM(selectedTime) !== 'AM') {
                              handleAMPMToggle();
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.ampmTabText,
                              getAMPM(selectedTime) === 'AM' &&
                                styles.ampmTabTextActive,
                            ]}
                          >
                            AM
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.ampmTab,
                            getAMPM(selectedTime) === 'PM' &&
                              styles.ampmTabActive,
                          ]}
                          onPress={() => {
                            if (getAMPM(selectedTime) !== 'PM') {
                              handleAMPMToggle();
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.ampmTabText,
                              getAMPM(selectedTime) === 'PM' &&
                                styles.ampmTabTextActive,
                            ]}
                          >
                            PM
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                /* Time Picker Content */
                <View style={styles.timePickerContent}>
                  {generate12HourTimes().map((time, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timePickerItem,
                        formatDisplayTime(selectedTime) === time &&
                          styles.timePickerItemSelected,
                      ]}
                      onPress={() => handleTimePickerSelect(time)}
                    >
                      <Text
                        style={[
                          styles.timePickerItemText,
                          formatDisplayTime(selectedTime) === time &&
                            styles.timePickerItemTextSelected,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Animated.ScrollView>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: screenWidth * 0.9,
    // height is now dynamic - set inline based on showTimePicker state
  },
  containerInner: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.textSecondary,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },

  // Calendar Styles
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  calendar: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    minHeight: 300,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekHeaderDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 250,
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 4,
  },
  calendarDayToday: {
    backgroundColor: colors.textSecondary + '20',
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  calendarDaySelected: {
    backgroundColor: '#FFB8C5', // Light pink for selected days
  },
  calendarDayInactive: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  calendarDayTextToday: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  calendarDayTextInactive: {
    color: colors.textTertiary,
  },

  // Month Grid Styles
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  monthItem: {
    width: '28%',
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthItemSelected: {
    backgroundColor: colors.primary,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  monthTextSelected: {
    color: colors.white,
  },

  // Year List Styles
  yearList: {
    maxHeight: 200,
  },
  yearItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  yearItemSelected: {
    backgroundColor: colors.primary,
  },
  yearText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  yearTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },

  // New Time Interface Styles - Compact Row Layout
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeRowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    // No marginBottom - keeps it perfectly aligned in the row
  },
  timeDisplayCompact: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDisplayTextCompact: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ampmTabs: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 2,
    width: 80,
    height: 44, // Match time display height (10px padding * 2 + text height)
  },
  ampmTab: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmTabActive: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ampmTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  ampmTabTextActive: {
    color: colors.white,
    fontWeight: '600',
  },

  // Time Picker Content Styles (now integrated)
  timePickerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  timePickerItem: {
    paddingVertical: 16,
    borderRadius: 12,
    marginVertical: 2,
    alignItems: 'center',
  },
  timePickerItemSelected: {
    backgroundColor: '#FFB8C5', // Light pink like calendar selection
  },
  timePickerItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  timePickerItemTextSelected: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default ModernDateTimePicker;
