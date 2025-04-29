import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GroupService from '../services/GroupService';
import Swal from 'sweetalert2';
import '../styles/CreateGroup.css'; // Reusing the CreateGroup styles

const EditGroup = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisineType: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock user ID (would come from auth context in a real app)
  const currentUserId = 1;
  
  // List of common cuisine types for select dropdown
  const cuisineTypes = [
    'Italian', 'Mexican', 'Chinese', 'Indian', 'French', 
    'Japanese', 'Thai', 'Mediterranean', 'American', 'Korean',
    'Middle Eastern', 'Vietnamese', 'Greek', 'Spanish', 'Other'
  ];

  // Load group data on component mount
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setIsLoading(true);
        const response = await GroupService.getGroupById(groupId);
        
        // Check if user is admin
        const isAdminRes = await GroupService.isAdmin(groupId, currentUserId);
        if (!isAdminRes.data) {
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Only group administrators can edit group details'
          });
          navigate(`/groups/${groupId}`);
          return;
        }
        
        // Set form data from response
        setFormData({
          name: response.data.name,
          description: response.data.description,
          cuisineType: response.data.cuisineType
        });
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
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await GroupService.updateGroup(groupId, formData, currentUserId);
      
      Swal.fire({
        icon: 'success',
        title: 'Group Updated!',
        text: 'Your community group has been updated successfully.'
      });
      
      // Redirect back to the group's page
      navigate(`/groups/${groupId}`);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Update Group',
        text: 'There was an error updating your group. Please try again.'
      });
      console.error('Error updating group:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading group details...</div>;
  }

  return (
    <div className="create-group-container">
      <h2>Edit Community Group</h2>
      
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
            onClick={() => navigate(`/groups/${groupId}`)}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGroup; 