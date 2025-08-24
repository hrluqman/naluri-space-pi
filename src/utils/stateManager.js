const fs = require("fs");
const { stateFilePath } = require("../config");

// Default state of the Pi response
const DEFAULT_STATE = {
  pi: "0", // Pi as string
  status: "stopped", // 'running' | 'paused' | 'stopped'
  iteration: 0, // number of terms computed
};

function readState() {
  try {
    const raw = fs.readFileSync(stateFilePath, "utf8");
    const parsed = JSON.parse(raw);
    // Validate keys
    if (
      typeof parsed.pi === "string" &&
      (parsed.status === "running" ||
        parsed.status === "paused" ||
        parsed.status === "stopped") &&
      typeof parsed.iteration === "number"
    ) {
      return JSON.parse(JSON.stringify(parsed));
    } else {
      // Invalid shape — reset
      fs.writeFileSync(
        stateFilePath,
        JSON.stringify(DEFAULT_STATE, null, 2),
        "utf8"
      );
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  } catch (err) {
    // On any error, attempt to recover by writing default state.
    try {
      fs.writeFileSync(
        stateFilePath,
        JSON.stringify(DEFAULT_STATE, null, 2),
        "utf8"
      );
    } catch (writeErr) {
      console.error("Failed to write default state.json:", writeErr);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function writeState(newState) {
  try {
    fs.writeFileSync(stateFilePath, JSON.stringify(newState, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write state.json:", err);
  }
}

module.exports = { readState, writeState, DEFAULT_STATE };
