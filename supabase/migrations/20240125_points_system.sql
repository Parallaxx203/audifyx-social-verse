
CREATE TABLE points_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE TABLE points_balances (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  total_points INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update points balance
CREATE OR REPLACE FUNCTION update_points_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO points_balances (user_id, total_points)
  VALUES (NEW.user_id, NEW.points)
  ON CONFLICT (user_id) DO UPDATE
  SET total_points = points_balances.total_points + NEW.points,
      last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update points balance on new points event
CREATE TRIGGER points_event_trigger
AFTER INSERT ON points_events
FOR EACH ROW
EXECUTE FUNCTION update_points_balance();
