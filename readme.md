## 🧑‍💻 Getting Started

### ✅ Step 1: Create a secrets.h file in /server/ESP8266/ (where the .ino files are located)
#define SSID "Your Wi-Fi SSID" 
#define PASS "Your Wi-Fi Password" 

#define MQTT_CLIENT_ID ""  // Use a unique client ID 
#define MQTT_BROKER ""     // Use any public broker 
#define MQTT_PORT          // Choose a port number from any public broker

#define RELAY_TOPIC_1 "your/topic/relay1" // MQTT Topics for Relay Control
#define RELAY_TOPIC_2 "your/topic/relay2" // MQTT Topics for Relay Control


### ✅ Step 2: Setup and Flash ESP8266

1. Open `/server/ESP8266` in Arduino IDE or PlatformIO.
2. Add your Wi-Fi and MQTT credentials to `secrets.h`.
3. Flash the code to your ESP8266.
4. Open Serial Monitor to check connection logs.

---

### ✅ Step 3: Run the Web Dashboard

1. From the root, navigate to the `website` folder: 
2. If node_modules doesn't exist then `npm install`
3. If already exists then `npm run dev`
