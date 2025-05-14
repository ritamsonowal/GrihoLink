import * as Paho from 'paho-mqtt';
import { MQTT_CONFIG } from './config';

let client: Paho.Client | null = null;
let isInitialized = false;
let isConnecting = false;
let subscribedTopics = new Set<string>();
let lastMessageTime = new Map<string, number>();
const MESSAGE_THROTTLE_MS = 1000; // Minimum time between messages for the same topic
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
let connectionLock = false;
let reconnectTimeout: number | null = null;

// Custom error handler to hide sensitive information
const handleError = (error: any) => {
  console.error('❌ Connection error occurred');
};

// Override console.error to hide sensitive information
const originalConsoleError = console.error;
console.error = function(...args) {
  const sanitizedArgs = args.map(arg => {
    if (typeof arg === 'string') {
      return arg
        .replace(/wss?:\/\/[^\/]+/, 'wss://***')
        .replace(/mqtt:\/\/[^\/]+/, 'mqtt://***')
        .replace(/x12kf9_a1\/relay\/[12]/, 'Topic $&')
        .replace(/test\.mosquitto\.org/, '***')
        .replace(/broker\.emqx\.io/, '***');
    }
    return arg;
  });
  originalConsoleError.apply(console, sanitizedArgs);
};

export function initializeMQTT(onConnectionStatusChange: (status: boolean) => void) {
  try {
    if (isConnecting || connectionLock) {
      console.log('🔄 Connection attempt already in progress');
      return;
    }

    if (client && client.isConnected()) {
      console.log('🔌 MQTT client already connected');
      onConnectionStatusChange(true);
      return;
    }

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    isConnecting = true;
    connectionLock = true;
    connectionAttempts = 0;
    const clientId = MQTT_CONFIG.MQTT_CLIENT_ID + Math.random().toString(16).substring(2, 8);
    console.log('🔌 Creating MQTT client');
    
    client = new Paho.Client(MQTT_CONFIG.MQTT_BROKER_1, clientId);
    
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = (message) => {
      onMessageArrived(message);
    };

    const connectOptions = {
      onSuccess: () => {
        if (!isInitialized) {
          onConnect(onConnectionStatusChange);
        }
        connectionLock = false;
      },
      onFailure: (error: any) => {
        connectionLock = false;
        handleError(error);
        onFailure(error, onConnectionStatusChange);
      },
      useSSL: true,
      timeout: 10,
      keepAliveInterval: 60,
      cleanSession: true
    };

    console.log('🔄 Attempting to connect to MQTT broker...');
    client.connect(connectOptions);
  } catch (error) {
    console.error('❌ Error initializing MQTT client');
    isInitialized = false;
    isConnecting = false;
    connectionLock = false;
  }
}

function onConnect(onConnectionStatusChange: (status: boolean) => void) {
  if (isInitialized) {
    console.log('🔌 Already initialized');
    return;
  }

  console.log("✅ Connected to broker 1");
  isInitialized = true;
  isConnecting = false;
  connectionAttempts = 0;
  
  // Subscribe to specific relay topics
  const relayTopics = [
    MQTT_CONFIG.MQTT_TOPICS.RELAY_1,
    MQTT_CONFIG.MQTT_TOPICS.RELAY_2
  ];
  
  relayTopics.forEach((topic, index) => {
    // Skip if already subscribed
    if (subscribedTopics.has(topic)) {
      console.log(`📡 Already connected to topic ${index + 1}`);
      return;
    }

    console.log(`📡 Connecting to topic ${index + 1}`);
    try {
      const options = {
        onSuccess: () => {
          subscribedTopics.add(topic);
          console.log(`✅ Connected to topic ${index + 1}`);
        },
        onFailure: (error: any) => {
          console.error(`❌ Failed to connect to topic ${index + 1}`);
        },
        timeout: 10
      };
      
      client?.subscribe(topic, options);
    } catch (error) {
      console.error(`❌ Error connecting to topic ${index + 1}`);
    }
  });
  
  onConnectionStatusChange(true);
}

function onFailure(error: any, onConnectionStatusChange: (status: boolean) => void) {
  console.error("❌ Connection failed");
  isInitialized = false;
  isConnecting = false;
  subscribedTopics.clear();
  lastMessageTime.clear();
  onConnectionStatusChange(false);
  
  connectionAttempts++;
  if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log("❌ Max reconnection attempts reached, stopping");
    return;
  }

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }

  reconnectTimeout = setTimeout(() => {
    console.log("🔄 Attempting to reconnect with alternative broker...");
    if (client) {
      client = new Paho.Client(MQTT_CONFIG.MQTT_BROKER_2, client.clientId);
      client.onConnectionLost = onConnectionLost;
      client.onMessageArrived = onMessageArrived;
      
      const connectOptions = {
        onSuccess: () => {
          if (!isInitialized) {
            onConnect(onConnectionStatusChange);
          }
          connectionLock = false;
        },
        onFailure: (err: any) => {
          connectionLock = false;
          handleError(err);
          console.error("❌ Alternative connection failed");
          setTimeout(() => initializeMQTT(onConnectionStatusChange), 10000);
        },
        useSSL: true,
        timeout: 15
      };
      
      client.connect(connectOptions);
    }
  }, 5000);
}

function onConnectionLost(responseObject: any) {
  if (responseObject.errorCode !== 0) {
    console.log("❌ Connection lost");
    isInitialized = false;
    isConnecting = false;
    subscribedTopics.clear();
    lastMessageTime.clear();
    
    connectionAttempts++;
    if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log("❌ Max reconnection attempts reached, stopping");
      return;
    }

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }

    reconnectTimeout = setTimeout(() => {
      console.log("🔄 Attempting to reconnect...");
      if (client) {
        client.connect({
          onSuccess: () => {
            if (!isInitialized) {
              onConnect(() => {});
            }
            connectionLock = false;
          },
          onFailure: (error: any) => {
            connectionLock = false;
            handleError(error);
            onFailure(error, () => {});
          },
          useSSL: true,
          timeout: 10
        });
      }
    }, 5000);
  }
}

function onMessageArrived(message: Paho.Message) {
  const topic = message.destinationName;
  const payload = message.payloadString;
  
  // Skip TEST messages
  if (payload === "TEST") return;

  // Check if we've received a similar message recently
  const now = Date.now();
  const lastTime = lastMessageTime.get(topic) || 0;
  
  if (now - lastTime < MESSAGE_THROTTLE_MS) {
    console.log(`⏱️ Skipping duplicate message on topic ${topic === MQTT_CONFIG.MQTT_TOPICS.RELAY_1 ? '1' : '2'}`);
    return;
  }
  
  lastMessageTime.set(topic, now);
  console.log(`📥 Message received on topic ${topic === MQTT_CONFIG.MQTT_TOPICS.RELAY_1 ? '1' : '2'}`);
  console.log("   Command:", payload);
}

export function togglePower(id: string, state: 'on' | 'off') {
  if (!isInitialized || !client || !client.isConnected()) {
    console.log("❌ Cannot send message, MQTT client not connected");
    return false;
  }

  try {
    const topic = id === "1" ? MQTT_CONFIG.MQTT_TOPICS.RELAY_1 : MQTT_CONFIG.MQTT_TOPICS.RELAY_2;
    const payload = state === 'on' ? "ON" : "OFF";
    
    const message = new Paho.Message(payload);
    message.destinationName = topic;
    message.qos = 1;
    message.retained = false;
    
    client.send(message);
    return true;
  } catch (error) {
    console.error('❌ Error sending MQTT message');
    return false;
  }
}

export function isMqttConnected() {
  return isInitialized && client && client.isConnected();
}
