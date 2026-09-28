#!/bin/sh
# docker-entrypoint.sh
#
# Runs Prisma migrations before starting the application.
# Handles P3018/P3009 (failed/stuck migration record) by resetting public schema and retrying.
#
# Why here and not in CI/CD?
#   - ECS tasks in private subnets can reach RDS directly at boot time
#   - migrate deploy is idempotent: already-applied migrations are skipped
#   - If migration fails, container exits → ECS marks unhealthy → no traffic routed

set -e

echo "[entrypoint] Running database migrations..."

# Capture output + exit code (set -e is temporarily bypassed via subshell)
MIGRATE_OUT=$(node_modules/.bin/prisma migrate deploy 2>&1) && MIGRATE_EXIT=0 || MIGRATE_EXIT=$?
printf '%s\n' "$MIGRATE_OUT"

if [ "$MIGRATE_EXIT" -ne 0 ]; then
	if printf '%s' "$MIGRATE_OUT" | grep -qE "P3018|P3009"; then
		echo "[entrypoint] P3018/P3009 detected — previous migration failed or is stuck."
		echo "[entrypoint] Resetting public schema for clean re-apply..."

		node -e "
const { Client } = require('pg');
const url = new URL(process.env.DATABASE_URL);
const client = new Client({
	host: url.hostname,
	port: parseInt(url.port || '5432'),
	database: url.pathname.slice(1),
	user: decodeURIComponent(url.username),
	password: decodeURIComponent(url.password),
	ssl: { rejectUnauthorized: false },
});
client.connect()
	.then(() => client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO PUBLIC;'))
	.then(() => { console.error('[entrypoint] Schema reset complete.'); return client.end(); })
	.catch(err => { console.error('[entrypoint] Schema reset failed:', err.message); process.exit(1); });
"

		echo "[entrypoint] Retrying migrations on clean schema..."
		node_modules/.bin/prisma migrate deploy
	else
		echo "[entrypoint] Migration failed with unexpected error. Aborting."
		exit 1
	fi
fi

echo "[entrypoint] Migrations complete."
echo "[entrypoint] Starting application..."
exec node dist/apps/protrack-backend-api/main
