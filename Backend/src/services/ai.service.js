const axios = require('axios');
const config = require('../config/env');
const { buildMessages } = require('./aiContext.service');

class AIProviderUnavailableError extends Error {
  constructor(message = 'AI provider is not configured or unavailable.') {
    super(message);
    this.statusCode = 503;
    this.name = 'AIProviderUnavailableError';
  }
}

class AIService {
  _validateConfig() {
    if (!config.aiApiUrl || !config.aiModel) {
      throw new AIProviderUnavailableError('AI provider is not configured. Set AI_API_URL and AI_MODEL in .env');
    }
    if (!config.aiApiKey) {
      throw new AIProviderUnavailableError('AI API key is missing. Set AI_API_KEY in Backend/.env');
    }
    const isGemini = config.aiApiUrl.includes('generativelanguage.googleapis.com');
    if (isGemini && !config.aiApiKey.startsWith('AIza')) {
      throw new AIProviderUnavailableError(
        'Invalid Gemini API key. It must start with "AIza". ' +
        'Get a free key at https://aistudio.google.com/apikey and set AI_API_KEY in Backend/.env'
      );
    }
  }

  // Extract retry-after seconds from Gemini 429 error message
  _parseRetryAfter(errorData) {
    try {
      const msg = errorData?.error?.message || errorData?.error?.details?.[0]?.description || '';
      const match = msg.match(/retry in ([\d.]+)s/i);
      return match ? Math.ceil(parseFloat(match[1])) : null;
    } catch {
      return null;
    }
  }

  async _callGemini(messages) {
    const isGemini = config.aiApiUrl.includes('generativelanguage.googleapis.com');
    const payload = isGemini
      ? {
          systemInstruction: { parts: [{ text: messages[0].content }] },
          contents: messages.slice(1).map(({ role, content }) => ({
            role: role === 'assistant' ? 'model' : 'user',
            parts: [{ text: content }]
          })),
          generationConfig: { temperature: 0.2, maxOutputTokens: config.aiMaxTokens }
        }
      : { model: config.aiModel, messages, temperature: 0.2, max_tokens: config.aiMaxTokens };

    const response = await axios.post(config.aiApiUrl, payload, {
      timeout: config.aiTimeoutMs,
      headers: {
        'Content-Type': 'application/json',
        ...(isGemini
          ? { 'x-goog-api-key': config.aiApiKey }
          : { Authorization: `Bearer ${config.aiApiKey}` })
      }
    });

    const isGeminiResp = config.aiApiUrl.includes('generativelanguage.googleapis.com');
    const reply = isGeminiResp
      ? response.data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('')
      : response.data?.choices?.[0]?.message?.content;

    if (typeof reply !== 'string' || reply.trim().length === 0) {
      throw new AIProviderUnavailableError('AI provider returned an empty response.');
    }
    return reply.trim();
  }

  async chat(message, profile, learningPath, history) {
    this._validateConfig();

    const messages = buildMessages(message, profile, learningPath, history);
    const MAX_RETRIES = 2;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this._callGemini(messages);
      } catch (error) {
        if (error instanceof AIProviderUnavailableError) throw error;

        const status = error.response?.status;
        const errorData = error.response?.data;
        const providerMsg = errorData?.error?.message || error.code || error.message;

        // Handle rate limiting with intelligent retry
        if (status === 429) {
          const retryAfterSec = this._parseRetryAfter(errorData);
          console.warn(`[AI Service] Rate limited (attempt ${attempt + 1}/${MAX_RETRIES + 1}). Retry after: ${retryAfterSec ?? 'unknown'}s`);

          if (attempt < MAX_RETRIES && retryAfterSec && retryAfterSec <= 30) {
            // Auto-retry if wait is short (≤30s) and we have retries left
            await new Promise(resolve => setTimeout(resolve, retryAfterSec * 1000 + 500));
            continue;
          }

          // Rate limit can't be auto-resolved — give user actionable message
          const waitMsg = retryAfterSec ? ` Please wait ${retryAfterSec} seconds and try again.` : '';
          throw new AIProviderUnavailableError(
            `AI rate limit reached (free tier: 1,500 requests/day).${waitMsg}`
          );
        }

        // Auth errors
        if (status === 400 || status === 401 || status === 403) {
          throw new AIProviderUnavailableError(
            `AI API key rejected (${status}). Generate a valid key at https://aistudio.google.com/apikey`
          );
        }

        console.error(`[AI Service] Provider error ${status}: ${providerMsg}`);
        const detail = process.env.NODE_ENV !== 'production'
          ? `AI provider error (${status}): ${providerMsg}`
          : 'AI provider request failed.';
        throw new AIProviderUnavailableError(detail);
      }
    }
  }
}

module.exports = new AIService();
module.exports.AIProviderUnavailableError = AIProviderUnavailableError;
