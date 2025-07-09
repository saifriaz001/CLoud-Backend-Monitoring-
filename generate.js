import fs from 'fs';

// Load the JSON file
const data = JSON.parse(fs.readFileSync('./screenshots_base64.json', 'utf-8'));

// Start HTML
let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Base64 Screenshot Gallery</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    .image-box { margin-bottom: 30px; }
    img { max-width: 100%; border: 2px solid #ccc; }
    .meta { margin: 10px 0; font-size: 14px; color: #444; }
  </style>
</head>
<body>
  <h1>Screenshot Preview from JSON</h1>
`;

// Add images
for (const item of data) {
  html += `
  <div class="image-box">
    <div class="meta">
      <strong>ID:</strong> ${item._id} <br/>
      <strong>Size:</strong> ${item.sizeKB || 'N/A'} KB<br/>
      <strong>MIME:</strong> ${item.mimeType}
    </div>
    <img src="data:${item.mimeType};base64,${item.base64}" alt="Screenshot - ${item._id}" />
  </div>
  `;
}

// End HTML
html += `
</body>
</html>
`;

// Save to file
fs.writeFileSync('screenshots_gallery.html', html);
console.log('✅ HTML file generated: screenshots_gallery.html');
