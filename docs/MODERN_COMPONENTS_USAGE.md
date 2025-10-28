# Modern Form Components Usage Guide

This guide shows how to use the three new modern form components in your React Native app.

## 1. DurationPicker Component

### Usage Example
```typescript
import DurationPicker from './components/DurationPicker';

const [selectedDuration, setSelectedDuration] = useState(60);

const durationOptions = [
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 45, label: '45m' },
  { value: 60, label: '1h' },
  { value: 90, label: '1h 30m' },
  { value: 120, label: '2h' },
  { value: 180, label: '3h' },
  { value: 240, label: '4h' },
];

<DurationPicker
  options={durationOptions}
  selectedValue={selectedDuration}
  onSelect={(value) => setSelectedDuration(value)}
  isDarkMode={false} // Optional
/>
```

### Props
- `options`: Array of `{ value: number, label: string }` objects
- `selectedValue`: Currently selected duration value (number)
- `onSelect`: Callback function that receives the selected value
- `isDarkMode`: Optional boolean for dark mode styling

### Features
- Horizontally scrollable pill buttons
- Smooth scale animation on tap
- Dark mode support
- Shadow effects and modern styling

## 2. RecurrenceSelector Component

### Usage Example
```typescript
import RecurrenceSelector from './components/RecurrenceSelector';

const [selectedRecurrence, setSelectedRecurrence] = useState('None');

<RecurrenceSelector
  options={['None', 'Daily', 'Weekly', 'Monthly']}
  selectedValue={selectedRecurrence}
  onSelect={(value) => setSelectedRecurrence(value)}
  isDarkMode={false} // Optional
/>
```

### Props
- `options`: Array of strings for recurrence types
- `selectedValue`: Currently selected recurrence type (string)
- `onSelect`: Callback function that receives the selected option
- `isDarkMode`: Optional boolean for dark mode styling

### Features
- Segmented control appearance
- Smooth sliding indicator that moves between options
- Equal-width buttons that adapt to content
- Polished container with subtle shadows

## 3. ModernCheckboxList Component  

### Usage Example
```typescript
import ModernCheckboxList from './components/ModernCheckboxList';

const [checkedAlerts, setCheckedAlerts] = useState<string[]>([]);

const alertOptions = [
  { id: 'start', label: 'At start of task', description: 'Notify when task begins' },
  { id: 'end', label: 'At end of task', description: 'Notify when task ends' },
  { id: '5min', label: '5 minutes before', description: 'Early reminder' },
  { id: '10min', label: '10 minutes before', description: 'Short notice' },
];

const handleToggle = (id: string) => {
  setCheckedAlerts(prev => 
    prev.includes(id) 
      ? prev.filter(alertId => alertId !== id)
      : [...prev, id]
  );
};

<ModernCheckboxList
  options={alertOptions}
  checkedValues={checkedAlerts}
  onToggle={handleToggle}
  isDarkMode={false} // Optional
  style="square" // Optional: 'square' | 'circle'
/>
```

### Props
- `options`: Array of `{ id: string, label: string, description?: string }` objects
- `checkedValues`: Array of currently checked option IDs
- `onToggle`: Callback function that receives the ID of the toggled item
- `isDarkMode`: Optional boolean for dark mode styling
- `style`: Optional checkbox style ('square' or 'circle')

### Features
- Custom checkboxes with scale animations
- Full row tap detection (not just checkbox)
- Optional descriptions for each item
- Visual separation between items
- Selected state highlighting with background color change

## State Management Example

Here's how to manage all three components together:

```typescript
const [formData, setFormData] = useState({
  duration: 60,
  recurrence: 'None',
  alerts: [] as string[],
});

const updateDuration = (duration: number) => {
  setFormData(prev => ({ ...prev, duration }));
};

const updateRecurrence = (recurrence: string) => {
  setFormData(prev => ({ ...prev, recurrence }));
};

const toggleAlert = (alertId: string) => {
  setFormData(prev => ({
    ...prev,
    alerts: prev.alerts.includes(alertId)
      ? prev.alerts.filter(id => id !== alertId)
      : [...prev.alerts, alertId]
  }));
};

// Use in JSX
<DurationPicker 
  options={durationOptions}
  selectedValue={formData.duration}
  onSelect={updateDuration}
/>

<RecurrenceSelector
  options={['None', 'Daily', 'Weekly', 'Monthly']}
  selectedValue={formData.recurrence}
  onSelect={updateRecurrence}
/>

<ModernCheckboxList
  options={alertOptions}
  checkedValues={formData.alerts}
  onToggle={toggleAlert}
/>
```

## Styling Notes

All components use:
- Consistent color theming with dark mode support
- Smooth animations for interactions
- Modern shadows and border radius
- Proper spacing and typography
- Touch-friendly sizing (minimum 44pt touch targets)

The components automatically adapt to your app's color scheme and provide a cohesive, modern user experience.