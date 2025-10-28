import React, { useState } from 'react';
import {
  Wifi,
  Image,
  FileJson,
  AlertCircle,
  MessageSquare,
  ZoomIn,
  Flag,
} from 'lucide-react';
import './MessageLog.css';
import useTcpStore from '../../../useTcpStore';

interface Message {
  id: string;
  connectionId: string;
  type: string;
  content: string[];
  timestamp: string;
  regime: number | null;
  imageName: string | null;
}

interface MessageLogProps {
  messages: Message[];
  messageLimit: number;
  onImageClick?: (imageName: string) => void;
}

export default function EnhancedMessageLog({
  messages = [],
  messageLimit = 10,
  onImageClick,
}: MessageLogProps) {
  const { setImage } = useTcpStore();
  const [history, setHistory] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'image':
        return <Image size={14} />;
      case 'json':
        return <FileJson size={14} />;
      case 'error':
        return <AlertCircle size={14} />;
      default:
        return <MessageSquare size={14} />;
    }
  };

  const formatContent = (content: string[]) => {
    if (content.length === 0) return 'Empty';
    if (content.length === 1) return content[0];
    return `${content.length} items`;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  console.log(messages);

  return (
    <>
      <div className="message-log-container">
        <div className="table-container">
          <table className="message-table">
            <thead>
              <tr>
                <th>
                  <span>Time</span>
                </th>
                <th>
                  <span>Type</span>
                </th>
                <th>
                  <span>Content</span>
                </th>
                <th>
                  <span>Job</span>
                </th>
                <th className="center">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-icon">
                        <Wifi size={40} />
                      </div>
                      <div className="empty-title">No messages yet</div>
                      <div className="empty-subtitle">
                        Messages will appear here when received
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                messages
                  .slice(-messageLimit)
                  .reverse()
                  .map((msg) => (
                    <tr key={msg.id}>
                      <td>
                        <span className="timestamp">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`type-badge ${msg.type.toLowerCase()}`}
                        >
                          {getTypeIcon(msg.type)}
                          <span>{msg.type}</span>
                        </span>
                      </td>
                      <td>
                        {msg.type.toLowerCase() === 'json' ? (
                          <code className="content-code">
                            {formatContent(msg.content).slice(0, 60)}
                            {formatContent(msg.content).length > 60
                              ? '...'
                              : ''}
                          </code>
                        ) : msg.type.toLowerCase() === 'image' &&
                          msg.imageName ? (
                          <div className="content-wrapper">
                            <span className="image-name">{msg.imageName}</span>
                            <span className="content-badge">
                              {msg.content.length}{' '}
                              {msg.content.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        ) : (
                          <div className="content-wrapper">
                            <span className="content-text">
                              {formatContent(msg.content)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="regime-value">
                          {msg.regime !== null ? msg.regime : 'N/A'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        {msg.imageName && (
                          <button
                            onClick={() => {
                              setHistory(true);
                              setImage(msg.imageName, msg.content);
                            }}
                            className="action-button"
                            title="View image"
                          >
                            <Image size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="footer">
          <span>
            Showing {Math.min(messageLimit, messages.length)} of{' '}
            {messages.length} messages
          </span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Image Modal
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Image Preview</h3>
            <p className="modal-text">
              Image: <span className="modal-image-name">{selectedImage}</span>
            </p>
            <p className="modal-hint">
              Implement your custom image loading logic here using the imageName
            </p>
            <button
              onClick={() => setSelectedImage(null)}
              className="modal-close-button"
            >
              Close
            </button>
          </div>
        </div>
      )} */}
    </>
  );
}
