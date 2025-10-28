// App.tsx
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Screens/Home/home';
import Settings from './Screens/settings';
import useTcpStore from './useTcpStore';
import { FtpConfig } from '../main/serverStore/types';
import './App.css';
declare global {
  interface Window {
    ftpAPI: {
      startFtp: () => Promise<boolean>;
      stopFtp: () => Promise<boolean>;
      isFtpRunning: () => Promise<boolean>;
      getFtpConfig: () => Promise<FtpConfig>;
      setFtpConfig: (config: FtpConfig) => Promise<void>;
      resetFtpConfig: () => Promise<void>;
      selectFolder: () => Promise<any>;
      onFtpConnected: (value: any) => Promise<void>;
    };
    api: {
      connect: (
        host: string,
        port: number,
      ) => Promise<{ connectionId: string; status: string }>;
      send: (connectionId: string, msg: string) => Promise<void>;
      disconnect: (connectionId: string) => Promise<void>;
      onData: (
        callback: (connectionId: string, data: string) => void,
      ) => () => void;
    };
    imageAPI: {
      getCurrentImageName: () => Promise<string>;
      setCurrentImageName: (imageName: string) => Promise<boolean>;
      onImageNameChanged: (callback: (imageName: string) => void) => void;
      loadImage: (imageName: string, data?: any) => Promise<string>;
    };
  }
}

function App() {
  const initializeConnections = useTcpStore(
    (state) => state.initializeConnections,
  );
  const initializeDataListener = useTcpStore(
    (state) => state.initializeDataListener,
  );
  const initFtpListener = useTcpStore((state) => state.initFtpListener);
  const setBridgeReady = useTcpStore((state) => state.setBridgeReady);

  useEffect(() => {
    console.log('Checking if bridge is ready...');
    if (window.api) {
      setBridgeReady(true);
      initializeConnections();
      initFtpListener();
      const unsubscribe = initializeDataListener();
      return unsubscribe;
    }
  }, []);
  useEffect(() => {
    const startFtpOnLoad = async () => {
      try {
        const result = await window.ftpAPI.startFtp();
        console.log('FTP Server auto-started:', result);
      } catch (error) {
        console.error('Failed to auto-start FTP server:', error);
      }
    };

    startFtpOnLoad();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;
