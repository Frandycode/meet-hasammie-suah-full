#!/bin/bash
# ── backup.sh — manual database backup script ─────────────────────────────────
#
# Run this directly on your server whenever you want a manual backup:
#   chmod +x scripts/backup.sh
#   ./scripts/backup.sh
#
# Or restore from a backup:
#   ./scripts/backup.sh restore backups/sammie_backup_2025-03-15.sql.gz

set -e

BACKUP_DIR="$(dirname "$0")/../backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="sammie_backup_${DATE}.sql.gz"

# ── Backup ────────────────────────────────────────────────────────────────────
if [ "$1" != "restore" ]; then
  mkdir -p "$BACKUP_DIR"

  echo "📦  Backing up database..."
  docker compose exec -T db pg_dump \
    -U "${POSTGRES_USER:-sammie}" \
    "${POSTGRES_DB:-sammie_site}" \
    | gzip > "$BACKUP_DIR/$FILENAME"

  SIZE=$(du -sh "$BACKUP_DIR/$FILENAME" | cut -f1)
  echo "✅  Backup complete: $BACKUP_DIR/$FILENAME ($SIZE)"

  # Keep last 30 backups
  ls -t "$BACKUP_DIR"/sammie_backup_*.sql.gz 2>/dev/null \
    | tail -n +31 \
    | xargs -r rm --
  echo "📋  Total backups kept: $(ls "$BACKUP_DIR"/sammie_backup_*.sql.gz 2>/dev/null | wc -l)"

# ── Restore ───────────────────────────────────────────────────────────────────
elif [ "$1" = "restore" ] && [ -n "$2" ]; then
  RESTORE_FILE="$2"

  if [ ! -f "$RESTORE_FILE" ]; then
    echo "❌  File not found: $RESTORE_FILE"
    exit 1
  fi

  echo "⚠️   WARNING: This will overwrite the current database!"
  read -p "    Type 'yes' to continue: " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
  fi

  echo "🔄  Restoring from $RESTORE_FILE..."
  gunzip -c "$RESTORE_FILE" | docker compose exec -T db psql \
    -U "${POSTGRES_USER:-sammie}" \
    "${POSTGRES_DB:-sammie_site}"

  echo "✅  Restore complete."
else
  echo "Usage:"
  echo "  ./scripts/backup.sh                        — create a backup"
  echo "  ./scripts/backup.sh restore <file.sql.gz>  — restore from backup"
fi
