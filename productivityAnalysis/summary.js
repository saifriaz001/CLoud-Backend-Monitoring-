export function summarizeActiveWindows(activeWindows) {
  return activeWindows
    .map(w => `🪟 [${w.startTime} – ${w.endTime}] ${w.windowTitle} (${w.application})`)
    .join("\n");
}


export function summarizeFileLogs(fileLogs) {
  return fileLogs
    .filter(f => ['open', 'modify', 'delete'].includes(f.event))
    .map(f => `📂 [${f.timestamp}] ${f.event.toUpperCase()} ${f.path} via ${f.process}`)
    .join("\n");
}
