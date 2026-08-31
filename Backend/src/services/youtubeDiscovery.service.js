const axios = require('axios');
const Course = require('../models/Course');
const config = require('../config/env');
const { isYouTubeShort } = require('./youtubePolicy.service');

function languageQuery(profile) {
  const language = String(profile.preferredLanguage || 'en').toLowerCase();
  return language === 'hi' ? ' Hindi' : language === 'hinglish' ? ' Hindi Hinglish' : '';
}

function buildQuery(profile) {
  const goal = [profile.learningGoal, profile.careerGoal, profile.learningComment].filter(Boolean).join(' ');
  const interests = (profile.interests || []).slice(0, 5).join(' ');
  const skills = (profile.currentSkills || []).slice(0, 8).join(' ');
  return `${goal} ${interests} ${skills}${languageQuery(profile)} tutorial course`.trim().slice(0, 180);
}

function durationLabel(item) {
  const minutes = Math.max(1, Math.round((Number(item.contentDetails?.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)?.[1] || 0) * 60) + Number(item.contentDetails?.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)?.[2] || 0)));
  return `${minutes} minutes`;
}

async function discoverYouTubeCourses(profile) {
  if (!config.youtubeApiKey) return 0;
  const query = buildQuery(profile);
  try {
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', { timeout: 7000, params: { key: config.youtubeApiKey, part: 'snippet', q: query, type: 'video', maxResults: Math.min(25, config.youtubeSearchLimit), order: 'relevance', safeSearch: 'strict', videoEmbeddable: 'true', relevanceLanguage: profile.preferredLanguage === 'hi' ? 'hi' : 'en' } });
    const ids = (searchResponse.data?.items || []).map((item) => item.id?.videoId).filter(Boolean);
    if (!ids.length) return 0;
    const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', { timeout: 7000, params: { key: config.youtubeApiKey, part: 'snippet,contentDetails,statistics,status', id: ids.join(',') } });
    const operations = (videoResponse.data?.items || []).filter((item) => item.status?.privacyStatus === 'public' && item.status?.embeddable !== false).map((item) => {
      const snippet = item.snippet || {};
      const title = String(snippet.title || '').replace(/<[^>]+>/g, '').trim();
      const description = String(snippet.description || '').slice(0, 800);
      const language = /hindi|hinglish|हिंदी/i.test(`${title} ${description}`) ? 'hi' : 'en';
      const course = { title, description: description || `Public YouTube lesson about ${query}.`, instructor: snippet.channelTitle || 'YouTube creator', provider: `YouTube / ${snippet.channelTitle || 'Public creator'}`, sourceUrl: `https://www.youtube.com/watch?v=${item.id}`, isFree: true, qualityScore: 0.72, skills: [...new Set([...(profile.currentSkills || []), ...(profile.interests || [])])].slice(0, 8), difficulty: 'Beginner', duration: durationLabel(item), category: 'Internet learning', language, contentType: 'video', tags: ['free', 'public', 'youtube', 'live-discovered'], status: 'published' };
      if (isYouTubeShort(course)) return null;
      return { updateOne: { filter: { sourceUrl: course.sourceUrl }, update: { $set: course }, upsert: true } };
    }).filter(Boolean);
    if (operations.length) await Course.bulkWrite(operations);
    return operations.length;
  } catch (error) {
    console.warn(`[YouTube discovery] ${error.response?.data?.error?.message || error.message}`);
    return 0;
  }
}

module.exports = { discoverYouTubeCourses, buildQuery };
