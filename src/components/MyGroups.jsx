import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GroupService from '../services/GroupService';
import GroupNav from './GroupNav';
import { useUser } from '../pages/UserContext';
import Swal from 'sweetalert2';
import '../styles/GroupList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faComments, faSignOutAlt, faPlus } from '@fortawesome/free-solid-svg-icons';

const MyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Get current user ID from context
  const currentUserId = user ? user.id : null;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Authentication Required',
        text: 'You need to log in to view your groups',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        navigate('/');
      });
      return;
    }
    
    if (currentUserId) {
      loadGroups();
    }
  }, [currentUserId, user, navigate]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const response = await GroupService.getGroupsByMember(currentUserId);
      setGroups(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load your groups. Please try again later.');
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Leave Group?',
        text: 'Are you sure you want to leave this group?',
        showCancelButton: true,
        confirmButtonText: 'Yes, Leave',
        cancelButtonText: 'Cancel'
      });
      
      if (result.isConfirmed) {
        await GroupService.leaveGroup(groupId, currentUserId);
        Swal.fire({
          icon: 'success',
          title: 'Left Successfully',
          text: 'You have left the group',
          timer: 1500
        });
        loadGroups(); // Refresh the list
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Leave',
        text: err.response?.data?.message || 'There was an error leaving the group'
      });
      console.error('Error leaving group:', err);
    }
  };

  return (
    <div className="group-list-container">
      <GroupNav currentPage="member" />
      
      <div className="group-list-header">
        <h2 className="page-title">My Groups</h2>
        <p className="page-description">
          Groups you've joined. Participate in discussions, share recipes, and connect with like-minded food enthusiasts.
        </p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading your groups...</div>
      ) : groups.length === 0 ? (
        <div className="no-groups">
          <p>You haven't joined any groups yet.</p>
          <button 
            className="create-group-btn"
            onClick={() => navigate('/groups')}
          >
            Find Groups to Join
          </button>
        </div>
      ) : (
        <div className="group-cards">
          {groups.map(group => (
            <div key={group.id} className="group-card">
              <div className="group-card-image">
                {group.imageUrl ? (
                  <img src={group.imageUrl} alt={group.name} />
                ) : (
                  <div className="no-image">
                    <span>{group.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="group-card-content">
                <h3 className="group-name">{group.name}</h3>
                <p className="group-cuisine">Cuisine: {group.cuisineType}</p>
                <p className="group-description-preview">
                  {group.description.length > 100
                    ? `${group.description.substring(0, 100)}...`
                    : group.description}
                </p>
                
                <div className="group-card-actions">
                  <Link to={`/groups/${group.id}`} className="view-group-btn">
                    <FontAwesomeIcon icon={faEye} /> View Group
                  </Link>
                  
                  <Link to={`/groups/${group.id}#messages`} className="chat-group-btn">
                    <FontAwesomeIcon icon={faComments} /> Chat
                  </Link>
                  
                  {group.adminId !== currentUserId && (
                    <button 
                      className="leave-group-btn"
                      onClick={() => handleLeaveGroup(group.id)}
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} /> Leave
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Link to="/groups/create" className="create-group-fab">
        <FontAwesomeIcon icon={faPlus} />
      </Link>
    </div>
  );
};

export default MyGroups; 