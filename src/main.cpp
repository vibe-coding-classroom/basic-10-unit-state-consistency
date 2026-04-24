#include <Arduino.h>
#include <ArduinoJson.h>

// --- State Consistency Variables ---
uint32_t last_seq = 0;
bool is_auto_mode = false;

// --- Mock Hardware State ---
struct RobotState {
    int battery = 100;
    float position_x = 0.0;
    float position_y = 0.0;
};
RobotState current_state;

void send_state_with_seq() {
    StaticJsonDocument<200> doc;
    doc["seq"] = last_seq++;
    doc["battery"] = current_state.battery;
    doc["x"] = current_state.position_x;
    doc["y"] = current_state.position_y;
    doc["mode"] = is_auto_mode ? "auto" : "manual";

    String output;
    serializeJson(doc, output);
    Serial.println(output); // In real app, this would be sent via WebSocket/HTTP
}

void handle_command(String json_payload) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, json_payload);

    if (error) return;

    String cmd = doc["command"];
    uint32_t cmd_id = doc["id"];

    // Process command
    if (cmd == "set_auto") {
        is_auto_mode = true;
    } else if (cmd == "set_manual") {
        is_auto_mode = false;
    }

    // --- ACK Logic ---
    StaticJsonDocument<100> ack;
    ack["ack_id"] = cmd_id;
    ack["status"] = "ok";
    
    String ack_output;
    serializeJson(ack, ack_output);
    Serial.println(ack_output);
}

void setup() {
    Serial.begin(115200);
}

void loop() {
    static unsigned long last_send = 0;
    if (millis() - last_send > 1000) {
        send_state_with_seq();
        last_send = millis();
    }

    if (Serial.available()) {
        String input = Serial.readStringUntil('\n');
        handle_command(input);
    }
}
