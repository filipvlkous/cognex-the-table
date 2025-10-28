import { useEffect, useState } from 'react';
import useTcpStore from '../../useTcpStore';
import { FolderSearch2, FolderCheck, Plus } from 'lucide-react';
import ModalAdd from './components/ModalAdd';
import './home.css';
import MessageLog from './components/MessageLog';
import ImagePanel from './components/ImagePanel';
import BottomSideControl from './components/BottomSideControl';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import JobControl from './components/JobControl';
import StatusHeader from './components/StatusHeader';

// Constants
const KEYBOARD_SHORTCUTS = {
  CAPTURE: 'KeyP',
  ADD: 'KeyA',
  SEND: 'KeyS',
} as const;

const MESSAGE_LIMIT = 10;

function Home() {
  const store = useTcpStore();
  const [regimeCol, setRegimeCol] = useState<number[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const latestMessage = store.messages[store.messages.length - 1];

  // API Functions
  const fetchRegimeList = async () => {
    try {
      if (!window.hostStore?.getRegime) {
        console.error('hostStore API not available');
        return;
      }

      const regimes = await window.hostStore.getRegime();
      setRegimeCol(Array.isArray(regimes) ? regimes : []);
    } catch (error) {
      console.error('Error fetching regimes:', error);
      setRegimeCol([]);
    }
  };

  const startFtpServer = async () => {
    try {
      const result = await window.ftpAPI.startFtp();
      console.log('FTP Server auto-started:', result);
    } catch (error) {
      console.error('Failed to auto-start FTP server:', error);
    }
  };

  // Action Handlers
  const handlePhotoCapture = () => {
    console.log('handlePhotoCapture');
    store.setImage(null);
    store.sendMessage('||>trigger on\r\n');
    store.setCameraBtnDisabled(true);
  };

  const handleSendData = () => {
    store.setImage(null);
  };

  const handleRegimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      store.setRegime(parseInt(value));
    }
  };

  // UI Helpers
  const getMessageStatus = () => {
    if (!latestMessage) return null;

    const contentLength = latestMessage.content.length;
    const regime = latestMessage.regime;

    if (Number.isNaN(regime)) return null;

    if (contentLength < regime!) {
      const missingCount = regime! - contentLength;
      return {
        type: 'missing',
        count: missingCount,
        icon: FolderSearch2,
        label: `${missingCount} Missing`,
        color: 'bg-red-500',
      };
    }

    if (contentLength === regime) {
      return {
        type: 'complete',
        icon: FolderCheck,
        label: 'All scanned',
        color: 'bg-green-500',
      };
    }

    if (contentLength > regime!) {
      const overCount = contentLength - regime!;
      return {
        type: 'over',
        count: overCount,
        icon: FolderSearch2,
        label: `${overCount} Over`,
        color: 'bg-red-500',
      };
    }

    return null;
  };

  const shouldShowAddButton = () => {
    if (!latestMessage) return false;
    const contentLength = latestMessage.content.length;
    const regime = latestMessage.regime;
    return contentLength < regime! || Number.isNaN(regime);
  };

  const getMessageCounter = () => {
    if (!latestMessage) return null;
    const contentLength = latestMessage.content.length;
    const regime = latestMessage.regime;

    return Number.isNaN(regime)
      ? contentLength
      : `${contentLength} / ${regime}`;
  };

  // Keyboard Event Handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent actions when modal is open
      if (openModal && event.code !== KEYBOARD_SHORTCUTS.ADD) return;

      switch (event.code) {
        case KEYBOARD_SHORTCUTS.CAPTURE:
          event.preventDefault();
          handlePhotoCapture();
          break;

        case KEYBOARD_SHORTCUTS.SEND:
          event.preventDefault();
          handleSendData();
          break;

        case KEYBOARD_SHORTCUTS.ADD:
          if (shouldShowAddButton()) {
            event.preventDefault();
            if (!openModal) {
              setOpenModal(true);
            } else {
              // Allow typing 'A' in input when modal is open
              const activeElement = document.activeElement as HTMLInputElement;
              if (activeElement?.tagName === 'INPUT') {
                const start =
                  activeElement.selectionStart ?? activeElement.value.length;
                const end =
                  activeElement.selectionEnd ?? activeElement.value.length;
                const newValue =
                  activeElement.value.substring(0, start) +
                  'A' +
                  activeElement.value.substring(end);

                activeElement.value = newValue;
                activeElement.setSelectionRange(start + 1, start + 1);
                activeElement.dispatchEvent(
                  new Event('input', { bubbles: true }),
                );
              }
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [openModal, store.regime, store.messages]);

  // Initialize
  useEffect(() => {
    fetchRegimeList();
    startFtpServer();
  }, []);

  // Render Helpers
  const messageStatus = getMessageStatus();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm p-4 flex flex-col h-full">
        <div className="flex-1 space-y-4">
          <StatusHeader />

          {/* Message Controls */}
          {shouldShowAddButton() && (
            <div className="flex items-center gap-4">
              <button
                className="add-button px-2 py-1 rounded-full text-m"
                onClick={() => setOpenModal(true)}
              >
                <Plus className="w-4 h-4" /> Add
              </button>
              <span className="counter-badge text-blue-600 w-1/2 font-semibold bg-blue-50 px-2 py-1 rounded-full text-m">
                {getMessageCounter()}
              </span>
            </div>
          )}

          {/* Message Status */}
          {messageStatus && (
            <div className="flex items-center gap-4">
              <span
                className={`w-full px-4 py-2 ${messageStatus.color} text-white rounded-md hover:bg-green-600 flex items-center justify-center gap-2`}
              >
                <messageStatus.icon className="w-5 h-5" />
                {messageStatus.label}
              </span>
            </div>
          )}

          <JobControl
            handleRegimeChange={handleRegimeChange}
            regimeCol={regimeCol}
          />
          <KeyboardShortcuts />
        </div>

        <BottomSideControl />
      </aside>

      <main className="flex-1 flex flex-col">
        <ImagePanel
          handlePhotoCapture={handlePhotoCapture}
          handleSendData={handleSendData}
        />
        <MessageLog messageLimit={MESSAGE_LIMIT} messages={store.messages} />
      </main>

      <ModalAdd modal={openModal} setOpenModal={setOpenModal} />
    </div>
  );
}

export default Home;
