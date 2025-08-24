# Acceptance Criteria (BDD Format)

This document defines the behavior of the **naluri-space-pi** backend service in Behavior-Driven Development (BDD) style.

---

## Feature: Pi Calculation Service

As an API consumer,
I want to control and monitor a running calculation of π using the Leibniz formula,
So that I can retrieve an approximation of π for further computations.

---

### Scenario 1: Start Calculation

**Given** the server is running
**And** the current status is `stopped` or `paused`
**When** I send a POST request to `/control` with body:

```json
{ "action": "start" }
```

**Then** the service should:

* Start or resume the calculation process.
* Update `status` to `running`.
* Respond with JSON containing current `pi`, `status`, and `iteration`.

---

### Scenario 2: Pause Calculation

**Given** the current status is `running`
**When** I send:

```json
{ "action": "pause" }
```

**Then** the service should:

* Pause calculation without resetting values.
* Update `status` to `paused`.
* Keep the last computed `pi` and `iteration`.

---

### Scenario 3: Stop Calculation

**Given** the current status is `running`
**When** I send:

```json
{ "action": "stop" }
```

**Then** the service should:

* Stop calculation (halt iterations).
* Update `status` to `stopped`.
* Preserve the last computed `pi` and `iteration` in the state file.

---

### Scenario 4: Reset Calculation

**Given** any status (running, paused, stopped)
**When** I send:

```json
{ "action": "reset" }
```

**Then** the service should:

* Stop any ongoing calculation.
* Reset `pi` to `0`, `iteration` to `0`, and `status` to `stopped`.
* Persist the reset state to disk.

---

### Scenario 5: Get Current Status

**Given** the server is running
**When** I send a GET request to `/status`
**Then** the service should respond with:

```json
{
  "pi": "<latest-pi-value>",
  "status": "<running|paused|stopped>",
  "iteration": <latest-iteration-count>
}
```

---

### Scenario 6: Resume After Pause

**Given** the current status is `paused`
**And** I previously computed some iterations
**When** I send:

```json
{ "action": "start" }
```

**Then** the service should:

* Resume from the last iteration.
* Continue updating `pi` and `iteration`.

---

### Scenario 7: Restart After Stop

**Given** the current status is `stopped`
**When** I send:

```json
{ "action": "start" }
```

**Then** the service should:

* Reset `pi` and `iteration` to `0` before starting.
* Begin calculation from the first term.

---

### Scenario 8: Persistence Across Restarts

**Given** the service has computed some iterations
**And** the server restarts
**When** it reads the `state.json` file
**Then** it should:

* Resume calculation automatically if `status` was `running` before restart.
* Remain paused or stopped if that was the previous status.

---

### Scenario 9: Invalid Action Handling

**Given** I send an invalid action, e.g.:

```json
{ "action": "foobar" }
```

**When** I POST to `/control`
**Then** the service should:

* Respond with HTTP 400 Bad Request.
* Include an error message in the response body.

---

### Scenario 10: Missing Action Handling

**Given** I send an empty body or missing `action`
**When** I POST to `/control`
**Then** the service should:

* Respond with HTTP 400 Bad Request.
* Include an error message like `"Missing action in request body"`.

---

### Notes:

* Calculation uses **Leibniz formula**.
* Approximation improves as iterations increase.
* State is persisted in `state/state.json` after every update.
