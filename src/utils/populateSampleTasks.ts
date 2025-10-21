// src/utils/populateSampleTasks.ts
import unifiedTaskService from '../services/tasks/unifiedTaskService';
import { sampleTasks } from './createSampleTasks';

export const populateSampleTasks = async () => {
  console.log('🎯 Starting to populate sample tasks...');
  
  try {
    // Add a small delay between tasks to avoid overwhelming the database
    for (let i = 0; i < sampleTasks.length; i++) {
      const task = sampleTasks[i];
      console.log(`📝 Creating task ${i + 1}/${sampleTasks.length}: ${task.title}`);
      
      try {
        const createdTask = await unifiedTaskService.createTaskFromForm(task);
        console.log(`✅ Created task: ${createdTask.title} (ID: ${createdTask.id})`);
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (taskError) {
        console.error(`❌ Failed to create task "${task.title}":`, taskError);
      }
    }
    
    console.log('🎉 Sample task population completed!');
    return true;
  } catch (error) {
    console.error('❌ Failed to populate sample tasks:', error);
    return false;
  }
};

// Function to call from dev console or component
export const createSampleTasksNow = () => {
  populateSampleTasks();
};