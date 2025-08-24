const express = require("express");
const cors = require('cors');
const { port } = require('./src/config');
const PiCalculator = require('./src/services/piCalculatorServices');
const { readState } = require('./src/utils/stateManager');

const app = express();
app.use(cors());
app.use(express.json());

// Instantiate one PiCalculator for the application
const calculation = new PiCalculator();

app.get("/", (req, res) => {
  res.json({ message: "This is the Naluri Space Pi server!" });
});

// GET /status - return current state
app.get('/status', (req, res) => {
  try {
    const state = readState(); // read persisted state (fresh)
    return res.json(state);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to read state' });
  }
});

// POST /control - body: { action: "start" | "pause" | "stop" | "reset" }
app.post('/control', (req, res) => {
  const { action } = req.body;
  if (!action) {
    return res.status(400).json({ error: 'Missing action in request body' });
  }

  try {
    switch (action) {
      case 'start':
        calculation.start();
        break;
      case 'pause':
        calculation.pause();
        break;
      case 'stop':
        calculation.stop();
        break;
      case 'reset':
        calculation.reset();
        break;
      default:
        return res.status(400).json({ error: `Invalid action: ${action}` });
    }
    // Return updated state after the action
    return res.json(calculation.getStatus());
  } catch (err) {
    console.error('Error handling /control:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Naluri Space Pi server running on port ${port}`);
  console.log('Endpoints: GET /status, POST /control { action: start|pause|stop|reset }');
});
