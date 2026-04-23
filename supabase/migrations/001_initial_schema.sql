-- Drop existing tables and related objects
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
DROP TRIGGER IF EXISTS update_rounds_updated_at ON rounds;
DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS rounds;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS groups;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Groups table
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rounds table
CREATE TABLE rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  date DATE NOT NULL,
  payment_amount NUMERIC NOT NULL,
  receive_amount NUMERIC NOT NULL,
  management_fee NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'received')),
  is_my_round BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, round_number)
);

-- Wallets table
CREATE TABLE wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  initial_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  round_number INTEGER,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'payout', 'deposit', 'withdrawal')),
  amount NUMERIC NOT NULL,
  is_estimate BOOLEAN DEFAULT false,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_groups_user_id ON groups(user_id);
CREATE INDEX idx_rounds_group_id ON rounds(group_id);
CREATE INDEX idx_rounds_date ON rounds(date);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_group_id ON transactions(group_id);
CREATE INDEX idx_transactions_date ON transactions(date);

-- Enable Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Users can view own groups" ON groups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own groups" ON groups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own groups" ON groups
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for rounds
CREATE POLICY "Users can view rounds from own groups" ON rounds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM groups WHERE groups.id = rounds.group_id AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rounds into own groups" ON rounds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups WHERE groups.id = rounds.group_id AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rounds in own groups" ON rounds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM groups WHERE groups.id = rounds.group_id AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rounds from own groups" ON rounds
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM groups WHERE groups.id = rounds.group_id AND groups.user_id = auth.uid()
    )
  );

-- RLS Policies for wallets
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallet" ON wallets
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rounds_updated_at
  BEFORE UPDATE ON rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
