
import { Lightbulb, Power } from "lucide-react";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (type: "light" | "socket") => void;
}

export function AddDeviceModal({
  isOpen,
  onClose,
  onSave,
}: AddDeviceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Add New Device</h2>
        <div className="space-y-4">
          <button
            onClick={() => {
              onSave("light");
              onClose();
            }}
            className="w-full flex items-center space-x-3 p-4 rounded-xl border hover:bg-gray-50"
          >
            <Lightbulb className="w-6 h-6" />
            <span>Light Switch</span>
          </button>
          <button
            onClick={() => {
              onSave("socket");
              onClose();
            }}
            className="w-full flex items-center space-x-3 p-4 rounded-xl border hover:bg-gray-50"
          >
            <Power className="w-6 h-6" />
            <span>Socket Switch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
