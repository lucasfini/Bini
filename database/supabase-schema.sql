-- Partner Interaction Features Database Schema
-- This file contains all the database tables and functions needed for the partner interaction features

-- Partner status table for real-time heartbeat sync and connection info
CREATE TABLE IF NOT EXISTS partner_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  heartbeat_active BOOLEAN DEFAULT FALSE,
  current_bpm INTEGER,
  last_heartbeat_sync TIMESTAMP WITH TIME ZONE,
  charge_level INTEGER DEFAULT 0 CHECK (charge_level >= 0 AND charge_level <= 100),
  is_online BOOLEAN DEFAULT FALSE,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connection_strength INTEGER DEFAULT 0 CHECK (connection_strength >= 0 AND connection_strength <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SynchroBeat ritual sessions
CREATE TABLE IF NOT EXISTS synchro_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  initiator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('preparing', 'counting', 'breathing', 'complete', 'cancelled')) DEFAULT 'preparing',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  sync_quality TEXT CHECK (sync_quality IN ('poor', 'good', 'excellent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Serendipity bursts for spontaneous partner sharing
CREATE TABLE IF NOT EXISTS serendipity_bursts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('photo', 'message', 'location', 'achievement')) NOT NULL,
  content JSONB NOT NULL, -- Flexible content storage
  emotion TEXT, -- Optional emotion tag
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Cooperative quests for shared goals
CREATE TABLE IF NOT EXISTS cooperative_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reward TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Quest steps for breaking down cooperative quests
CREATE TABLE IF NOT EXISTS quest_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID REFERENCES cooperative_quests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT CHECK (assigned_to IN ('user', 'partner', 'both')) NOT NULL,
  requires_both BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partner_status_user_id ON partner_status(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_status_last_activity ON partner_status(last_activity);
CREATE INDEX IF NOT EXISTS idx_synchro_sessions_users ON synchro_sessions(initiator_id, partner_id);
CREATE INDEX IF NOT EXISTS idx_synchro_sessions_status ON synchro_sessions(status);
CREATE INDEX IF NOT EXISTS idx_serendipity_bursts_to_user ON serendipity_bursts(to_user);
CREATE INDEX IF NOT EXISTS idx_serendipity_bursts_created_at ON serendipity_bursts(created_at);
CREATE INDEX IF NOT EXISTS idx_cooperative_quests_users ON cooperative_quests(user_id, partner_id);
CREATE INDEX IF NOT EXISTS idx_cooperative_quests_active ON cooperative_quests(is_active);
CREATE INDEX IF NOT EXISTS idx_quest_steps_quest_id ON quest_steps(quest_id);

-- RLS (Row Level Security) Policies

-- Partner status policies
ALTER TABLE partner_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own and their partner's status" ON partner_status
  FOR SELECT USING (
    user_id = auth.uid() OR 
    user_id IN (
      SELECT partner_id FROM profiles WHERE id = auth.uid() AND partner_id IS NOT NULL
    )
  );

CREATE POLICY "Users can update their own status" ON partner_status
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own status" ON partner_status
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- SynchroBeat session policies
ALTER TABLE synchro_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sessions they're involved in" ON synchro_sessions
  FOR SELECT USING (initiator_id = auth.uid() OR partner_id = auth.uid());

CREATE POLICY "Users can create sessions with their partner" ON synchro_sessions
  FOR INSERT WITH CHECK (
    initiator_id = auth.uid() AND
    partner_id IN (
      SELECT partner_id FROM profiles WHERE id = auth.uid() AND partner_id IS NOT NULL
    )
  );

CREATE POLICY "Users can update sessions they initiated" ON synchro_sessions
  FOR UPDATE USING (initiator_id = auth.uid() OR partner_id = auth.uid());

-- Serendipity bursts policies
ALTER TABLE serendipity_bursts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bursts sent to them or by them" ON serendipity_bursts
  FOR SELECT USING (from_user = auth.uid() OR to_user = auth.uid());

CREATE POLICY "Users can send bursts to their partner" ON serendipity_bursts
  FOR INSERT WITH CHECK (
    from_user = auth.uid() AND
    to_user IN (
      SELECT partner_id FROM profiles WHERE id = auth.uid() AND partner_id IS NOT NULL
    )
  );

CREATE POLICY "Users can update bursts sent to them" ON serendipity_bursts
  FOR UPDATE USING (to_user = auth.uid());

-- Cooperative quests policies
ALTER TABLE cooperative_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quests they're involved in" ON cooperative_quests
  FOR SELECT USING (user_id = auth.uid() OR partner_id = auth.uid());

CREATE POLICY "Users can create quests with their partner" ON cooperative_quests
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    partner_id IN (
      SELECT partner_id FROM profiles WHERE id = auth.uid() AND partner_id IS NOT NULL
    )
  );

CREATE POLICY "Users can update quests they're involved in" ON cooperative_quests
  FOR UPDATE USING (user_id = auth.uid() OR partner_id = auth.uid());

-- Quest steps policies
ALTER TABLE quest_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view steps of quests they're involved in" ON quest_steps
  FOR SELECT USING (
    quest_id IN (
      SELECT id FROM cooperative_quests 
      WHERE user_id = auth.uid() OR partner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create steps for their quests" ON quest_steps
  FOR INSERT WITH CHECK (
    quest_id IN (
      SELECT id FROM cooperative_quests 
      WHERE user_id = auth.uid() OR partner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update steps of quests they're involved in" ON quest_steps
  FOR UPDATE USING (
    quest_id IN (
      SELECT id FROM cooperative_quests 
      WHERE user_id = auth.uid() OR partner_id = auth.uid()
    )
  );

-- Functions

-- Function to automatically update quest progress
CREATE OR REPLACE FUNCTION update_quest_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cooperative_quests 
  SET progress = (
    SELECT ROUND(
      (COUNT(*) FILTER (WHERE is_completed = TRUE) * 100.0) / COUNT(*)
    ) FROM quest_steps 
    WHERE quest_id = COALESCE(NEW.quest_id, OLD.quest_id)
  ),
  completed_at = CASE 
    WHEN (
      SELECT COUNT(*) FROM quest_steps 
      WHERE quest_id = COALESCE(NEW.quest_id, OLD.quest_id) AND is_completed = FALSE
    ) = 0 THEN NOW()
    ELSE NULL
  END
  WHERE id = COALESCE(NEW.quest_id, OLD.quest_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update quest progress when steps change
CREATE TRIGGER update_quest_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON quest_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_quest_progress();

-- Function to mark serendipity bursts as read
CREATE OR REPLACE FUNCTION mark_burst_as_read(burst_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE serendipity_bursts 
  SET is_read = TRUE, read_at = NOW() 
  WHERE id = burst_id AND to_user = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update partner status activity
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update last_activity
CREATE TRIGGER update_partner_status_activity
  BEFORE UPDATE ON partner_status
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

-- Sample data for development (optional)
-- Note: This would typically be inserted through the application, not in schema

-- Insert sample quest templates (these can be used by the app to suggest quests)
INSERT INTO cooperative_quests (title, description, user_id, partner_id, reward, is_active)
VALUES 
  ('Morning Sync Challenge', 'Start each day with a 5-minute heart sync session', 
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 
   'Unlock "Morning Harmony" achievement', FALSE),
  ('Weekly Adventure Quest', 'Complete 3 new activities together this week', 
   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 
   'Plan your next date night together', FALSE)
ON CONFLICT DO NOTHING;