int relayPins[] = {D5, D6};  


void setupRelays() {
  Serial.println("Setting up relay pins...");
  
  for (int i = 0; i < 2; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], HIGH); 
    Serial.printf("Relay %d initialized on pin D%d\n", i+1, i == 0 ? 5 : 6);
    delay(200);  
  }
}


void turnOnRelay(int relayIndex) {
  if (relayIndex >= 0 && relayIndex < 2) {
    digitalWrite(relayPins[relayIndex], LOW); 
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
      digitalWrite(relayPins[relayIndex], LOW);   
    else
      digitalWrite(relayPins[relayIndex], HIGH); 
  }
}


