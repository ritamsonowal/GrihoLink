import React, { useState } from "react";
import {
  ChevronRight,
  Bed,
  Sofa,
  Twitch as Kitchen,
  UtensilsCrossed,
  Bath,
  User,
  Wifi,
  Cloud,
  Home as HomeIcon
} from "lucide-react";
import { DeviceControls } from "./components/DeviceControls";
import { ConnectionStatus } from './components/ConnectionStatus';

interface Room {
  id: string;
  name: string;
  icon: React.ReactNode;
  image: string;
}

function App() {
  const [selectedRoom, setSelectedRoom] = useState<string>("bedroom");

  const rooms: Room[] = [
    {
      id: "bedroom",
      name: "Bed Room",
      icon: <Bed className="w-5 h-5" />,
      image:
        "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=1000",
    },
    {
      id: "living",
      name: "Living Room",
      icon: <Sofa className="w-5 h-5" />,
      image:
        "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=1000",
    },
    {
      id: "kitchen",
      name: "Kitchen",
      icon: <Kitchen className="w-5 h-5" />,
      image:
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=1000",
    },
    {
      id: "dining",
      name: "Dining Room",
      icon: <UtensilsCrossed className="w-5 h-5" />,
      image:
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=1000",
    },
    {
      id: "bathroom",
      name: "Bathroom",
      icon: <Bath className="w-5 h-5" />,
      image:
        "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=1000",
    },
  ];

  const currentRoom = rooms.find((room) => room.id === selectedRoom);

  return (
    <div className="min-h-screen w-full bg-[url('https://www.transparenttextures.com/patterns/beige-paper.png')] bg-repeat flex">
      {/* Sidebar */}
      <aside className="w-56 min-h-screen bg-white/80 flex flex-col items-center py-8 shadow-xl rounded-r-3xl mr-8">
        <img src="/Logo.png" alt="Logo" className="w-32 mb-12" />
        <nav className="flex flex-col gap-6 w-full px-4">
          <button className="flex items-center gap-3 py-3 px-4 rounded-xl bg-black/90 text-white font-semibold shadow-md hover:bg-black">
            <HomeIcon className="w-6 h-6" /> Home
          </button>
          <button className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-700 font-semibold shadow hover:bg-gray-100">
            <Cloud className="w-6 h-6" /> Status
          </button>
          <button className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-700 font-semibold shadow hover:bg-gray-100">
            <Wifi className="w-6 h-6" /> Wifi
          </button>
          <button className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-700 font-semibold shadow hover:bg-gray-100">
            <User className="w-6 h-6" /> Profile
          </button>
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto py-10">
        <div className="flex space-x-8 mb-8">
          {/* Image Section */}
          <div className="flex-1">
            <div className="bg-white/90 rounded-3xl shadow-lg p-0 overflow-hidden flex flex-col">
              <div className="px-6 pt-6">
                <span className="inline-block bg-white/90 rounded-xl px-4 py-2 text-lg font-semibold shadow mb-4">
                  {currentRoom?.name}
                </span>
              </div>
              <img
                src={currentRoom?.image}
                alt={currentRoom?.name}
                className="w-full h-[340px] object-cover rounded-3xl"
              />
            </div>
          </div>
          {/* Right Panel - Room List */}
          <div className="w-80">
            <div className="bg-white/90 rounded-3xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-6">Rooms</h3>
              <div className="space-y-2">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors font-medium text-base ${
                      selectedRoom === room.id
                        ? "bg-gray-200 shadow"
                        : "hover:bg-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {room.icon}
                      <span className="text-gray-700">{room.name}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Device Controls */}
        <DeviceControls roomId={selectedRoom} />
      </div>
      <ConnectionStatus />
    </div>
  );
}

export default App;
