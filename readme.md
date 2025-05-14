## 🧑‍💻 Getting Started

### ✅ Step 1: Create a secrets.h file in /server/ESP8266/ (where the .ino files are located)
// Wi-Fi Credentials
#define SSID "Your Wi-Fi SSID"
#define PASS "Your Wi-Fi Password"

// MQTT Configuration
#define MQTT_CLIENT_ID ""  // Use a unique client ID
#define MQTT_BROKER ""     // Use any public broker 
#define MQTT_PORT          // Choose a port number from any public broker

// MQTT Topics for Relay Control
#define RELAY_TOPIC_1 "your/topic/relay1"
#define RELAY_TOPIC_2 "your/topic/relay2"

### ✅ Step 2: Create a config.ts file in /website/src/lib/
export const MQTT_CONFIG = {
  MQTT_BROKER_1: "",  // Use a secure web socket port  
  MQTT_BROKER_2: "",  // Use a secure web socket port  
  MQTT_CLIENT_ID: "",
  MQTT_TOPICS: {
    RELAY_1: "",  // Topic names should be the same for both ESP and website 
    RELAY_2: ""   // Topic names should be the same for both ESP and website
  }
};


### ✅ Step 3: Setup and Flash ESP8266

1. Open `/server/ESP8266` in Arduino IDE or PlatformIO.
2. Add your Wi-Fi and MQTT credentials to `secrets.h`.
3. Flash the code to your ESP8266.
4. Open Serial Monitor to check connection logs.

---

### ✅ Step 4: Run the Web Dashboard

1. From the root, navigate to the `website` folder: 
2. If node_modules doesn't exist then `npm install`
3. If already exists then `npm run dev`
