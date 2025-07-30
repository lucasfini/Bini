-- Database Debug Script
-- Run these queries in your Supabase SQL editor to debug the task creation issue

-- STEP 1: Check if tasks table exists and see its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- STEP 2: Check if there are any tasks in the table
SELECT COUNT(*) as total_tasks FROM tasks;

-- STEP 3: See the latest tasks (if any exist)
SELECT 
    id,
    title,
    date,
    emoji,
    start_time,
    end_time,
    duration,
    details,
    steps,
    alerts,
    reoccurrence,
    frequency,
    is_shared,
    is_completed,
    created_at
FROM tasks 
ORDER BY created_at DESC 
LIMIT 5;

-- STEP 4: Check for any null values in recent tasks
SELECT 
    id,
    title,
    CASE WHEN emoji IS NULL THEN 'NULL' ELSE 'NOT NULL' END as emoji_status,
    CASE WHEN start_time IS NULL THEN 'NULL' ELSE 'NOT NULL' END as start_time_status,
    CASE WHEN details IS NULL THEN 'NULL' ELSE 'NOT NULL' END as details_status,
    CASE WHEN steps IS NULL THEN 'NULL' ELSE 'NOT NULL' END as steps_status,
    CASE WHEN alerts IS NULL THEN 'NULL' ELSE 'NOT NULL' END as alerts_status,
    CASE WHEN duration IS NULL THEN 'NULL' ELSE 'NOT NULL' END as duration_status
FROM tasks 
ORDER BY created_at DESC 
LIMIT 3;