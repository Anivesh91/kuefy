const getAllowedOrigins = () => {
  const envOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const localOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  return Array.from(new Set([...envOrigins, ...localOrigins]));
};

const isOriginAllowed = (origin) => {
  // Allow requests with no origin (like mobile apps, curl, or server-to-server)
  if (!origin) return true;
  const allowed = getAllowedOrigins();
  return allowed.includes(origin);
};

module.exports = {
  getAllowedOrigins,
  isOriginAllowed,
};
