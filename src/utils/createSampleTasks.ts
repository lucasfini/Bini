// src/utils/createSampleTasks.ts
import { TaskFormData } from '../types/tasks';

// Helper to get date N days ago
const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export const sampleTasks: TaskFormData[] = [
  // Today's tasks
  {
    title: "Morning Workout",
    emoji: "💪",
    when: {
      date: getDaysAgo(0), // Today
      time: "07:00",
    },
    durationMinutes: 45,
    recurrence: {
      frequency: 'daily',
      interval: 1,
    },
    alerts: ['15min', '5min'],
    details: "Full body workout routine with cardio and strength training. Remember to bring water bottle and towel.",
    isShared: true,
    subtasks: [
      { id: '1', title: "5 min warm-up stretches", completed: false },
      { id: '2', title: "20 min cardio (treadmill/bike)", completed: false },
      { id: '3', title: "15 min strength training", completed: false },
      { id: '4', title: "5 min cool-down and stretches", completed: false },
    ],
  },

  // 2. Today - Evening Reading
  {
    title: "Read before bed",
    emoji: "📚",
    when: {
      date: getDaysAgo(0), // Today
      time: "21:30",
    },
    durationMinutes: 30,
    recurrence: {
      frequency: 'daily',
      interval: 1,
    },
    alerts: ['10min'],
    details: "Wind down with some light reading. Currently reading 'Atomic Habits' - such a good book for building better routines!",
    isShared: false,
    subtasks: [
      { id: '1', title: "Find comfortable reading spot", completed: false },
      { id: '2', title: "Turn off all devices", completed: false },
      { id: '3', title: "Read for 30 minutes", completed: false },
    ],
  },

  // 3. Today - Meditation
  {
    title: "Morning meditation",
    emoji: "🧘‍♀️",
    when: {
      date: getDaysAgo(0), // Today
      time: "06:30",
    },
    durationMinutes: 15,
    recurrence: {
      frequency: 'daily',
      interval: 1,
    },
    alerts: ['5min'],
    details: "Start the day with mindfulness and intention. Using the Headspace app for guided meditation sessions.",
    isShared: true,
    subtasks: [
      { id: '1', title: "Set up meditation space", completed: false },
      { id: '2', title: "Open meditation app", completed: false },
      { id: '3', title: "15 min guided session", completed: false },
    ],
  },

  // Yesterday's tasks
  {
    title: "Team standup meeting",
    emoji: "👥",
    when: {
      date: getDaysAgo(1), // Yesterday
      time: "09:00",
    },
    durationMinutes: 30,
    recurrence: {
      frequency: 'none',
      interval: 1,
    },
    alerts: ['10min'],
    details: "Daily team sync to discuss progress and blockers. Review sprint board and plan today's work.",
    isShared: true,
    subtasks: [
      { id: '1', title: "Review yesterday's progress", completed: true },
      { id: '2', title: "Share today's plan", completed: true },
      { id: '3', title: "Discuss any blockers", completed: false },
    ],
  },

  {
    title: "Grocery shopping",
    emoji: "🛒",
    when: {
      date: getDaysAgo(1), // Yesterday
      time: "18:00",
    },
    durationMinutes: 60,
    recurrence: {
      frequency: 'none',
      interval: 1,
    },
    alerts: ['30min'],
    details: "Weekly grocery run for fresh ingredients. Focus on healthy meal prep options for the week.",
    isShared: false,
    subtasks: [
      { id: '1', title: "Get fresh vegetables", completed: true },
      { id: '2', title: "Buy protein for meal prep", completed: true },
      { id: '3', title: "Pick up household items", completed: true },
    ],
  },

  // 2 days ago
  {
    title: "Doctor's appointment",
    emoji: "🩺",
    when: {
      date: getDaysAgo(2), // 2 days ago
      time: "14:30",
    },
    durationMinutes: 45,
    recurrence: {
      frequency: 'none',
      interval: 1,
    },
    alerts: ['1hour', '15min'],
    details: "Annual checkup with Dr. Smith. Remember to bring insurance card and list of current medications.",
    isShared: false,
    subtasks: [
      { id: '1', title: "Arrive 15 minutes early", completed: true },
      { id: '2', title: "Complete intake forms", completed: true },
      { id: '3', title: "Discuss health concerns", completed: true },
      { id: '4', title: "Schedule follow-up if needed", completed: false },
    ],
  },

  {
    title: "Yoga class",
    emoji: "🧘",
    when: {
      date: getDaysAgo(2), // 2 days ago
      time: "19:00",
    },
    durationMinutes: 60,
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: ['2'], // Tuesday
    },
    alerts: ['30min'],
    details: "Evening vinyasa flow class at the studio. Great way to unwind after work and improve flexibility.",
    isShared: true,
    subtasks: [
      { id: '1', title: "Pack yoga mat and water", completed: true },
      { id: '2', title: "Arrive early for good spot", completed: true },
      { id: '3', title: "Focus on breathing", completed: true },
    ],
  },

  // 3 days ago
  {
    title: "Project deadline review",
    emoji: "📊",
    when: {
      date: getDaysAgo(3), // 3 days ago
      time: "15:00",
    },
    durationMinutes: 90,
    recurrence: {
      frequency: 'none',
      interval: 1,
    },
    alerts: ['1hour'],
    details: "Final review meeting for Q4 project deliverables. Present findings and get approval for next phase.",
    isShared: true,
    subtasks: [
      { id: '1', title: "Prepare presentation slides", completed: true },
      { id: '2', title: "Review data analysis", completed: true },
      { id: '3', title: "Get stakeholder feedback", completed: true },
      { id: '4', title: "Document next steps", completed: true },
    ],
  },

  {
    title: "Dinner with friends",
    emoji: "🍽️",
    when: {
      date: getDaysAgo(3), // 3 days ago
      time: "19:30",
    },
    durationMinutes: 120,
    recurrence: {
      frequency: 'none',
      interval: 1,
    },
    alerts: ['1hour'],
    details: "Catch up dinner at the new Italian place downtown. Haven't seen Sarah and Mike in months!",
    isShared: false,
    subtasks: [
      { id: '1', title: "Make restaurant reservation", completed: true },
      { id: '2', title: "Confirm with friends", completed: true },
      { id: '3', title: "Plan conversation topics", completed: false },
    ],
  },

  // 4 days ago
  {
    title: "Car maintenance",
    emoji: "🚗",
    when: {
      date: getDaysAgo(4), // 4 days ago
      time: "11:00",
    },
    durationMinutes: 90,
    recurrence: {
      frequency: 'none',
      interval: 1,
    },
    alerts: ['2hours'],
    details: "Scheduled oil change and tire rotation at Mike's Auto Shop. Check air filter and fluid levels too.",
    isShared: false,
    subtasks: [
      { id: '1', title: "Drop off car at shop", completed: true },
      { id: '2', title: "Oil change service", completed: true },
      { id: '3', title: "Tire rotation", completed: true },
      { id: '4', title: "Pick up car", completed: true },
    ],
  },

  {
    title: "Piano practice",
    emoji: "🎹",
    when: {
      date: getDaysAgo(4), // 4 days ago
      time: "20:00",
    },
    durationMinutes: 45,
    recurrence: {
      frequency: 'daily',
      interval: 1,
    },
    alerts: ['10min'],
    details: "Practice Chopin's Nocturne in E-flat major. Focus on the difficult passage in measure 32-40.",
    isShared: false,
    subtasks: [
      { id: '1', title: "Warm up with scales", completed: true },
      { id: '2', title: "Practice difficult passage slowly", completed: true },
      { id: '3', title: "Play through full piece", completed: false },
    ],
  },

  // 5 days ago (1 week ago)
  {
    title: "Weekend hiking trip",
    emoji: "🥾",
    when: {
      date: getDaysAgo(5), // 5 days ago
      time: "08:00",
    },
    durationMinutes: 300, // 5 hours
    recurrence: {
      frequency: 'none',
      interval: 1,
    },
    alerts: ['1day', '2hours'],
    details: "Day hike at Blue Ridge Trail with Alex and Jordan. Beautiful fall colors and great weather forecast!",
    isShared: true,
    subtasks: [
      { id: '1', title: "Pack hiking gear and snacks", completed: true },
      { id: '2', title: "Check weather conditions", completed: true },
      { id: '3', title: "Meet at trailhead", completed: true },
      { id: '4', title: "Complete 8-mile trail", completed: true },
      { id: '5', title: "Take photos at summit", completed: true },
    ],
  },

  {
    title: "Meal prep Sunday",
    emoji: "🥗",
    when: {
      date: getDaysAgo(5), // 5 days ago
      time: "16:00",
    },
    durationMinutes: 120,
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: ['0'], // Sunday
    },
    alerts: ['30min'],
    details: "Prep healthy meals for the upcoming week. Focus on balanced proteins, veggies, and complex carbs.",
    isShared: false,
    subtasks: [
      { id: '1', title: "Cook quinoa and brown rice", completed: true },
      { id: '2', title: "Grill chicken and salmon", completed: true },
      { id: '3', title: "Chop vegetables for salads", completed: true },
      { id: '4', title: "Portion into containers", completed: true },
    ],
  },
];