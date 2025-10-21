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
import UnifiedTaskService from '../../services/tasks/unifiedTaskService';
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
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterKey>('Ours');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Update local sections when hook data changes
  useEffect(() => {
    setSections(hookSections);
  }, [hookSections]);
  
  // Single-day view state
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const today = new Date().toISOString().split('T')[0];
  
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
  
  // Navigation helpers
  const goToPreviousDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const newDate = prevDate.toISOString().split('T')[0];
    
    console.log('🔙 Going to previous day:', newDate);
    console.log('📋 Available sections:', sections.map(s => s.dateISO));
    
    // Animate slide right
    slideAnimation.value = withTiming(1, { duration: 300 }, () => {
      runOnJS(setCurrentDate)(newDate);
      slideAnimation.value = withTiming(0, { duration: 300 });
    });
  };
  
  const goToToday = () => {
    if (currentDate === today) return;
    
    const currentDateObj = new Date(currentDate);
    const todayObj = new Date(today);
    const daysDiff = Math.ceil((todayObj.getTime() - currentDateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    // Faster animation for farther distances
    const duration = Math.max(200, 600 - (daysDiff * 50));
    
    // Animate slide left back to present
    slideAnimation.value = withTiming(-1, { duration }, () => {
      runOnJS(setCurrentDate)(today);
      slideAnimation.value = withTiming(0, { duration: 200 });
    });
  };

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

  return (
    <View style={styles.container}>
      {/* Filter Header with Back Arrow and Dropdown */}
      <View style={[styles.filterHeader, { paddingTop: insets.top }]}>
        <View style={styles.leftSection}>
          <TouchableOpacity 
            onPress={goToPreviousDay}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          {!isViewingToday && (
            <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
              <Animated.Text style={styles.todayButtonText}>Present</Animated.Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filterDropdownContainer}>
          <TouchableOpacity 
            onPress={() => {
              console.log('🔘 Dropdown pressed, current state:', showDropdown);
              setShowDropdown(!showDropdown);
            }}
            style={styles.filterDropdown}
          >
            <Animated.Text style={styles.filterDropdownText}>
              {filter}
            </Animated.Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu - rendered outside header */}
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
                onPress={() => {
                  console.log('📋 Option selected:', option);
                  handleFilterChange(option);
                }}
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
                const { day, weekday, month } = formatDay(new Date(section.dateISO));
                const isTodaySection = currentDate === today;
                
                // Check if all tasks for this day are completed
                const allTasksCompleted = section.tasks.length > 0 && 
                  section.tasks.every(task => task.isCompleted);
                
                return (
                  <View key={section.dateISO}>
                    <View style={styles.daySection}>
                      {/* Day Header */}
                      <View style={styles.dayHeader}>
                        <View style={styles.dayNumberContainer}>
                          <View style={styles.dayNumberRow}>
                            <Animated.Text style={[
                              styles.dayNumber,
                              isTodaySection ? styles.dayNumberToday : styles.dayNumberOther
                            ]}>
                              {day}
                            </Animated.Text>
                            {allTasksCompleted && (
                              <Animated.Text style={styles.goldStar}>⭐</Animated.Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.dayMeta}>
                          <Animated.Text style={styles.dayWeekday}>{weekday}</Animated.Text>
                          <Animated.Text style={styles.dayMonth}>{month}</Animated.Text>
                        </View>
                      </View>
                      
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  
  // Filter Header
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButton: {
    padding: 8,
  },
  filterDropdownContainer: {
    // Simple container, no complex positioning
  },
  filterDropdown: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    opacity: 1,
  },
  filterDropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
    top: 120, // Position below header
    alignSelf: 'flex-end',
    right: 20,
    width: 80, // Same width as dropdown button (minWidth: 80)
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
  todayButton: {
    // No background, no padding, just text
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B9D',
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
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  dayNumberContainer: {
    minWidth: 80,
  },
  dayNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayNumber: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  goldStar: {
    fontSize: 20,
    marginTop: -8,
  },
  dayNumberToday: {
    color: '#FF6B9D',
  },
  dayNumberOther: {
    opacity: 0.85,
  },
  dayMeta: {
    alignItems: 'flex-end',
  },
  dayWeekday: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CCCCCC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  dayMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CCCCCC',
    opacity: 0.8,
    marginTop: 2,
    textAlign: 'right',
    letterSpacing: 0.5,
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