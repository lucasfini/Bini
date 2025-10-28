import 'react-native-gesture-handler/jestSetup';
import mockRNDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';

// Mock React Native modules
jest.mock('react-native-device-info', () => mockRNDeviceInfo);

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Add missing functions
  Reanimated.interpolate = jest.fn();
  Reanimated.default = {
    ...Reanimated.default,
    interpolate: jest.fn(),
  };
  
  return Reanimated;
});

// Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: (component) => component,
    Directions: {},
    GestureHandlerRootView: ({ children }) => children,
    GestureDetector: ({ children }) => children,
    Gesture: {
      Pan: () => ({
        onEnd: jest.fn().mockReturnThis(),
        onStart: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
      }),
      Tap: () => ({
        onEnd: jest.fn().mockReturnThis(),
      }),
    },
  };
});

// Mock Safe Area Context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Dimensions
const mockDimensions = {
  get: jest.fn(() => ({ width: 375, height: 812 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};
jest.mock('react-native/Libraries/Utilities/Dimensions', () => mockDimensions);

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((config) => config.ios || config.default),
}));

// Global test utilities
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
};

// Silence the warning about act() for react-native-testing-library
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Calendar-specific test helpers
global.calendarTestHelpers = {
  // Mock date for consistent testing
  mockDate: (dateString) => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(dateString));
  },
  
  // Reset date mocking
  resetDate: () => {
    jest.useRealTimers();
  },
  
  // Generate test task data
  generateTaskData: (dateISO, count = 3) => ({
    dateISO,
    isToday: dateISO === new Date().toISOString().split('T')[0],
    tasks: Array.from({ length: count }, (_, i) => ({
      id: `task-${dateISO}-${i}`,
      title: `Test Task ${i + 1}`,
      emoji: '📝',
      dateISO,
      isCompleted: i % 2 === 0,
      isShared: i % 3 === 0,
      priority: 'normal',
    })),
  }),
  
  // Simulate gesture events
  simulateSwipeGesture: (direction, strength = 'normal') => {
    const velocityMultiplier = strength === 'strong' ? 2 : strength === 'weak' ? 0.5 : 1;
    const translationMultiplier = strength === 'strong' ? 2 : strength === 'weak' ? 0.5 : 1;
    
    return {
      velocityX: direction === 'left' ? -600 * velocityMultiplier : 600 * velocityMultiplier,
      translationX: direction === 'left' ? -150 * translationMultiplier : 150 * translationMultiplier,
    };
  },
};

// Performance measurement helpers
global.measurePerformance = (testName, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;
  
  console.log(`Performance Test [${testName}]: ${duration}ms`);
  return { result, duration };
};

// Memory measurement mock (limited in React Native environment)
global.measureMemory = () => {
  if (global.gc) {
    global.gc();
  }
  return (performance as any).memory?.usedJSHeapSize || 0;
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});