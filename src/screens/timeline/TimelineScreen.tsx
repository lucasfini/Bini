import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutChangeEvent, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  FadeIn,
  FadeOut,
  runOnJS
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { EmptyStateIllustration } from './components/EmptyStateIllustration';
import { TaskCard } from './components/TaskCard';
import { useTimelineData } from './hooks/useTimelineData';
import { Task } from './types';
import { colors, spacing, typography, layout } from '../../theme/designTokens';
import TaskDetailsTray from '../../components/TaskDetailsTray';
import CalendarTray from '../../components/CalendarTray';
import UnifiedTaskService from '../../services/tasks/unifiedTaskService';
import { getLocalDateISO } from '../../utils/dateHelper';
import { List, User, Users, ChevronLeft, Calendar } from 'lucide-react-native';

interface TimelineScreenProps {
  onEditTask?: (task: any) => void;
  onDuplicateTask?: (task: any) => void;
  onNavigateToCreate?: () => void;
  onRefreshTimeline?: () => void;
  themeKey?: 'pink' | 'blue';
  refreshKey?: number;
}

type FilterKey = 'All' | 'Mine' | 'Ours';

const TimelineScreen: React.FC<TimelineScreenProps> = ({
  onEditTask,
  onDuplicateTask,
  onNavigateToCreate,
  onRefreshTimeline,
  themeKey = 'pink',
  refreshKey,
}) => {
  const insets = useSafeAreaInsets();
  const { sections: hookSections, isLoading, hasLoadedOnce } = useTimelineData(refreshKey);
  const [sections, setSections] = useState(hookSections);
  const [taskDetailTrayVisible, setTaskDetailTrayVisible] = useState(false);
  const [calendarTrayVisible, setCalendarTrayVisible] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterKey>('Ours');
  const [showDropdown, setShowDropdown] = useState(false);

  // Partner interaction states
  const [recentActivity, setRecentActivity] = useState('Alex completed Morning Workout 💪');
  const [userMood, setUserMood] = useState('😊');
  const [partnerMood, setPartnerMood] = useState('💪');

  const handleHighFive = () => {
    console.log('✋ High-five sent to partner!');
    // TODO: Send high-five notification to partner
  };
  
  // Update local sections when hook data changes
  useEffect(() => {
    setSections(hookSections);
  }, [hookSections]);
  
  // Single-day view state
  const [currentDate, setCurrentDate] = useState<string>(getLocalDateISO());
  const today = getLocalDateISO();
  
  // Animation shared values
  const filterAnimation = useSharedValue(0);
  const slideAnimation = useSharedValue(0);

  // Filter sections for single-day view
  const filteredSections = useMemo(() => {
    const keep = (isShared?: boolean) => {
      if (filter === 'All') return true;
      if (filter === 'Mine') return !isShared;
      if (filter === 'Ours') return !!isShared;
      return true;
    };

    // Only show tasks for the current selected date
    return sections
      .filter(s => s.dateISO === currentDate)
      .map(s => ({ ...s, tasks: s.tasks.filter(t => keep(t.isShared)) }));
  }, [sections, filter, currentDate]);

  const hasAnyTasks = filteredSections.some(section => section.tasks.length > 0);
  const isViewingToday = currentDate === today;

  // Get icon for filter dropdown
  const getFilterIcon = (filterKey: FilterKey) => {
    switch (filterKey) {
      case 'All': return List;
      case 'Mine': return User;
      case 'Ours': return Users;
      default: return List;
    }
  };

  // Format date for day section
  const formatDay = (date: Date) => {
    const day = date.getDate();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return { day, weekday, month };
  };

  // Get date components for header display
  const getHeaderDateComponents = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return { day, weekday, month };
  };

  const handleOpenCalendar = () => {
    setCalendarTrayVisible(true);
  };

  const handleDateSelect = (newDate: string) => {
    console.log('📅 Date selected:', newDate);

    // Animate transition
    slideAnimation.value = withTiming(currentDate < newDate ? -1 : 1, { duration: 150 }, () => {
      runOnJS(setCurrentDate)(newDate);
      slideAnimation.value = withTiming(0, { duration: 300 });
    });
  };

  const handleCreateTask = () => {
    console.log('Navigate to create task screen');
    if (onNavigateToCreate) {
      onNavigateToCreate();
    }
  };

  const handleOpenTask = (task: Task) => {
    console.log('Open task details:', task.title);
    setSelectedTaskForDetail(task);
    setTaskDetailTrayVisible(true);
  };

  const handleToggleComplete = async (id: string) => {
    console.log('Toggle task completion:', id);
    try {
      // Update local sections state optimistically
      const updatedSections = sections.map(section => ({
        ...section,
        tasks: section.tasks.map(task => {
          if (task.id === id) {
            return { ...task, isCompleted: !task.isCompleted };
          }
          return task;
        })
      }));
      
      setSections(updatedSections);

      // Update the task in the selectedTaskForDetail if it's open
      if (selectedTaskForDetail && selectedTaskForDetail.id === id) {
        setSelectedTaskForDetail({
          ...selectedTaskForDetail,
          isCompleted: !selectedTaskForDetail.isCompleted
        });
      }

      // Update via the service in background
      await UnifiedTaskService.toggleTaskCompletion(id);
      
      console.log('✅ Task completion toggled successfully:', id);
    } catch (error) {
      console.error('❌ Failed to toggle task completion:', error);
      // On error, refresh to get correct state
      if (onRefreshTimeline) {
        onRefreshTimeline();
      }
    }
  };

  const handleTaskEdit = (task: Task) => {
    console.log('Edit task:', task.title);
    setTaskDetailTrayVisible(false);
    if (onEditTask) {
      onEditTask(task);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await UnifiedTaskService.deleteTask(taskId);
      setTaskDetailTrayVisible(false);
      
      if (onRefreshTimeline) {
        onRefreshTimeline();
      }
      
      console.log('✅ Task deleted successfully:', taskId);
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
    }
  };

  const handleTaskDuplicate = (task: Task) => {
    console.log('Duplicate task:', task.title);
    setTaskDetailTrayVisible(false);
    if (onDuplicateTask) {
      onDuplicateTask(task);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    console.log('Complete task:', taskId);
    setTaskDetailTrayVisible(false);
    // Use the same completion logic as handleToggleComplete
    await handleToggleComplete(taskId);
  };

  const handleStepToggle = async (taskId: string, stepId: string) => {
    console.log('Toggle step:', stepId, 'for task:', taskId);
    try {
      // Update local sections state optimistically
      const updatedSections = sections.map(section => ({
        ...section,
        tasks: section.tasks.map(task => {
          if (task.id === taskId && task.steps) {
            const updatedSteps = task.steps.map(s => 
              s.id === stepId ? { ...s, completed: !s.completed } : s
            );
            return { ...task, steps: updatedSteps };
          }
          return task;
        })
      }));
      
      setSections(updatedSections);

      // Update the task in the selectedTaskForDetail if it's open
      if (selectedTaskForDetail && selectedTaskForDetail.id === taskId && selectedTaskForDetail.steps) {
        const updatedSteps = selectedTaskForDetail.steps.map(s => 
          s.id === stepId ? { ...s, completed: !s.completed } : s
        );
        setSelectedTaskForDetail({
          ...selectedTaskForDetail,
          steps: updatedSteps
        });
      }

      // Update via the service in background
      const task = sections.flatMap(s => s.tasks).find(t => t.id === taskId);
      if (task?.steps) {
        const updatedSteps = task.steps.map(s => 
          s.id === stepId ? { ...s, completed: !s.completed } : s
        );
        await UnifiedTaskService.updateSteps(taskId, updatedSteps);
      }
      
      console.log('✅ Step toggled successfully:', stepId);
    } catch (error) {
      console.error('❌ Failed to toggle step:', error);
      // On error, refresh to get correct state
      if (onRefreshTimeline) {
        onRefreshTimeline();
      }
    }
  };

  const handleStepsUpdate = (taskId: string, steps: Array<{id: string; title: string; completed: boolean}>) => {
    console.log('Update steps for task:', taskId, steps);
  };

  const handleFilterChange = (newFilter: FilterKey) => {
    setFilter(newFilter);
    setShowDropdown(false);
    filterAnimation.value = withTiming(1, { duration: 200 }, () => {
      filterAnimation.value = withTiming(0, { duration: 200 });
    });
  };



  
  // Animated styles
  const contentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(filterAnimation.value, [0, 0.5, 1], [1, 0.7, 1]);
    const translateX = interpolate(slideAnimation.value, [-1, 0, 1], [-300, 0, 300]);
    return { 
      opacity,
      transform: [{ translateX }]
    };
  });
  
  

  if (!hasAnyTasks && hasLoadedOnce && !isLoading) {
    return (
      <View style={styles.container}>
        {/* Empty State */}
        <View style={styles.emptyContent}>
          <EmptyStateIllustration onCreateTask={handleCreateTask} />
          <Animated.Text style={styles.emptyTitle} entering={FadeIn.delay(200)}>
            Tap to create your first meaningful moment
          </Animated.Text>
          <Animated.Text style={styles.emptySubtitle} entering={FadeIn.delay(400)}>
            Start building your daily rhythm
          </Animated.Text>
        </View>
      </View>
    );
  }

  const headerDateComponents = getHeaderDateComponents(currentDate);

  return (
    <View style={styles.container}>
      {/* Header with Date Display and Filter */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleOpenCalendar} style={styles.dateButton}>
            <Animated.Text style={[
              styles.dayNumber,
              isViewingToday ? styles.dayNumberToday : styles.dayNumberOther
            ]}>
              {headerDateComponents.day}
            </Animated.Text>
            <View style={styles.dayMeta}>
              <Animated.Text style={styles.dayWeekday}>{headerDateComponents.weekday}</Animated.Text>
              <Animated.Text style={styles.dayMonth}>{headerDateComponents.month}</Animated.Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          {/* Activity Feed */}
          <Animated.Text style={styles.activityFeedText} numberOfLines={1}>
            {recentActivity}
          </Animated.Text>

          {/* Bottom row: Moods + High-five */}
          <View style={styles.interactionRow}>
            <Text style={styles.moodText}>{userMood}</Text>
            <TouchableOpacity onPress={handleHighFive} style={styles.highFiveButton}>
              <Text style={styles.highFiveEmoji}>✋</Text>
            </TouchableOpacity>
            <Text style={styles.moodText}>{partnerMood}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Empty - filter moved below */}
        </View>
      </View>

      {/* Filter Bar Below Header */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          onPress={() => setShowDropdown(!showDropdown)}
          style={styles.filterButton}
        >
          <Animated.Text style={styles.filterButtonText}>
            {filter}
          </Animated.Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {showDropdown && (
        <View style={styles.dropdownMenuContainer}>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            onPress={() => setShowDropdown(false)}
            activeOpacity={1}
          />
          <View style={styles.dropdownMenu}>
            {(['All', 'Mine', 'Ours'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => handleFilterChange(option)}
                style={[
                  styles.dropdownOption,
                  option === filter && styles.dropdownOptionActive
                ]}
              >
                <Animated.Text style={[
                  styles.dropdownOptionText,
                  option === filter && styles.dropdownOptionTextActive
                ]}>
                  {option}
                </Animated.Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}


      {/* Content */}
      <Animated.View style={styles.contentWrapper}>
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={contentAnimatedStyle}>
            {filteredSections.length > 0 ? (
              filteredSections.map((section, sectionIndex) => {
                // Check if all tasks for this day are completed
                const allTasksCompleted = section.tasks.length > 0 &&
                  section.tasks.every(task => task.isCompleted);

                return (
                  <View key={section.dateISO} style={styles.daySection}>
                    {/* All tasks completed indicator */}
                    {allTasksCompleted && (
                      <View style={styles.completionBanner}>
                        <Animated.Text style={styles.completionText}>
                          ⭐ All tasks completed!
                        </Animated.Text>
                      </View>
                    )}

                    {/* Tasks */}
                    <View style={styles.tasksContainer}>
                      {section.tasks.map((task, taskIndex) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onPress={handleOpenTask}
                          onSwipeComplete={handleToggleComplete}
                          onStepToggle={handleStepToggle}
                          index={taskIndex}
                        />
                      ))}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyDayContent}>
                <Animated.Text style={styles.emptyDayTitle}>
                  No tasks for this day
                </Animated.Text>
                <Animated.Text style={styles.emptyDaySubtitle}>
                  {isViewingToday ? 'Create your first task!' : 'This day is clear'}
                </Animated.Text>
              </View>
            )}
          </Animated.View>
        </Animated.ScrollView>
      </Animated.View>

      {/* Keep TaskDetailsTray exactly as is */}
      <TaskDetailsTray
        visible={taskDetailTrayVisible}
        task={selectedTaskForDetail}
        onClose={() => setTaskDetailTrayVisible(false)}
        onEdit={handleTaskEdit}
        onDelete={handleTaskDelete}
        onDuplicate={handleTaskDuplicate}
        onComplete={handleTaskComplete}
        onStepToggle={handleStepToggle}
        onStepsUpdate={handleStepsUpdate}
      />

      {/* Calendar Tray */}
      <CalendarTray
        visible={calendarTrayVisible}
        onClose={() => setCalendarTrayVisible(false)}
        selectedDate={currentDate}
        onDateSelect={handleDateSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  activityFeedText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#CCCCCC',
    opacity: 0.7,
    textAlign: 'center',
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodText: {
    fontSize: 16,
  },
  highFiveButton: {
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.3)',
  },
  highFiveEmoji: {
    fontSize: 18,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  dayNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  dayNumberToday: {
    color: '#FF6B9D',
  },
  dayNumberOther: {
    opacity: 0.85,
  },
  dayMeta: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  dayWeekday: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CCCCCC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CCCCCC',
    opacity: 0.8,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  // Filter Bar Below Header
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
  },

  // Dropdown Menu System
  dropdownMenuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 140,
    alignSelf: 'flex-end',
    right: 20,
    width: 80,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  dropdownOptionActive: {
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dropdownOptionTextActive: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  
  // Content
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  
  // Day Sections
  daySection: {
    marginBottom: 22,
  },
  completionBanner: {
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.3)',
  },
  completionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
    textAlign: 'center',
  },
  
  // Tasks
  tasksContainer: {
    gap: 16,
  },
  sectionSpacer: {
    height: 48,
  },
  
  // Empty State
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  
  // Empty Day State
  emptyDayContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyDayTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
  },
  emptyDaySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default TimelineScreen;