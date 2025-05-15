#include <PubSubClient.h>
#include "secrets.h"

extern void turnOnRelay(int relayIndex);
extern void turnOffRelay(int relayIndex);

extern WiFiClient espClient;
extern PubSubClient client;

unsigned long lastReconnectAttempt = 0;
const long reconnectInterval = 5000;
bool mqttReconnecting = false; 

const char* relayTopics[] = {
  RELAY_TOPIC_1,
  RELAY_TOPIC_2
};

void setupMQTT() {
  Serial.println("Attempting to connect to MQTT broker...");
  if (client.connect(MQTT_CLIENT_ID)) {
    Serial.println("Connected to MQTT broker");

    // Subscribe to relay topics
    for (int i = 0; i < 2; i++) {
      client.subscribe(relayTopics[i]);
      Serial.printf("Subscribed to topic: %s\n", relayTopics[i]);
    }
  } else {
    Serial.print("Failed to connect to MQTT broker, rc=");
    Serial.println(client.state());
    delay(4000);
  }
}

// Function to keep MQTT connection alive
void handleMQTT() {
  if (!client.connected()) {
    unsigned long now = millis();
    if (now - lastReconnectAttempt > reconnectInterval) {
      lastReconnectAttempt = now;
      Serial.println("MQTT not connected, attempting to reconnect...");
      setupMQTT();
    }
  } 
  client.loop(); 
}


void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String topicStr = String(topic);
  String payloadStr = "";

  // Convert payload to string
  for (int i = 0; i < length; i++) {
    payloadStr += (char)payload[i];
  }
  Serial.print("Message received on topic: ");
  Serial.println(topicStr);
  Serial.print("Message payload: ");
  Serial.println(payloadStr);

  // Handle relay control
  for (int i = 0; i < 2; i++) {
    if (topicStr == relayTopics[i]) {
      Serial.printf("Processing command for relay %d\n", i + 1);
      
      if (payloadStr == "ON") {
        Serial.printf("Turning ON relay %d\n", i + 1);
        turnOnRelay(i);
      }
      else if(payloadStr == "OFF") {
        Serial.printf("Turning OFF relay %d\n", i + 1);
        turnOffRelay(i);
      } 
    }
  }
}
