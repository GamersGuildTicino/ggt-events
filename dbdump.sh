TIMESTAMP=$(date +%Y%m%d%H%M%S)

npx supabase db dump --linked -f "db-dump/${TIMESTAMP}-schema.sql"
npx supabase db dump --linked --data-only -f "db-dump/${TIMESTAMP}-data.sql"
