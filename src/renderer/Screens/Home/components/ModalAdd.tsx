import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import './ModalAdd.css'; // import stylesheet
import useTcpStore from '../../../useTcpStore';

export default function ModalAdd({
  modal,
  setOpenModal,
}: {
  modal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { addContend } = useTcpStore();
  const [itemText, setItemText] = useState('');

  const closeModal = () => {
    // toggleAddModal();
    setOpenModal(false);
    setItemText('');
  };

  const handleAdd = () => {
    if (itemText.trim()) {
      addContend(itemText.trim());

      closeModal();
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!modal) {
    return;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Add Item to Image</h2>
          <button onClick={closeModal} className="close-btn">
            <X size={24} />
          </button>
        </div>

        {/* Input Field */}
        <div className="modal-body">
          <label htmlFor="item-input">Item Description</label>
          <input
            id="item-input"
            type="text"
            value={itemText}
            onChange={(e) => setItemText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter item description..."
            autoFocus
          />
        </div>

        {/* Buttons */}
        <div className="modal-actions">
          <button onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!itemText.trim()}
            className="add-btn"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}
