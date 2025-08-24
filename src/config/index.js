// src/config/index.js
const path = require('path');

module.exports = {
  // Use port 3001 to match the assessment spec
  port: process.env.PORT || 3001,
  // Persisted state JSON file path (project-root/state/state.json)
  stateFilePath: path.join(process.cwd(), 'state', 'state.json'),
  // Interval for Pi iterations (milliseconds). Increase/decrease for speed.
  iterationIntervalMs: 2000
};
