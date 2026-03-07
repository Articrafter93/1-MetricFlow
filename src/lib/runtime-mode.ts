export function isMockDatabaseEnabled() {
  if (process.env.MOCK_DB_ENABLED === "true") {
    return true;
  }

  return !process.env.DATABASE_URL;
}

