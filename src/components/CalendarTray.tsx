import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Tray from './Tray';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface CalendarTrayProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string; // ISO format: YYYY-MM-DD
  onDateSelect: (date: string) => void;
}

const CalendarTray: React.FC<CalendarTrayProps> = ({
  visible,
  onClose,
  selectedDate,
  onDateSelect,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    return date.getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    const date = selectedDate ? new Date(selectedDate) : new Date();
    return date.getFullYear();
  });

  // Dark theme colors
  const theme = {
    background: '#1A1A1A',
    surface: '#2A2A2A',
    border: '#3A3A3A',
    textPrimary: '#FFFFFF',
    textSecondary: '#CCCCCC',
    accent: '#FF6B9D',
    accentLight: 'rgba(255, 107, 157, 0.2)',
    todayBorder: '#6B73FF',
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

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
    onClose();
  };

  const getTitle = () => {
    return `${monthNames[currentMonth]} ${currentYear}`;
  };

  return (
    <Tray
      visible={visible}
      onClose={onClose}
      title={getTitle()}
      height="medium"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToPreviousMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={24} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.monthYearContainer}>
            <Text style={[styles.monthYearText, { color: theme.textPrimary }]}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navButton}
            onPress={goToNextMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronRight size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendar}>
          {/* Week headers */}
          <View style={styles.weekHeaderRow}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekHeaderCell}>
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
                      { backgroundColor: theme.accent },
                    ],
                    !isSelected &&
                      isToday && [
                        styles.dayToday,
                        { borderColor: theme.todayBorder, borderWidth: 2 },
                      ],
                  ]}
                  onPress={() => handleDateSelect(item.dateString!)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: theme.textPrimary },
                      isSelected && styles.dayTextSelected,
                    ]}
                  >
                    {item.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: theme.surface }]}
            onPress={() => handleDateSelect(todayDateString)}
          >
            <Text style={[styles.quickActionText, { color: theme.accent }]}>
              Jump to Today
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginBottom: 20,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dayButton: {
    borderRadius: 24,
  },
  daySelected: {
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayToday: {
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quickActions: {
    paddingVertical: 12,
    paddingBottom: 24,
  },
  quickActionButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CalendarTray;
