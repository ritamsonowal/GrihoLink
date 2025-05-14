int relayPins[] = {D5, D6};  // D5 for Device 1, D6 for Device 2

// Setup relay pins
void setupRelays() {
  Serial.println("Setting up relay pins...");
  
  for (int i = 0; i < 2; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], HIGH);  // Changed to HIGH for initial state
    Serial.printf("Relay %d initialized on pin D%d\n", i+1, i == 0 ? 5 : 6);
    delay(200);  // Add delay to reduce surge
  }
}

// Function to turn on relay by index
void turnOnRelay(int relayIndex) {
  if (relayIndex >= 0 && relayIndex < 2) {
    digitalWrite(relayPins[relayIndex], LOW);  // Changed to LOW for ON
  }
}

// Function to turn off relay by index
void turnOffRelay(int relayIndex) {
  if (relayIndex >= 0 && relayIndex < 2) {
    digitalWrite(relayPins[relayIndex], HIGH);  // Changed to HIGH for OFF
  }
}

void controlRelay(int relayNumber, bool state) {
  int relayIndex = relayNumber - 1;  // Convert 1-based to 0-based index
  if (relayIndex >= 0 && relayIndex < 2) {
    if (state)
      digitalWrite(relayPins[relayIndex], LOW);   // Changed to LOW for ON
    else
      digitalWrite(relayPins[relayIndex], HIGH);  // Changed to HIGH for OFF
  }
}


