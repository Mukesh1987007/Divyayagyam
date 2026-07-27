const OpenAI = require('openai');
const client = new OpenAI({ apiKey: 'dummy', baseURL: 'https://api.openai.com/v1' });
client.chat.completions.create({ model: 'gemini-1.5-flash', messages: [{role: 'user', content: 'hi'}] })
  .catch(e => console.log('ERROR:', e.message));
