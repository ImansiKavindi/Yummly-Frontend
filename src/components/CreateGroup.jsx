import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupService from '../services/GroupService';
import GroupNav from './GroupNav';
import { useUser } from '../pages/UserContext';
import Swal from 'sweetalert2';
import '../styles/CreateGroup.css';

const CreateGroup = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisineType: '',
    imageUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get current user ID from context
  const currentUserId = user ? user.id : null;
  
  // List of common cuisine types for select dropdown
  const cuisineTypes = [
    'Italian', 'Mexican', 'Chinese', 'Indian', 'French', 
    'Japanese', 'Thai', 'Mediterranean', 'American', 'Korean',
    'Middle Eastern', 'Vietnamese', 'Greek', 'Spanish', 'Other'
  ];

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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Group name must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.cuisineType) {
      newErrors.cuisineType = 'Please select a cuisine type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await GroupService.createGroup(formData, currentUserId);
      
      setIsSubmitting(false);
      Swal.fire({
        icon: 'success',
        title: 'Group Created',
        text: 'Your group has been created successfully!'
      });
      
      // Navigate to the new group
      navigate(`/groups/${response.data.id}`);
    } catch (err) {
      setIsSubmitting(false);
      console.error('Error creating group:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create group. Please try again.',
      });
    }
  };

  return (
    <div className="create-group-container">
      <GroupNav currentPage="create" />
      
      <h2 className="page-title">Create New Community Group</h2>
      
      <form onSubmit={handleSubmit} className="create-group-form">
        <div className="form-group">
          <label htmlFor="name">Group Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Italian Pasta Lovers"
            maxLength={50}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="cuisineType">Cuisine Type*</label>
          <select
            id="cuisineType"
            name="cuisineType"
            value={formData.cuisineType}
            onChange={handleChange}
            className={errors.cuisineType ? 'error' : ''}
          >
            <option value="">Select a cuisine type</option>
            {cuisineTypes.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
          {errors.cuisineType && <span className="error-message">{errors.cuisineType}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (Optional)</label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className={errors.imageUrl ? 'error' : ''}
          />
          {errors.imageUrl && <span className="error-message">{errors.imageUrl}</span>}
          <span className="form-hint">Add an image URL to represent your group</span>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description*</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Share what your group is about..."
            rows={5}
            maxLength={500}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
          <span className="char-counter">{formData.description.length}/500</span>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/groups')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
      
      <div className="create-group-tips">
        <h3>Tips for a Great Community Group</h3>
        <ul>
          <li>Choose a clear, descriptive name related to the cuisine</li>
          <li>Write a welcoming description that explains the group's purpose</li>
          <li>Be specific about what members can expect to share and discuss</li>
          <li>Consider the types of discussions and content you'll encourage</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateGroup; 