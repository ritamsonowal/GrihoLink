let client = null;
let isInitialized = false;

// Function to check if Paho is available
function checkPaho() {
  if (typeof Paho !== 'undefined' && Paho.MQTT) {
    console.log('✅ Paho MQTT is available');
    return true;
  }
  console.error('❌ Paho MQTT is not available');
  return false;
}

// Initialize MQTT client
window.initializeMQTT = function() {
  if (!checkPaho()) {
    console.error('❌ Cannot initialize MQTT: Paho library not available');
    return;
  }

  try {
    const clientId = "ESP32Client-Ritam1234" + Math.random().toString(16).substring(2, 8);
    console.log('Creating MQTT client with ID:', clientId);
    
    // Use WebSocket port (8884 for secure, 8000 for non-secure)
    // Use test.mosquitto.org which is a public MQTT broker for testing
    client = new Paho.MQTT.Client("test.mosquitto.org", 8080, clientId);
    
    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // Connect options - updated to use SSL with better timeout
    const connectOptions = {
      onSuccess: onConnect,
      onFailure: onFailure,
      useSSL: false,  // test.mosquitto.org doesn't require SSL
      timeout: 10,    // Increased timeout to 10 seconds
      keepAliveInterval: 60,
      cleanSession: true
    };

    console.log('Attempting to connect to MQTT broker...');
    client.connect(connectOptions);
    isInitialized = false; // Set to true only after successful connection
  } catch (error) {
    console.error('❌ Error initializing MQTT client:', error);
    isInitialized = false;
  }
};

function onConnect() {
  console.log("✅ Connected to MQTT broker");
  isInitialized = true; // Now we're connected
  client.subscribe("griholink/relay/#");
  // Update UI to show connected status
  if (typeof updateConnectionStatus === 'function') {
    updateConnectionStatus(true);
  }
}

function onFailure(error) {
  console.error("❌ Connection failed:", error.errorMessage);
  isInitialized = false;
  
  // Update UI to show disconnected status
  if (typeof updateConnectionStatus === 'function') {
    updateConnectionStatus(false);
  }
  
  // Try to reconnect after 5 seconds, but with different broker or parameters
  setTimeout(function() {
    console.log("Attempting to reconnect with alternative broker...");
    try {
      // Try alternative public broker
      client = new Paho.MQTT.Client("broker.emqx.io", 8084, client.clientId);
      client.onConnectionLost = onConnectionLost;
      client.onMessageArrived = onMessageArrived;
      
      const connectOptions = {
        onSuccess: onConnect,
        onFailure: function(err) {
          console.error("❌ Alternative connection also failed:", err.errorMessage);
          // Wait longer before next attempt
          setTimeout(initializeMQTT, 10000);
        },
        useSSL: true,
        timeout: 15
      };
      
      client.connect(connectOptions);
    } catch (e) {
      console.error("❌ Error during reconnection:", e);
      setTimeout(initializeMQTT, 10000);
    }
  }, 5000);
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("❌ Connection lost: " + responseObject.errorMessage);
    isInitialized = false;
    
    // Update UI to show disconnected status
    if (typeof updateConnectionStatus === 'function') {
      updateConnectionStatus(false);
    }
    
    // Try to reconnect after 5 seconds
    setTimeout(initializeMQTT, 5000);
  }
}

function onMessageArrived(message) {
  console.log("📥 Message arrived:", message.payloadString);

  const topic = message.destinationName;
  const payload = message.payloadString;
  const deviceId = topic.split("/")[2];

  if (deviceId) {
    if (payload === "ON") {
      document.getElementById(`on-btn-${deviceId}`).classList.add("hidden");
      document.getElementById(`off-btn-${deviceId}`).classList.remove("hidden");
    } else if (payload === "OFF") {
      document.getElementById(`on-btn-${deviceId}`).classList.remove("hidden");
      document.getElementById(`off-btn-${deviceId}`).classList.add("hidden");
    }
  }
}

// Function to toggle power for a device
function togglePower(id, state) {
  if (!isInitialized || !client || !client.isConnected()) {
    console.log("❌ Cannot send message, MQTT client not connected.");
    alert("Cannot control device. MQTT client not connected. Please wait for connection to establish.");
    return;
  }

  try {
    if (state === 'on') {
      document.getElementById(`on-btn-${id}`).classList.add("hidden");
      document.getElementById(`off-btn-${id}`).classList.remove("hidden");
    } else {
      document.getElementById(`on-btn-${id}`).classList.remove("hidden");
      document.getElementById(`off-btn-${id}`).classList.add("hidden");
    }

    const topic = `griholink/relay/${id}`;
    const payload = state === 'on' ? "ON" : "OFF";
    const message = new Paho.MQTT.Message(payload);
    message.destinationName = topic;
    client.send(message);
    console.log(`📤 Published "${payload}" to topic "${topic}"`);
  } catch (error) {
    console.error('❌ Error sending MQTT message:', error);
    alert("Error sending command to device. Please try again.");
  }
}

// Function to reset the device state
function resetDevice(id) {
  if (!isInitialized || !client || !client.isConnected()) {
    console.log("❌ Cannot send reset command, MQTT client not connected.");
    alert("Cannot reset device. MQTT client not connected. Please wait for connection to establish.");
    return;
  }

  try {
    // Reset all UI elements to initial state
    const addBtn = document.getElementById(`add-btn-${id}`);
    const typeDiv = document.getElementById(`type-${id}`);
    const switchDiv = document.getElementById(`switch-${id}`);
    const onBtn = document.getElementById(`on-btn-${id}`);
    const offBtn = document.getElementById(`off-btn-${id}`);
    
    // Show the "Add Device" button
    addBtn.style.display = 'block';
    
    // Hide the type selection and switch controls
    typeDiv.classList.add("hidden");
    switchDiv.classList.add("hidden");
    
    // Reset the radio buttons
    const radioButtons = document.querySelectorAll(`input[name="deviceType-${id}"]`);
    radioButtons.forEach(radio => {
      radio.checked = false;
    });
    
    // Reset the ON/OFF buttons to initial state
    onBtn.classList.remove("hidden");
    offBtn.classList.add("hidden");
    
    // Send OFF command to the device
    const topic = `griholink/relay/${id}`;
    const message = new Paho.MQTT.Message("OFF");
    message.destinationName = topic;
    client.send(message);
    console.log(`📤 Published "OFF" to reset device ${id}`);
    
    // Re-enable the startAdd function for this device
    addBtn.onclick = function() { startAdd(id); };
  } catch (error) {
    console.error('❌ Error resetting device:', error);
    alert("Error resetting device. Please try again.");
  }
}

// Function to start adding a device
function startAdd(id) {
  const addBtn = document.getElementById(`add-btn-${id}`);
  const typeDiv = document.getElementById(`type-${id}`);
  
  // Hide the "Add Device" button
  addBtn.style.display = 'none';
  
  // Show the device type selection
  typeDiv.classList.remove("hidden");
  
  // Hide the switch controls if they were visible
  const switchDiv = document.getElementById(`switch-${id}`);
  switchDiv.classList.add("hidden");
}

// Function to show switch controls after device type selection
function showSwitch(id) {
  const switchDiv = document.getElementById(`switch-${id}`);
  switchDiv.classList.remove("hidden");
}

// Export the function to check connection status
function isMqttConnected() {
  return isInitialized && client && client.isConnected();
}