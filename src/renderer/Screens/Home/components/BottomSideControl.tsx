import { Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import useTcpStore from '../../../useTcpStore';

export default function BottomSideControl() {
  const store = useTcpStore();
  const isConnected = store.connections.some(
    (c: any) => c.status === 'connected',
  );

  return (
    <div className="mt-4 border-t border-gray-200">
      <div className="bottom-controls pt-4 flex flex-col items-center justify-between mb-10">
        {isConnected ? (
          <button
            onClick={store.disconnectAll}
            className="w-full px-4 py-2 cursor-pointer bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center gap-2"
          >
            <WifiOff className="w-4 h-4" /> Disconnect
          </button>
        ) : (
          <button
            onClick={() => {
              if (store.activeConnection) {
                store.connectToServer(store.activeConnection);
              }
            }}
            className="w-full px-4 py-2 cursor-pointer bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <Wifi className="w-4 h-4" /> Connect to Camera
          </button>
        )}
      </div>
      <Link
        to="/settings"
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-50 w-full"
      >
        ⚙️ <span>Settings</span>
      </Link>
    </div>
  );
}
