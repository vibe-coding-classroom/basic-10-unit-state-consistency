/**
 * State Consistency Logic for Frontend
 */

let lastReceivedSeq = -1;
let robotState = {
    battery: 0,
    x: 0,
    y: 0,
    mode: 'unknown'
};

/**
 * Task 1: Sequence Number Filtering
 * Discards old packets to prevent UI jumping
 */
function handleIncomingData(data) {
    if (data.seq > lastReceivedSeq) {
        lastReceivedSeq = data.seq;
        updateSSoT(data);
    } else {
        console.warn(`[Consistency] Discarded out-of-order packet: ${data.seq} (Current: ${lastReceivedSeq})`);
    }
}

/**
 * Task 3: Single Source of Truth (SSoT)
 * UI should only update from this function
 */
function updateSSoT(newData) {
    robotState = { ...robotState, ...newData };
    renderUI();
}

function renderUI() {
    console.log("[UI] Rendering state:", robotState);
    // document.getElementById('status').innerText = robotState.mode;
}

/**
 * Task 2: Reliable Commands (ACK + Retry)
 */
async function sendCommand(command, params = {}, retryCount = 3) {
    const cmdId = Math.floor(Math.random() * 10000);
    const payload = { id: cmdId, command, ...params };

    for (let i = 0; i < retryCount; i++) {
        try {
            console.log(`[Protocol] Sending command ${command} (ID: ${cmdId}), Attempt ${i+1}`);
            const result = await waitForACK(payload, 1000); // 1s timeout
            console.log(`[Protocol] Command ${cmdId} acknowledged!`);
            return result;
        } catch (err) {
            console.warn(`[Protocol] Command ${cmdId} timeout. Retrying...`);
            // Exponential backoff could be added here
        }
    }
    throw new Error(`[Protocol] Command ${cmdId} failed after ${retryCount} attempts.`);
}

function waitForACK(payload, timeout) {
    return new Promise((resolve, reject) => {
        // In a real app, you'd send via WebSocket and listen for response with matching ID
        // Mocking communication here:
        // socket.send(JSON.stringify(payload));
        
        const timer = setTimeout(() => reject('timeout'), timeout);
        
        // Mocking an ACK receiver
        window.addEventListener('ack_received', (e) => {
            if (e.detail.ack_id === payload.id) {
                clearTimeout(timer);
                resolve(e.detail);
            }
        }, { once: true });
    });
}

// Example Usage:
// handleIncomingData({ seq: 10, battery: 90, mode: 'manual' });
// sendCommand('set_auto').catch(console.error);
