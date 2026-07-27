const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const OpenAI = require('openai');

async function check() {
  const geminiKey = await prisma.websiteSetting.findUnique({ where: { key: 'secret.gemini_api_key' }});
  
  if (!geminiKey) return console.log('No Gemini key found');
  
  const key = geminiKey.value.replace(/^"|"$/g, '');
  const client = new OpenAI({ apiKey: key, baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/' });
  
  try {
    const res = await client.chat.completions.create({
      model: 'gemini-1.5-flash',
      messages: [{ role: 'user', content: 'Say hello in Hindi' }]
    });
    console.log('SUCCESS:', res.choices[0].message.content);
  } catch(e) {
    console.log('ERROR:', e.message);
  }
}
check().finally(() => prisma.$disconnect());
