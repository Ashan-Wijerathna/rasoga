module.exports = {
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://www.rasogha.com',

  PORT: process.env.PORT || 8080,

  JWT_SECRET: process.env.JWT_SECRET || 'dhaham_secret_key_2025',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  UPLOADS_URL: '/uploads',

  PHOTO_MAX_SIZE: 2 * 1024 * 1024,
  DOCUMENT_MAX_SIZE: 5 * 1024 * 1024,
  ARTWORK_MAX_SIZE: 10 * 1024 * 1024,

  RATE_LIMIT_WINDOW: 15 * 60 * 1000,
  RATE_LIMIT_MAX: 500,

  OTP_EXPIRY_MINUTES: 10,
  OTP_RESEND_COOLDOWN: 60,
};
