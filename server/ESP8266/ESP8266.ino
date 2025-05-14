#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "secrets.h"

// External function declarations
extern void wifi(); // Function to connect to WiFi
extern void setupRelays(); // Setup relays
extern void mqttCallback(char* topic, byte* payload, unsigned int length); // MQTT callback
extern void handleMQTT(); // MQTT handling function defined in mqtt_communication.ino

// Global variables
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);  
  delay(1000);
  Serial.println("Before calling wifi()"); 
  wifi(); 
  setupRelays();

  // Setup MQTT client after Wi-Fi is connected
  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(mqttCallback);
  setupMQTT(); // 👈 Important: Call MQTT connection setup
}

void loop() {
  delay(10);
  handleMQTT(); // Use the centralized MQTT handling function
}
