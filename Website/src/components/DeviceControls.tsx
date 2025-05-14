import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Plus, X } from "lucide-react";
import { AddDeviceModal } from "./AddDeviceModal";
import { togglePower } from "../lib/mqttService";

interface Device {
  id: string;
  type: "light" | "socket";
  isOn: boolean;
}

interface LightSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  onReset: () => void;
  deviceId: string;
}

function LightSwitch({ isOn, onToggle, onReset, deviceId }: LightSwitchProps) {
  const handleToggle = () => {
    const newState = !isOn;
    console.log(`🔄 Toggling light switch ${deviceId} to ${newState ? 'OFF' : 'ON'}`);
    const success = togglePower(deviceId, newState ? 'off' : 'on');
    if (success) {
      onToggle();
    } else {
      console.error(`❌ Failed to toggle light switch ${deviceId}`);
    }
  };

  return (
    <Card className="overflow-hidden rounded-3xl shadow-sm">
      <CardHeader className="bg-[#2d3436] p-4 text-white text-center relative">
        <h3 className="text-lg font-medium">Light Switch</h3>
        <button
          onClick={onReset}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent className="p-8 flex justify-center items-center">
        <button
          onClick={handleToggle}
          className="relative w-[140px] sm:w-[180px] h-[50px] sm:h-[60px] rounded-full bg-gray-200 border-2 border-gray-300 shadow-inner focus:outline-none"
          aria-pressed={isOn}
          role="switch"
        >
          <div
            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-2px)] rounded-full transition-transform duration-200 shadow-md flex items-center justify-center ${
              isOn ? "bg-white translate-x-[calc(100%)]" : "bg-white"
            }`}
          >
            <span
              className={`font-semibold ${
                isOn ? "text-red-500" : "text-gray-700"
              }`}
            >
              {/* {isOn ? "On" : "Off"} */}
            </span>
          </div>
          <div className="absolute inset-0 flex items-center pointer-events-none">
            <span className="w-1/2 text-center font-semibold text-gray-700">
              On
            </span>
            <span className="w-1/2 text-center font-semibold text-red-500">
              Off
            </span>
          </div>
        </button>
      </CardContent>
    </Card>
  );
}

interface SocketSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  onReset: () => void;
  deviceId: string;
}

function SocketSwitch({ isOn, onToggle, onReset, deviceId }: SocketSwitchProps) {
  const handleToggle = () => {
    const newState = !isOn;
    console.log(`🔄 Toggling socket switch ${deviceId} to ${newState ? 'OFF' : 'ON'}`);
    const success = togglePower(deviceId, newState ? 'off' : 'on');
    if (success) {
      onToggle();
    } else {
      console.error(`❌ Failed to toggle socket switch ${deviceId}`);
    }
  };

  return (
    <Card className="overflow-hidden rounded-3xl shadow-sm">
      <CardHeader className="bg-[#2d3436] p-4 text-white text-center relative">
        <h3 className="text-lg font-medium">Socket Switch</h3>
        <button
          onClick={onReset}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent className="p-8 flex justify-center items-center">
        <button
          onClick={handleToggle}
          className="relative w-[80px] sm:w-[100px] h-[40px] sm:h-[50px] bg-gray-100 border border-gray-300 rounded-sm focus:outline-none overflow-hidden"
          aria-pressed={isOn}
          role="switch"
        >
          <div className="absolute inset-0 flex">
            <div className="w-1/2 flex items-center justify-center font-bold text-xs">
              OFF
            </div>
            <div className="w-1/2 flex items-center justify-center font-bold text-xs">
              ON
            </div>
          </div>
          <div
            className={`absolute top-0 bottom-0 w-1/2 bg-white border-r border-gray-300 shadow-md transition-transform duration-200 z-10 flex items-center justify-center ${
              isOn ? "translate-x-full" : "translate-x-0"
            }`}
          >
            <div className="w-1/4 h-full bg-gray-200 absolute right-0"></div>
          </div>
        </button>
      </CardContent>
    </Card>
  );
}

interface DeviceControlsProps {
  roomId: string;
}

export function DeviceControls({ roomId }: DeviceControlsProps) {
  const [devices, setDevices] = useState<Record<string, Device[]>>(() => {
    // Initialize with empty arrays for each room
    return {
      bedroom: [],
      living: [],
      kitchen: [],
      dining: [],
      bathroom: [],
    };
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentRoomDevices = devices[roomId] || [];
  const canAddMoreDevices = currentRoomDevices.length < 2;

  const handleAddDevice = (type: "light" | "socket") => {
    // Get the next available relay number (1 or 2)
    const usedRelayNumbers = currentRoomDevices.map(device => parseInt(device.id));
    const nextRelayNumber = [1, 2].find(num => !usedRelayNumbers.includes(num));
    
    if (!nextRelayNumber) {
      console.error("❌ No more relay numbers available");
      return;
    }

    const newDevice: Device = {
      id: nextRelayNumber.toString(), // Use relay number as ID
      type,
      isOn: false,
    };
    setDevices((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newDevice],
    }));
  };

  const handleToggleDevice = (id: string) => {
    setDevices((prev) => ({
      ...prev,
      [roomId]: prev[roomId].map((device) =>
        device.id === id ? { ...device, isOn: !device.isOn } : device
      ),
    }));
  };

  const handleResetDevice = (id: string) => {
    setDevices((prev) => ({
      ...prev,
      [roomId]: prev[roomId].filter((device) => device.id !== id),
    }));
  };

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-4 overflow-x-hidden max-w-full">
      {currentRoomDevices.map((device) =>
        device.type === "light" ? (
          <LightSwitch
            key={device.id}
            isOn={device.isOn}
            onToggle={() => handleToggleDevice(device.id)}
            onReset={() => handleResetDevice(device.id)}
            deviceId={device.id}
          />
        ) : (
          <SocketSwitch
            key={device.id}
            isOn={device.isOn}
            onToggle={() => handleToggleDevice(device.id)}
            onReset={() => handleResetDevice(device.id)}
            deviceId={device.id}
          />
        )
      )}
      {canAddMoreDevices && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center space-y-3 hover:shadow-lg transition-shadow"
        >
          <div className="bg-gray-900 rounded-full p-3">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="text-gray-600">Add Device</span>
        </button>
      )}
      <AddDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddDevice}
      />
    </div>
  );
}
