const axios = require('axios');
const config = require('../config');
const { cmd } = require('../command');

/**
 * Sinhala AI chat command
 * Usage:
 *   .si <prompt>        -> Sinhala answer
 *   .siai <prompt>      -> same as .si
 */
cmd({
  pattern: 'si',
  alias: ['siai','ai-si'],
  react: '🩸',
  desc: 'Sinhala AI assistant (OpenAI-compatible)',
  category: 'ai',
  filename: __filename
}, 
async (conn, mek, m, { body, args, reply, isCreator }) => {
  try {
    const prompt = (args && args.length ? args.join(' ') : '').trim();
    if (!prompt) return reply('⚠️ කරුණාකර prompt එක දාන්න. උදා: *.si මට ලිව්වම් කෙටියෙන් කියලා දෙන්න*');

    const apiKey = config.OPENAI_API_KEY;
    const baseURL = (config.OPENAI_BASE || 'https://api.openai.com/v1').replace(/\/+$/,'') + '/chat/completions';
    const model = config.AI_MODEL || 'gpt-4o-mini';
    if (!apiKey) {
      return reply('❌ OPENAI_API_KEY සෙට් කරලා නැහැ. Heroku/Render env vars වල OPENAI_API_KEY එක add කරන්න.');
    }

    const systemPrompt = config.AI_SINHALA_SYSTEM || 'ඔබ සින්හලෙන්ම කතා කරන AI උදව්කාරයෙක්.';

    const payload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    };

    const res = await axios.post(baseURL, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    const text = res?.data?.choices?.[0]?.message?.content?.trim();
    if (!text) return reply('⚠️ AI පිළිතුරක් ලැබුනේ නැහැ.');

    return reply(text);
  } catch (err) {
    console.error('SI AI ERROR:', err?.response?.data || err.message);
    return reply('❌ AI error. විස්තර: ' + (err?.response?.data?.error?.message || err.message));
  }
});
