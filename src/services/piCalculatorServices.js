const { iterationIntervalMs } = require('../config');   
const { readState, writeState, DEFAULT_STATE } = require('../utils/stateManager');

class PiCalculator {
  constructor() {
    // Load the persisted state at startup (or the default)
    this.state = readState();

    // numericSum stores the Leibniz partial sum for PI/4: i.e. pi = 4 * numericSum
    // If there is a persisted pi, we derive numericSum from it; otherwise 0.
    this.numericSum = 0;
    if (this.state.pi && this.state.pi !== "0") {
      // numericSum = pi / 4
      const parsed = parseFloat(this.state.pi);
      if (!Number.isNaN(parsed)) {
        this.numericSum = parsed / 4;
      }
    } else {
      this.numericSum = 0;
    }

    // iteration points to how many terms we've already computed (k)
    // The Leibniz term index for next term is this.state.iteration (starting at 0)
    this.timerId = null;

    // If persisted status was 'running', auto-resume
    if (this.state.status === 'running') {
      // Start the interval to continue computing from last iteration
      this.start();
    }
  }

  // Return the current state object (fresh copy)
  getStatus() {
    return {
      pi: this.state.pi,
      status: this.state.status,
      iteration: this.state.iteration
    };
  }

  // Internal: perform one Leibniz term calculation and persist state
  _doIteration = () => {
    const k = this.state.iteration; // current term index
    // sign = +1 for even k, -1 for odd k
    const sign = (k % 2 === 0) ? 1 : -1;
    const term = sign * (1 / (2 * k + 1));
    // update numeric partial sum (this.numericSum is pi/4)
    this.numericSum += term;
    this.state.iteration = this.state.iteration + 1;
    // Update pi string with new value (we keep full precision as string)
    const piValue = (this.numericSum * 4).toString();
    this.state.pi = piValue;
    // Persist on every iteration
    writeState(this.state);
  };

  // Start or resume the calculation
  start() {
    // If already running, do nothing
    if (this.timerId) {
      this.state.status = 'running';
      writeState(this.state);
      return;
    }

    // If previously 'stopped' and we call start, reset iteration and numericSum
    if (this.state.status === 'stopped') {
      this.state.iteration = 0;
      this.numericSum = 0;
      this.state.pi = "0";
    }

    this.state.status = 'running';
    writeState(this.state); // reflect status change immediately

    // Do an iteration immediately to show quick progress, then schedule recurring
    this._doIteration();

    // Schedule subsequent iterations
    this.timerId = setInterval(() => {
      try {
        this._doIteration();
      } catch (err) {
        console.error('Error during Pi iteration:', err);
        // On error, clear the interval and set status to 'paused' for recovery
        clearInterval(this.timerId);
        this.timerId = null;
        this.state.status = 'paused';
        writeState(this.state);
      }
    }, iterationIntervalMs);
  }

  // Pause the calculation (keep current value)
  pause() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.state.status = 'paused';
    writeState(this.state);
  }

  // Stop the calculation: stop updates, but keep the current pi & iteration
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.state.status = 'stopped';
    writeState(this.state);
  }

  // Reset everything to defaults (pi: "0", iteration: 0, status: "stopped")
  reset() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.state = { ...DEFAULT_STATE };
    this.numericSum = 0;
    writeState(this.state);
  }
}

// Export the class so server can decide whether to instantiate a singleton or multiple instances.
module.exports = PiCalculator;
