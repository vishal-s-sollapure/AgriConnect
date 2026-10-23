const DEVELOPMENT_JWT_SECRET = 'agriconnect_secure_jwt_secret_key_2026';

module.exports = function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
  }

  return DEVELOPMENT_JWT_SECRET;
};
