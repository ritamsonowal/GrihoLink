import { useEffect, useState } from 'react';
import { initializeMQTT} from '../lib/mqttService';

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    initializeMQTT(setIsConnected);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium">
          {isConnected ? 'Connected to MQTT' : 'Disconnected from MQTT'}
        </span>
      </div>
    </div>
  );
} 