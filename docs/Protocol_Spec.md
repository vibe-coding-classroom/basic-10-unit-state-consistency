# Reliable Robot Communication Protocol (RRCP)

This document defines the protocol used to ensure state consistency between the robot (ESP32) and the Control Panel (Web).

## 1. Data Streaming (Robot -> Web)

The robot streams its state every 1000ms.

**Payload Format:**
```json
{
  "seq": 1234,
  "battery": 85,
  "x": 10.5,
  "y": -2.3,
  "mode": "auto"
}
```

- **`seq` (Sequence Number)**: An incrementing integer. The receiver must ignore any packet with a `seq` less than or equal to the `lastReceivedSeq`.

## 2. Command Protocol (Web -> Robot)

Commands require an explicit acknowledgement (ACK) from the robot.

**Request Format:**
```json
{
  "id": 99,
  "command": "set_auto"
}
```

- **`id` (Command ID)**: A unique identifier for the command (randomly generated).

**Response Format (ACK):**
```json
{
  "ack_id": 99,
  "status": "ok"
}
```

## 3. Reliability Strategies

### 3.1. Sequence Filtering
To solve the "Network Lie" caused by out-of-order packets (UDP-like behavior or high latency jitter), the frontend implements a strict sequence filter.

### 3.2. Retry & Timeout
If a command ID is not acknowledged within 500ms-1000ms, the frontend will re-issue the command up to 3 times before declaring a communication failure.

### 3.3. SSoT (Single Source of Truth)
The UI state is **never** updated optimistically when a button is clicked. It only updates when the robot confirms the state change via its periodic data stream.
