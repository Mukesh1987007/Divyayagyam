const fs = require('fs');

function setup() {
  let url = process.env.DATABASE_URL || '';
  let directUrl = process.env.DIRECT_URL || '';

  console.log('Original DATABASE_URL length:', url.length);
  console.log('Original DIRECT_URL length:', directUrl.length);

  // 1. Check if Cloud SQL parameters are present
  if (process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_DB_NAME) {
    console.log('Cloud SQL environment detected. Constructing connection URL.');
    const host = process.env.SQL_HOST;
    const user = process.env.SQL_USER;
    const password = process.env.SQL_PASSWORD || '';
    const dbName = process.env.SQL_DB_NAME;
    url = `postgresql://${user}:${encodeURIComponent(password)}@localhost/${dbName}?host=${encodeURIComponent(host)}`;
    directUrl = url;
  }

  // 2. Clean up if url contains 'DATABASE_URL=' (pasted full declaration)
  if (url.includes('DATABASE_URL=')) {
    const match = url.match(/DATABASE_URL=["']?([^"'\s]+)["']?/);
    if (match && match[1]) {
      url = match[1];
    } else {
      url = url.split('DATABASE_URL=')[1].trim().replace(/['"]/g, '');
    }
  }

  // 3. Clean up if directUrl contains 'DIRECT_URL=' or similar
  if (directUrl.includes('DIRECT_URL=')) {
    const match = directUrl.match(/DIRECT_URL=["']?([^"'\s]+)["']?/);
    if (match && match[1]) {
      directUrl = match[1];
    } else {
      directUrl = directUrl.split('DIRECT_URL=')[1].trim().replace(/['"]/g, '');
    }
  } else if (directUrl.includes('DATABASE_URL=')) {
    const match = directUrl.match(/DATABASE_URL=["']?([^"'\s]+)["']?/);
    if (match && match[1]) {
      directUrl = match[1];
    } else {
      directUrl = directUrl.split('DATABASE_URL=')[1].trim().replace(/['"]/g, '');
    }
  }

  if (!url) {
    console.error('❌ Error: DATABASE_URL is missing!');
    process.exit(1);
  }

  if (!directUrl) {
    directUrl = url;
  }

  console.log('Cleaned DATABASE_URL length:', url.length);
  console.log('Cleaned DIRECT_URL length:', directUrl.length);

  // Read existing .env if any, or construct new content
  let envContent = '';
  envContent += `DATABASE_URL=${url}\n`;
  envContent += `DIRECT_URL=${directUrl}\n`;

  // Preserve other relevant environment variables
  const otherVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_JWT_SECRET',
    'NEXT_PUBLIC_APP_URL',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
  ];

  otherVars.forEach(v => {
    if (process.env[v]) {
      envContent += `${v}=${process.env[v]}\n`;
    }
  });

  fs.writeFileSync('.env', envContent, 'utf8');
  fs.writeFileSync('.env.local', envContent, 'utf8');
  console.log('✅ Successfully created clean .env and .env.local files!');
}

setup();
