import React, { useState, useEffect, useRef } from 'react';
import GroupService from '../services/GroupService';
import { useUser } from '../pages/UserContext';
import '../styles/GroupMessages.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const GroupMessages = ({ groupId, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useUser();
  const messagesContainerRef = useRef(null);
  
  // Get current user ID from context
  const currentUserId = user ? user.id : null;
  
  // Check if user can post messages
  const canPostMessage = userRole.isMember && currentUserId !== null;

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await GroupService.getGroupMessages(groupId, currentUserId);
      // Sort messages by createdAt to ensure chronological order
      const sortedMessages = [...response.data].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages(sortedMessages);
      setError(null);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    try {
      await GroupService.createMessage(groupId, newMessage.trim(), currentUserId);
      setNewMessage('');
      // Fetch messages after sending to update the view
      await fetchMessages();
      // Ensure we scroll to bottom after sending
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Message',
        text: 'Are you sure you want to delete this message?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });
      
      if (result.isConfirmed) {
        await GroupService.deleteMessage(groupId, messageId, currentUserId);
        await fetchMessages();
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Your message has been deleted.',
          timer: 1500
        });
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete the message.'
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + 
           date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading && messages.length === 0) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <div className="group-messages-container">
      <h3 className="messages-title">Group Chat</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="messages-list" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Be the first to start a conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.userId === currentUserId;
              const canDelete = isOwnMessage || userRole.isAdmin || userRole.isModerator;
              
              return (
                <div 
                  key={message.id} 
                  className={`message-item ${isOwnMessage ? 'own-message' : ''}`}
                >
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-author">{message.userName || 'Unknown User'}</span>
                      <span className="message-time">{formatMessageTime(message.createdAt)}</span>
                      
                      {canDelete && (
                        <button 
                          className="delete-message-btn" 
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      )}
                    </div>
                    <p className="message-text">{message.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {!canPostMessage ? (
        <div className="join-message">
          <p>Join this group to participate in the conversation</p>
        </div>
      ) : (
        <form className="message-form" onSubmit={handleSendMessage}>
          <div className="message-input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!newMessage.trim()}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GroupMessages; 