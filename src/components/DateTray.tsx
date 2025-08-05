// src/components/DateTray.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from '@tamagui/lucide-icons';
import Tray from './Tray';

interface DateTrayProps {
  visible: boolean;
  onClose: () => void;
  onBack?: () => void;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  isDarkMode?: boolean;
}

const DateTray: React.FC<DateTrayProps> = ({
  visible,
  onClose,
  onBack,
  selectedDate,
  onDateSelect,
  isDarkMode = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const theme = {
    background: isDarkMode ? '#1F2937' : '#FFFFFF',
    text: isDarkMode ? '#F9FAFB' : '#111827',
    textSecondary: isDarkMode ? '#D1D5DB' : '#6B7280',
    border: isDarkMode ? '#374151' : '#E5E7EB',
    selectedDate: '#4A7C3A',
    todayDate: isDarkMode ? '#374151' : '#F3F4F6',
  };

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Get today's date for highlighting
  const today = new Date();
  const todayDateString = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Generate calendar grid
  const calendarDays = [];

  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ day: null, dateString: null });
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      '0',
    )}-${String(day).padStart(2, '0')}`;
    calendarDays.push({ day, dateString });
  }

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

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (dateString: string) => {
    onDateSelect(dateString);
  };

  const handleDone = () => {
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const getTitle = () => {
    return `${monthNames[currentMonth]} ${currentYear}`;
  };

  return (
    <Tray
      visible={visible}
      onClose={onClose}
      onBack={onBack}
      title={getTitle()}
      height="medium"
      isDarkMode={isDarkMode}
      leftButton={
        !onBack
          ? {
              text: 'Cancel',
              onPress: handleCancel,
            }
          : undefined
      }
      rightButton={{
        text: 'Done',
        onPress: handleDone,
      }}
    >
      <View style={styles.container}>
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToPreviousMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.monthYearContainer}>
            <Text style={[styles.monthYearText, { color: theme.text }]}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navButton}
            onPress={goToNextMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronRight size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendar}>
          {/* Week headers */}
          <View style={styles.weekHeaderRow}>
            {weekDays.map(day => (
              <View key={day} style={styles.weekHeaderCell}>
                <Text
                  style={[
                    styles.weekHeaderText,
                    { color: theme.textSecondary },
                  ]}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar days */}
          <View style={styles.daysGrid}>
            {calendarDays.map((item, index) => {
              if (!item.day) {
                return <View key={index} style={styles.dayCell} />;
              }

              const isSelected = item.dateString === selectedDate;
              const isToday = item.dateString === todayDateString;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    styles.dayButton,
                    isSelected && [
                      styles.daySelected,
                      { backgroundColor: theme.selectedDate },
                    ],
                    !isSelected &&
                      isToday && [
                        styles.dayToday,
                        { backgroundColor: theme.todayDate },
                      ],
                  ]}
                  onPress={() => handleDateSelect(item.dateString!)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: theme.text },
                      isSelected && styles.dayTextSelected,
                      !isSelected && isToday && styles.dayTextToday,
                    ]}
                  >
                    {item.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Tray>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: '600',
  },
  calendar: {
    flex: 1,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekHeaderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayButton: {
    borderRadius: 22,
  },
  daySelected: {
    backgroundColor: '#4A7C3A',
  },
  dayToday: {
    backgroundColor: '#F3F4F6',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayTextToday: {
    fontWeight: '600',
  },
});

export default DateTray;
