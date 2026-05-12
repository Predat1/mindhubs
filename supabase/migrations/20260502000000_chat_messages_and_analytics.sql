-- Add Analytics columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE product_events ADD COLUMN IF NOT EXISTS source text;

-- Create Chats table
CREATE TABLE IF NOT EXISTS chats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(vendor_id, user_id)
);

-- Create Messages table
CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    read_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for chats (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Vendors can view their chats' AND tablename = 'chats') THEN
    CREATE POLICY "Vendors can view their chats" ON chats FOR SELECT USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Vendors can update their chats' AND tablename = 'chats') THEN
    CREATE POLICY "Vendors can update their chats" ON chats FOR UPDATE USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their chats' AND tablename = 'chats') THEN
    CREATE POLICY "Users can view their chats" ON chats FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create chats' AND tablename = 'chats') THEN
    CREATE POLICY "Users can create chats" ON chats FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their chats' AND tablename = 'chats') THEN
    CREATE POLICY "Users can update their chats" ON chats FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- Policies for messages (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert messages' AND tablename = 'messages') THEN
    CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND chat_id IN (SELECT id FROM chats WHERE user_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users and Vendors can read messages' AND tablename = 'messages') THEN
    CREATE POLICY "Users and Vendors can read messages" ON messages FOR SELECT USING (chat_id IN (SELECT id FROM chats WHERE user_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users and Vendors can update messages' AND tablename = 'messages') THEN
    CREATE POLICY "Users and Vendors can update messages" ON messages FOR UPDATE USING (chat_id IN (SELECT id FROM chats WHERE user_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())));
  END IF;
END $$;

-- Supabase Realtime setup (idempotent)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chats;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
