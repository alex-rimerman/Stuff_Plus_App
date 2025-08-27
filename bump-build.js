const fs = require('fs');
const path = require('path');

// Path to your app.config.js
const configPath = path.join(__dirname, 'app.config.js');

// Read the current file
let file = fs.readFileSync(configPath, 'utf-8');

// Find buildNumber and increment it
const newFile = file.replace(
  /buildNumber:\s*"(\d+)"/,
  (_, num) => {
    const newBuild = parseInt(num) + 1;
    console.log(`✅ Incremented buildNumber: ${num} → ${newBuild}`);
    return `buildNumber: "${newBuild}"`;
  }
);

// Write the updated file back
fs.writeFileSync(configPath, newFile);
console.log('✅ app.config.js updated successfully');
