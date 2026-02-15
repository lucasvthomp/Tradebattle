-- Create crypto_withdrawals table
CREATE TABLE IF NOT EXISTS crypto_withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  transaction_fee NUMERIC(15, 2) NOT NULL,
  payout_amount NUMERIC(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payout_id VARCHAR(255),
  tx_hash VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP,
  confirmed_at TIMESTAMP
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_crypto_withdrawals_user_id ON crypto_withdrawals(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_crypto_withdrawals_status ON crypto_withdrawals(status);
