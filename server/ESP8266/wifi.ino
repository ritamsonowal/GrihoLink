#include "secrets.h"
#include <ESP8266WiFi.h>

const char *ssid = SSID;
const char *password = PASS;

void wifi() {
  Serial.print("Connecting to ");
  Serial.println(ssid);
  Serial.println("Before WiFi.begin");
  WiFi.begin(ssid, password);
  Serial.println("Attempting to connect");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("WIFI not connected");
  }
  Serial.println("WIFI connected");
}
