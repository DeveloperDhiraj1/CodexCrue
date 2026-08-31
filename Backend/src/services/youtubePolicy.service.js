function durationInSeconds(value) {
  const text = String(value || '').trim().toUpperCase();
  const iso = text.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (iso) return (Number(iso[1] || 0) * 3600) + (Number(iso[2] || 0) * 60) + Number(iso[3] || 0);
  const minutes = text.match(/(\d+(?:\.\d+)?)\s*MIN/);
  const seconds = text.match(/(\d+(?:\.\d+)?)\s*SEC/);
  if (minutes || seconds) return Number(minutes?.[1] || 0) * 60 + Number(seconds?.[1] || 0);
  return null;
}

function isYouTubeCourse(course) {
  return /youtube\.com|youtu\.be/i.test(String(course?.sourceUrl || course?.provider || ''));
}

function isYouTubeShort(course) {
  if (!isYouTubeCourse(course)) return false;
  const text = `${course?.title || ''} ${course?.description || ''} ${(course?.tags || []).join(' ')} ${course?.sourceUrl || ''}`;
  if (/(^|[\s/#_-])shorts?([\s/#_.-]|$)/i.test(text) || /#shorts?/i.test(text)) return true;
  const seconds = durationInSeconds(course?.duration || course?.contentDetails?.duration);
  return seconds !== null && seconds <= 60;
}

module.exports = { durationInSeconds, isYouTubeCourse, isYouTubeShort };
