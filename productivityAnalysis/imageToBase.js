import axios from 'axios';

/**
 * Converts screenshot logs with imageURL into base64 format
 * @param {Array} screenshots - Array of screenshot objects with imageURL
 * @returns {Promise<Array>} - Array with base64, MIME type, and metadata
 */
export async function convertScreenshotsToBase64(screenshots = []) {
  const results = [];

  for (const shot of screenshots) {
    try {
      const response = await axios.get(shot.imageURL, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      const base64 = buffer.toString('base64');
      if (!base64 || base64.length < 100) {
        console.warn(`⚠️ Skipping base64 screenshot — too short for ${shot.imageURL}`);
        continue;
      }

      results.push({
        ...shot,
        base64,
        mimeType: 'image/png', // or detect dynamically if needed
      });

    } catch (err) {
      console.error(`❌ Failed to fetch ${shot.imageURL}: ${err.message}`);
    }
    console.log(`✅ Converted screenshot ${shot.imageURL} to base64`);
  }

  return results;
}
