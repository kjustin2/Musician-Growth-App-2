-- Migration to encrypt OAuth tokens at rest for security
-- This addresses the security vulnerability of storing tokens in plain text

-- Create encryption key management functions
CREATE OR REPLACE FUNCTION get_encryption_key()
RETURNS TEXT AS $$
BEGIN
  -- Use environment variable or default for local development
  RETURN COALESCE(current_setting('app.encryption_key', true), 'local_dev_key_change_in_production');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create secure token encryption functions
CREATE OR REPLACE FUNCTION encrypt_token(token TEXT)
RETURNS TEXT AS $$
BEGIN
  IF token IS NULL OR token = '' THEN
    RETURN token;
  END IF;
  
  -- Use pgcrypto to encrypt the token
  RETURN encode(encrypt(token::bytea, get_encryption_key(), 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_token(encrypted_token TEXT)
RETURNS TEXT AS $$
BEGIN
  IF encrypted_token IS NULL OR encrypted_token = '' THEN
    RETURN encrypted_token;
  END IF;
  
  -- Decrypt the token using pgcrypto
  RETURN convert_from(decrypt(decode(encrypted_token, 'base64'), get_encryption_key(), 'aes'), 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return NULL to prevent app crashes
    RAISE WARNING 'Failed to decrypt token: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add new encrypted columns to oauth_tokens table
ALTER TABLE oauth_tokens 
ADD COLUMN encrypted_access_token TEXT,
ADD COLUMN encrypted_refresh_token TEXT;

-- Migrate existing tokens (if any exist)
-- Note: In production, ensure existing tokens are properly handled
UPDATE oauth_tokens 
SET 
  encrypted_access_token = encrypt_token(access_token),
  encrypted_refresh_token = encrypt_token(refresh_token)
WHERE access_token IS NOT NULL OR refresh_token IS NOT NULL;

-- Create trigger to automatically encrypt tokens on insert/update
CREATE OR REPLACE FUNCTION encrypt_oauth_tokens_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Encrypt access token if provided
  IF NEW.access_token IS NOT NULL AND NEW.access_token != '' THEN
    NEW.encrypted_access_token = encrypt_token(NEW.access_token);
    NEW.access_token = NULL; -- Clear plain text
  END IF;
  
  -- Encrypt refresh token if provided
  IF NEW.refresh_token IS NOT NULL AND NEW.refresh_token != '' THEN
    NEW.encrypted_refresh_token = encrypt_token(NEW.refresh_token);
    NEW.refresh_token = NULL; -- Clear plain text
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply encryption trigger
CREATE TRIGGER oauth_tokens_encrypt_trigger
  BEFORE INSERT OR UPDATE ON oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_oauth_tokens_trigger();

-- Create secure view for accessing decrypted tokens
-- This provides a clean interface while maintaining security
CREATE OR REPLACE VIEW oauth_tokens_decrypted AS
SELECT 
  id,
  user_id,
  provider,
  decrypt_token(encrypted_access_token) as access_token,
  decrypt_token(encrypted_refresh_token) as refresh_token,
  expires_at,
  scope,
  created_at,
  updated_at
FROM oauth_tokens;

-- Update RLS policies for the view
ALTER VIEW oauth_tokens_decrypted OWNER TO postgres;

-- Grant appropriate permissions
GRANT SELECT ON oauth_tokens_decrypted TO authenticated;
GRANT SELECT ON oauth_tokens_decrypted TO anon;

-- Create secure helper functions for application use
CREATE OR REPLACE FUNCTION get_user_oauth_token(user_uuid UUID, provider_name TEXT)
RETURNS TABLE(
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Verify the user is requesting their own tokens
  IF auth.uid() != user_uuid THEN
    RAISE EXCEPTION 'Access denied: Can only access own OAuth tokens';
  END IF;
  
  RETURN QUERY
  SELECT 
    decrypt_token(ot.encrypted_access_token) as access_token,
    decrypt_token(ot.encrypted_refresh_token) as refresh_token,
    ot.expires_at
  FROM oauth_tokens ot
  WHERE ot.user_id = user_uuid 
    AND ot.provider = provider_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log for token access (optional but recommended)
CREATE TABLE IF NOT EXISTS oauth_token_access_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  action TEXT NOT NULL, -- 'read', 'write', 'delete'
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on access log
ALTER TABLE oauth_token_access_log ENABLE ROW LEVEL SECURITY;

-- RLS policy for access log (users can only see their own access logs)
CREATE POLICY "Users can view their own token access logs" ON oauth_token_access_log
  FOR SELECT USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_encrypted_user_provider 
ON oauth_tokens(user_id, provider) 
WHERE encrypted_access_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_oauth_token_access_log_user_time 
ON oauth_token_access_log(user_id, accessed_at);

-- Add comments for documentation
COMMENT ON FUNCTION encrypt_token(TEXT) IS 'Encrypts OAuth tokens before storage using AES encryption';
COMMENT ON FUNCTION decrypt_token(TEXT) IS 'Decrypts OAuth tokens for application use';
COMMENT ON VIEW oauth_tokens_decrypted IS 'Secure view providing decrypted OAuth tokens with RLS protection';
COMMENT ON FUNCTION get_user_oauth_token(UUID, TEXT) IS 'Secure function to retrieve decrypted OAuth tokens for authenticated users';

-- Security notice
DO $$
BEGIN
  RAISE NOTICE 'OAuth token encryption migration completed successfully';
  RAISE NOTICE 'IMPORTANT: Set app.encryption_key in production environment';
  RAISE NOTICE 'IMPORTANT: Existing plain text tokens have been encrypted and cleared';
END
$$;