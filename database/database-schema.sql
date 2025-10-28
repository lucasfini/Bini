-- Database schema for the tasks table
-- Run this in your Supabase SQL editor to create the tasks table with all required fields

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT DEFAULT '✨',
  start_time TEXT, -- Format: "HH:MM" (renamed from time for clarity)
  end_time TEXT, -- Format: "HH:MM"
  duration INTEGER, -- Duration in minutes
  frequency TEXT DEFAULT 'once' CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly')),
  reoccurrence JSONB DEFAULT '{}'::jsonb, -- Reoccurrence settings {frequency, interval, daysOfWeek}
  alerts JSONB DEFAULT '[]'::jsonb, -- Array of alert strings
  details TEXT, -- Task details/notes (renamed from subtitle)
  steps JSONB DEFAULT '[]'::jsonb, -- Array of step objects {id, title, completed} (renamed from subtasks)
  assigned_to UUID[] DEFAULT ARRAY[]::UUID[], -- Array of user IDs
  group_id UUID, -- For task groups (can be null)
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on date for efficient timeline queries
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks USING GIN(assigned_to);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.uid() = ANY(assigned_to)
  );

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = ANY(assigned_to)
  );

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = created_by);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create profiles table if it doesn't exist (needed for auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  partner_id UUID REFERENCES auth.users(id),
  partner_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);