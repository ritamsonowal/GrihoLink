#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "secrets.h"

// External function declarations
extern void wifi(); 
extern void setupRelays(); 
extern void mqttCallback(char* topic, byte* payload, unsigned int length); 
extern void handleMQTT();


WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);  
  delay(1000);
  Serial.println("Before calling wifi()"); 
  wifi(); 
  setupRelays();


  client.setServer(MQTT_BROKER, MQTT_PORT);
  client.setCallback(mqttCallback);
  setupMQTT(); 
}

void loop() {
  delay(10);
  handleMQTT(); 
}
