const { Client } = require('pg');

const creds = [
  {
    user: "postgres.ehiqtlofblrddauixeuz",
    pass: "Divya@Yagyam@123",
    port: 6543,
    desc: "Pooler, Username with tenant, password with @"
  },
  {
    user: "postgres",
    pass: "Divya@Yagyam@123",
    port: 6543,
    desc: "Pooler, Username postgres, password with @"
  },
  {
    user: "postgres.ehiqtlofblrddauixeuz",
    pass: "Divya@Yagyam@123",
    port: 5432,
    desc: "Direct, Username with tenant, password with @"
  },
  {
    user: "postgres",
    pass: "Divya@Yagyam@123",
    port: 5432,
    desc: "Direct, Username postgres, password with @"
  },
  {
    user: "postgres.ehiqtlofblrddauixeuz",
    pass: "DivyaYagyam@123",
    port: 6543,
    desc: "Pooler, Username with tenant, password without first @"
  },
  {
    user: "postgres.ehiqtlofblrddauixeuz",
    pass: "DivyaYagyam@123",
    port: 5432,
    desc: "Direct, Username with tenant, password without first @"
  }
];

async function testAll() {
  for (const c of creds) {
    console.log(`\nTesting: ${c.desc}...`);
    const encodedPass = encodeURIComponent(c.pass);
    const connectionString = `postgresql://${c.user}:${encodedPass}@aws-1-ap-northeast-2.pooler.supabase.com:${c.port}/postgres`;
    const client = new Client({ connectionString });
    try {
      await client.connect();
      console.log(`SUCCESS! Connected successfully with: ${c.desc}`);
      await client.end();
      return;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }
}

testAll();
