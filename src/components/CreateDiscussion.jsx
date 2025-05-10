import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../styles/CreateGroup.css'; // Reusing the existing styles

const CreateDiscussion = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState(null);
  
  // Mock user ID (would come from auth context in a real app)
  const currentUserId = 1;

  // Load group data on component mount
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:8080/api/groups/${groupId}`);
        setGroup(response.data);
        
        // Check if user is a member
        const isMemberRes = await axios.get(`http://localhost:8080/api/groups/${groupId}/is-member`, {
          headers: { 'userid': currentUserId }
        });
        
        if (!isMemberRes.data) {
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'You must be a member of this group to start a discussion'
          });
          navigate(`/groups/${groupId}`);
          return;
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Load Group',
          text: 'There was an error loading the group details'
        });
        console.error('Error loading group:', err);
        navigate('/groups');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGroupData();
  }, [groupId, navigate, currentUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Discussion title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Discussion content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axios.post(`http://localhost:8080/api/groups/${groupId}/discussions`, 
        formData,
        { headers: { 'userid': currentUserId } }
      );
      
      Swal.fire({
        icon: 'success',
        title: 'Discussion Created!',
        text: 'Your discussion has been posted successfully.'
      });
      
      // Redirect back to the group's page
      navigate(`/groups/${groupId}`);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Discussion',
        text: 'There was an error creating your discussion. Please try again.'
      });
      console.error('Error creating discussion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading group details...</div>;
  }

  return (
    <div className="create-group-container">
      <h2>Start New Discussion in {group?.name}</h2>
      
      <form onSubmit={handleSubmit} className="create-group-form">
        <div className="form-group">
          <label htmlFor="title">Discussion Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What would you like to discuss?"
            maxLength={100}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content*</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Share your thoughts, questions, or ideas..."
            rows={8}
            maxLength={2000}
            className={errors.content ? 'error' : ''}
          />
          {errors.content && <span className="error-message">{errors.content}</span>}
          <span className="char-counter">{formData.content.length}/2000</span>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate(`/groups/${groupId}`)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Discussion'}
          </button>
        </div>
      </form>
      
      <div className="create-group-tips">
        <h3>Tips for a Great Discussion</h3>
        <ul>
          <li>Use a clear, specific title that indicates the topic</li>
          <li>Be respectful and considerate of different viewpoints</li>
          <li>Include details or questions to encourage responses</li>
          <li>Stay on topic related to the group's cuisine focus</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateDiscussion; 