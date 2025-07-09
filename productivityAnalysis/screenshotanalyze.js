import { ai } from "../utils/geminiClient.js"
export async function analyzeMultipleScreenshots(base64Screenshots, activeWindows, fileLogs, startTime, endTime) {
    const windowSummary = await summarizeActiveWindows(activeWindows);
    const fileSummary = await summarizeFileLogs(fileLogs);
    console.log(`we are starting the  analysis for this batch time starts from ${startTime}to endtime -> ${endTime}`)
    const promptText = `
You are an AI productivity analyst. Your task is to evaluate a user's behavior during the specified time window using screenshots, active window logs, and file activity.

📊 Time Window:
From ${startTime} to ${endTime}

🪟 Active Window Timeline:
${windowSummary || "No active window logs"}

📂 File Events:
${fileSummary || "No file access events"}

📸 Screenshots:
Attached below. Evaluate visible apps, windows, tabs, filenames, terminals, and detect duplication or inactivity.

---

🧠 Your JSON response must follow this strict format:

{
  "timeWindow": { "start": "${startTime}", "end": "${endTime}" },
  "appsUsed": [
    {
      "name": "string",
      "category": "Development | Communication | Entertainment | System Debugging | Mixed | Other",
      "purpose": "string",
      "durationEstimate": "string"
    }
  ],
  "screenshotInsights": {
    "appsDetected": ["string"],
    "codeFiles": ["string"],
    "terminalsVisible": true,
    "activitiesObserved": ["string"]
  },
  "distractions": [
    {
      "app": "string",
      "contentType": "string",
      "durationEstimate": "string",
      "comment": "string"
    }
  ],
  "neutralApps": ["string"],
  "suspiciousEvents": [
    {
      "timestamp": "ISO_TIMESTAMP",
      "event": "file_delete | file_open | file_modify",
      "filePath": "string",
      "process": "string",
      "comment": "string"
    }
  ],
  "prolongedStaticWindow": {
    "app": "string",
    "duration": "string",
    "start": "ISO_TIMESTAMP",
    "end": "ISO_TIMESTAMP",
    "comment": "string"
  },
  "unfocusedScreenshots": [
    {
      "timestamp": "ISO_TIMESTAMP",
      "comment": "string"
    }
  ],
  "redundantScreenshots": {
    "count": 0,
    "duration": "string",
    "comment": "string"
  },
  "productivityScore": 0,
  "scoreExplanation": "string",
  "summary": "string",
  "detailedObservation": "string"
}

🧠 Extra Logic to Apply:

- Flag any window (e.g., VS Code) open for 20+ mins without file activity or changes — possible fake focus.
- Detect and list screenshots that look visually identical (≥2 times) — possible idleness.
- If screenshots show only the desktop, blank screens, or locked screen — mark as unproductive.
- Highlight file deletions of screen recordings or critical files as suspicious unless justified.
- Cross-reference window durations with file access and screenshot content to catch subtle unproductivity.

❗ Output only valid JSON. No markdown, no explanation outside the JSON.
`;


    const parts = [
        { text: promptText },
        ...Array.isArray(base64Screenshots) ? base64Screenshots.flatMap((s, i) => [
            { text: `🕒 Screenshot ${i + 1} Timestamp: ${s.timestamp}` },
            {
                inlineData: {
                    mimeType: s.mimeType || 'image/png',
                    data: s.base64
                }
            }
        ]) : []
    ];


    console.log('🧪 Gemini Parts:', parts.map((p, i) => ({
        index: i,
        hasInlineData: !!p.inlineData,
        base64Length: p.inlineData?.data?.length || 0,
    })));

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [{ role: "user", parts }]
    });

    // ✅ Extract valid JSON from response.text
    const match = response.text.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error("❌ Gemini response is not a valid JSON string");
    }

    let geminiJson;
    try {
        geminiJson = JSON.parse(match[0]); // now it's a proper object
    } catch (e) {
        console.error("❌ Failed to parse Gemini response:", e.message);
        throw e;
    }

    console.log("✅ Gemini JSON:", geminiJson);
    return geminiJson;
}

function summarizeActiveWindows(activeWindows) {
    return activeWindows
        .map(w => `🪟 [${w.startTime} – ${w.endTime}] ${w.windowTitle} (${w.application})`)
        .join("\n");
}

function summarizeFileLogs(fileLogs) {
    return fileLogs
        .filter(f => ['open', 'modify', 'delete'].includes(f.event))
        .map(f => `📂 [${f.timestamp}] ${f.event.toUpperCase()} ${f.path} via ${f.process}`)
        .join("\n");
}