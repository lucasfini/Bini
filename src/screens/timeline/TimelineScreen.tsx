import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent, Pressable } from 'react-native';
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
import Avatar from '../../components/Avatar';
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
  const [showPartnerActions, setShowPartnerActions] = useState(false);
  const [showUserStatus, setShowUserStatus] = useState(false);

  // Activity feed state with priority system
  type ActivityType = 'status' | 'interaction' | 'task';
  interface Activity {
    type: ActivityType;
    message: string;
    timestamp: number;
    duration?: number; // in ms, undefined = permanent
  }

  const [activities, setActivities] = useState<Activity[]>([
    {
      type: 'task',
      message: 'Alex completed Morning Workout and is on fire today!',
      timestamp: Date.now(),
    }
  ]);

  // Get current activity to display (priority: status > interaction > task)
  const currentActivity = useMemo(() => {
    const now = Date.now();

    // Filter out expired temporary activities
    const validActivities = activities.filter(a => {
      if (!a.duration) return true; // Permanent activities
      return (now - a.timestamp) < a.duration;
    });

    // Priority order: status, then interaction, then task
    const statusActivity = validActivities.find(a => a.type === 'status');
    if (statusActivity) return statusActivity.message;

    const interactionActivity = validActivities.find(a => a.type === 'interaction');
    if (interactionActivity) return interactionActivity.message;

    const taskActivity = validActivities.find(a => a.type === 'task');
    return taskActivity?.message || 'No recent activity';
  }, [activities]);

  // Add activity helper
  const addActivity = (type: ActivityType, message: string, duration?: number) => {
    setActivities(prev => [...prev, {
      type,
      message,
      timestamp: Date.now(),
      duration,
    }]);
  };

  // Partner actions
  const handleSendNudge = () => {
    addActivity('interaction', 'You nudged Alex 👋', 10000);
    setShowPartnerActions(false);
  };

  const handleSendHighFive = () => {
    addActivity('interaction', 'You high-fived Alex ✋', 10000);
    setShowPartnerActions(false);
  };

  const handleSendHeart = () => {
    addActivity('interaction', 'You sent a heart to Alex ❤️', 10000);
    setShowPartnerActions(false);
  };

  const handleSendEncouragement = () => {
    addActivity('interaction', 'You encouraged Alex 💪', 10000);
    setShowPartnerActions(false);
  };

  // User status
  const handleSetStatus = (status: string) => {
    // Remove old status activities
    setActivities(prev => prev.filter(a => a.type !== 'status'));
    addActivity('status', `You: ${status}`);
    setShowUserStatus(false);
  };

  // Scrolling animation for activity feed (endless loop)
  const scrollX = useSharedValue(0);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (textWidth > 0) {
      // Seamlessly loop by scrolling exactly the width of one text instance
      scrollX.value = withRepeat(
        withTiming(-(textWidth + 20), {
          duration: 15000,
          easing: Easing.linear
        }),
        -1,
        false
      );
    }
  }, [textWidth]);

  // Clean up expired activities every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActivities(prev => prev.filter(a => {
        if (!a.duration) return true; // Keep permanent activities
        return (now - a.timestamp) < a.duration;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
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
      {/* Header with Date Display and Avatars */}
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
          {/* Empty */}
        </View>

        <View style={styles.headerRight}>
          {/* Partnered Avatars with Connection */}
          <View style={styles.partnershipContainer}>
            {/* User Avatar */}
            <TouchableOpacity onPress={() => setShowUserStatus(!showUserStatus)}>
              <Avatar seed="user-charlie-890" size={38} />
            </TouchableOpacity>

            {/* Partnership Heart Icon */}
            <View style={styles.partnershipHeart}>
              <Text style={styles.heartIcon}>❤️</Text>
            </View>

            {/* Partner Avatar */}
            <TouchableOpacity onPress={() => setShowPartnerActions(!showPartnerActions)}>
              <Avatar seed="partner-jordan-234" size={38} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Partner Actions Dropdown */}
      {showPartnerActions && (
        <View style={styles.dropdownMenuContainer}>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            onPress={() => setShowPartnerActions(false)}
            activeOpacity={1}
          />
          <View style={styles.partnerActionsMenu}>
            <TouchableOpacity style={styles.actionOption} onPress={handleSendNudge}>
              <Text style={styles.actionText}>👋 Send Nudge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionOption} onPress={handleSendHighFive}>
              <Text style={styles.actionText}>✋ Send High-Five</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionOption} onPress={handleSendHeart}>
              <Text style={styles.actionText}>❤️ Send Heart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionOption} onPress={handleSendEncouragement}>
              <Text style={styles.actionText}>💪 Send Encouragement</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* User Status Dropdown */}
      {showUserStatus && (
        <View style={styles.dropdownMenuContainer}>
          <TouchableOpacity
            style={styles.dropdownBackdrop}
            onPress={() => setShowUserStatus(false)}
            activeOpacity={1}
          />
          <View style={styles.statusMenu}>
            <TouchableOpacity style={styles.actionOption} onPress={() => handleSetStatus('Focused 🎯')}>
              <Text style={styles.actionText}>🎯 Focused</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionOption} onPress={() => handleSetStatus('Crushing it 💪')}>
              <Text style={styles.actionText}>💪 Crushing it</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionOption} onPress={() => handleSetStatus('Taking break ☕')}>
              <Text style={styles.actionText}>☕ Taking break</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionOption} onPress={() => handleSetStatus('Need help 🆘')}>
              <Text style={styles.actionText}>🆘 Need help</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionOption} onPress={() => handleSetStatus('Celebrating 🎉')}>
              <Text style={styles.actionText}>🎉 Celebrating</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filter Bar with Activity Feed */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          onPress={() => setShowDropdown(!showDropdown)}
          style={styles.filterButton}
        >
          <Animated.Text style={styles.filterButtonText}>
            {filter}
          </Animated.Text>
        </TouchableOpacity>

        <Text style={styles.separator}>|</Text>

        {/* Scrolling Activity Feed - Endless Loop */}
        <View style={styles.activityFeedContainer}>
          <Animated.View
            style={[
              styles.activityFeedScroller,
              useAnimatedStyle(() => ({
                transform: [{ translateX: scrollX.value }],
              })),
            ]}
          >
            <Animated.Text
              style={styles.activityFeedText}
              onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
            >
              {currentActivity}
            </Animated.Text>
            <Animated.Text style={styles.activityFeedText}>
              {'    •    ' + currentActivity}
            </Animated.Text>
          </Animated.View>
        </View>
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
    justifyContent: 'center',
  },
  partnershipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 24,
    gap: 2,
  },
  partnershipHeart: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -8 }, { translateY: -8 }],
    zIndex: 10,
  },
  heartIcon: {
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
    gap: 12,
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
  separator: {
    fontSize: 14,
    color: '#3A3A3A',
    fontWeight: '300',
  },
  activityFeedContainer: {
    flex: 1,
    overflow: 'hidden',
    height: 18,
  },
  activityFeedScroller: {
    flexDirection: 'row',
  },
  activityFeedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#CCCCCC',
    opacity: 0.7,
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
    left: 20,
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

  // Partner Actions & Status Menus
  partnerActionsMenu: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 200,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  statusMenu: {
    position: 'absolute',
    top: 100,
    right: 100,
    width: 180,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  actionOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
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