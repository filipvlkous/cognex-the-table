import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { FtpConfig } from './serverStore';

export type Channels = 'ipc-example';

interface ImageMethods {
  getCurrentImageName: () => Promise<string>;
  setCurrentImageName: (imageName: string) => Promise<boolean>;
  onImageNameChanged: (callback: (imageName: string) => void) => void;
  loadImage: (imageName: string, data?: any) => Promise<string>;
}

const additionalHostStoreMethods: ImageMethods = {
  loadImage: (imageName, data) =>
    ipcRenderer.invoke('get-image-data', imageName, data),

  // Method to get the current image name
  getCurrentImageName: async (): Promise<string> => {
    try {
      const imageName: string = await ipcRenderer.invoke(
        'get-current-image-name',
      );
      return imageName;
    } catch (error) {
      console.error('Error getting current image name:', error);
      return 'test.jpg'; // fallback
    }
  },

  // Method to set/update the current image name
  setCurrentImageName: async (imageName: string): Promise<boolean> => {
    try {
      const result: boolean = await ipcRenderer.invoke(
        'set-current-image-name',
        imageName,
      );
      // Notify renderer process about the change
      window.postMessage({ type: 'image-name-changed', imageName }, '*');
      return result;
    } catch (error) {
      console.error('Error setting current image name:', error);
      throw error;
    }
  },

  // Method to watch for image changes (if you want real-time updates)
  onImageNameChanged: (callback: (imageName: string) => void): void => {
    ipcRenderer.on(
      'image-name-changed',
      (event: IpcRendererEvent, imageName: string) => {
        callback(imageName);
      },
    );
  },
};

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('imageAPI', additionalHostStoreMethods);

contextBridge.exposeInMainWorld('electron', electronHandler);

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectSavePath: () => ipcRenderer.invoke('select-save-folder'),
  saveFile: (path: string, content: string) =>
    ipcRenderer.invoke('save-file', { path, content }),
});

contextBridge.exposeInMainWorld('api', {
  // now returns { connectionId, status }
  connect: (host: string, port: number) => {
    return ipcRenderer.invoke('tcp-connect', { host, port });
  },

  // send data on an existing connection
  send: (connectionId: string, msg: string) => {
    return ipcRenderer.invoke('tcp-send', { connectionId, data: msg });
  },

  // close the connection
  disconnect: (connectionId: string) => {
    return ipcRenderer.invoke('tcp-disconnect', { connectionId });
  },

  // subscribe to tcp-data from main
  onData: (callback: any) => {
    const listener = (
      event: Electron.IpcRendererEvent,
      { connectionId, data }: { connectionId: string; data: any },
    ) => {
      callback(connectionId, data);
    };
    ipcRenderer.on('tcp-data', listener);
    // return an unsubscribe function if you like:
    return () => ipcRenderer.removeListener('tcp-data', listener);
  },
});

contextBridge.exposeInMainWorld('selectedHost', {
  getSelectedHost: () => {
    return ipcRenderer.invoke('get-selected-host');
  },
  setSelectedHost: (connectionId: string) => {
    return ipcRenderer.invoke('set-selected-host', connectionId);
  },
});

contextBridge.exposeInMainWorld('ftpAPI', {
  selectFolder: () => ipcRenderer.invoke('ftp-selectFolder'),

  startFtp: () => {
    return ipcRenderer.invoke('ftp-start');
  },
  stopFtp: () => {
    return ipcRenderer.invoke('ftp-stop');
  },

  getFtpConfig: () => {
    return ipcRenderer.invoke('ftp-get-config');
  },

  setFtpConfig: (config: FtpConfig) => {
    return ipcRenderer.invoke('ftp-update-config', config);
  },
  resetFtpConfig: () => {
    return ipcRenderer.invoke('ftp-reset-config');
  },

  onFtpConnected: (callback: (data: any) => void) => {
    ipcRenderer.on('ftp-connected', (_event, data) => {
      callback(data);
    });
  },
});

contextBridge.exposeInMainWorld('hostStore', {
  getHosts: () => {
    return ipcRenderer.invoke('get-hosts');
  },

  getRegime: () => {
    return ipcRenderer.invoke('get-regime');
  },

  removeRegime: (value: number) => {
    return ipcRenderer.invoke('remove-regime', value);
  },

  addRegime: (value: number) => {
    return ipcRenderer.invoke('add-regime', value);
  },

  addHost: (hostEntry: {
    id: string;
    name: string;
    host: string;
    port: string;
    auto: boolean;
  }) => {
    return ipcRenderer.invoke('add-host', hostEntry);
  },
  removeHost: (id: string) => {
    return ipcRenderer.invoke('remove-host', id);
  },
  removeAllHosts: () => {
    ipcRenderer.send('remove-all-hosts');
  },
});

export type ElectronHandler = typeof electronHandler;
