-- Drop wallet_id from transactions — unused column, user_id is sufficient
DROP INDEX IF EXISTS idx_transactions_wallet_id;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_wallet_id_fkey;
ALTER TABLE transactions DROP COLUMN IF EXISTS wallet_id;
