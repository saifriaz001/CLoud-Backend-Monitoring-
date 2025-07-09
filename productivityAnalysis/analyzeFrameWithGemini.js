// utils/analyzeFrameWithGemini.js
import { ai } from '../utils/geminiClient.js';

/**
 * Analyze a single productivity frame using Gemini
 * @param {Array} activeWindows
 * @param {Array} screenshots - Assuming this is an array like [{ url: 'http://...' }]
 * @param {Array} fileLogs
 * @param {Date} startTime
 * @param {Date} endTime
 */
export async function analyzeFrameWithGemini(
  activeWindows,
  screenshots, 
  fileLogs,
  startTime,
  endTime
) {
  const aw = Array.isArray(activeWindows) ? activeWindows : [];
  const fl = Array.isArray(fileLogs) ? fileLogs : [];
  
  // 1. Extract URLs from the screenshot data
  const urls = Array.isArray(screenshots)
    ? screenshots.map(s => s.imageURL).filter(Boolean) // Get URLs and filter out any null/undefined
    : [];

  // 2. Modify the prompt to include the URLs and instruct the AI
  const prompt = `
You are an advanced AI productivity analyst. Your job is to evaluate a user's behavior during a 10-minute work session based on:

1. Active window usage
2. Files accessed
3. The content of web pages the user visited.

---

🕒 Time Window:
From ${new Date(startTime).toISOString()} to ${new Date(endTime).toISOString()}

---

🪟 Active Window Logs:
${aw.length > 0
    ? aw.map(w => `- ${w.windowTitle || 'Unknown Window'} (${w.application || 'Unknown App'})`).join('\n')
    : 'None'}

---

📂 File Logs:
${fl.length > 0
    ? fl.map(f => `- ${f.event || 'open'}: ${f.filePath || 'unknown file'}`).join('\n')
    : 'None'}

---

🌐 URLs Visited (from screenshots):
You have access to the content of these pages. Analyze them to understand the user's activity.
${urls.length > 0 ? urls.map(url => `- ${url}`).join('\n') : 'None'}

---

🎯 Instructions:
- Analyze the content from the provided URLs to determine if the work was productive.
- Detect whether the user was productive or distracted during this session.
- Mark any apps or websites as **productive**, **neutral**, or **distracting**.
- Give a **productivity score out of 10**.
- Provide a brief summary in 3 bullet points.
`;

  // 3. Define the tool to use
  const geminiTools = [{
    urlContext: {},
  }];

  // 4. Call Gemini with the prompt and the URL context tool enabled
  const result = await runGeminiFlashPrompt(prompt, geminiTools);

  console.log(`🔍 Gemini analysis result:\n${result}`);
  return result;
}