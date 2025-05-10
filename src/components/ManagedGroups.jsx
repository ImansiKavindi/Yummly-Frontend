import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GroupService from '../services/GroupService';
import GroupNav from './GroupNav';
import { useUser } from '../pages/UserContext';
import Swal from 'sweetalert2';
import '../styles/GroupList.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faUsers, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';

const ManagedGroups = () => {
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
        text: 'You need to log in to view managed groups',
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
      const response = await GroupService.getGroupsByAdmin(currentUserId);
      setGroups(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load your managed groups. Please try again later.');
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Delete Group?',
        text: 'This action cannot be undone. All group data will be permanently deleted.',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#d33'
      });
      
      if (result.isConfirmed) {
        console.log(`Attempting to delete group ${groupId} by user ${currentUserId}`);
        
        // Show loading indicator
        Swal.fire({
          title: 'Deleting...',
          text: 'Please wait while we delete the group',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        const response = await GroupService.deleteGroup(groupId, currentUserId);
        console.log('Delete response:', response);
        
        Swal.fire({
          icon: 'success',
          title: 'Group Deleted',
          text: 'The group has been successfully deleted',
          timer: 1500
        });
        
        // Refresh the list after a short delay
        setTimeout(() => {
          loadGroups();
        }, 500);
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      console.error('Error details:', err.response?.data || 'No response data');
      console.error('Status code:', err.response?.status || 'No status code');
      
      let errorMessage = 'There was an error deleting the group. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Delete',
        text: errorMessage,
        footer: `Status: ${err.response?.status || 'Unknown'}`
      });
    }
  };

  const viewMembersList = async (groupId) => {
    try {
      const membersResponse = await GroupService.getGroupMembers(groupId);
      const members = membersResponse.data;
      
      if (members.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Members',
          text: 'This group has no members except you.'
        });
        return;
      }
      
      const membersList = members
        .filter(member => member.id !== currentUserId) // Exclude admin
        .map(member => `
          <div class="member-item">
            <span>${member.name}</span>
            <button class="remove-btn" data-member-id="${member.id}">Remove</button>
          </div>
        `).join('');
      
      const result = await Swal.fire({
        title: 'Group Members',
        html: `
          <div class="members-container">
            ${membersList || '<p>No other members in this group.</p>'}
          </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Close',
        customClass: {
          container: 'members-swal-container'
        },
        didOpen: () => {
          // Add event listeners to remove buttons
          document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', () => {
              const memberId = button.getAttribute('data-member-id');
              removeMember(groupId, parseInt(memberId));
            });
          });
        }
      });
    } catch (err) {
      console.error('Error viewing members:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load group members'
      });
    }
  };

  const removeMember = async (groupId, memberId) => {
    try {
      const confirmResult = await Swal.fire({
        icon: 'warning',
        title: 'Remove Member?',
        text: 'Are you sure you want to remove this member from the group?',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove',
        cancelButtonText: 'Cancel'
      });
      
      if (confirmResult.isConfirmed) {
        await GroupService.removeMember(groupId, memberId, currentUserId);
        Swal.fire({
          icon: 'success',
          title: 'Member Removed',
          text: 'The member has been removed from the group',
          timer: 1500
        });
        
        // Refresh the members list
        viewMembersList(groupId);
      }
    } catch (err) {
      console.error('Error removing member:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to remove member'
      });
    }
  };

  return (
    <div className="group-list-container">
      <GroupNav currentPage="admin" />
      
      <div className="group-list-header">
        <h2 className="page-title">Groups You Manage</h2>
        <p className="page-description">
          These are the groups you've created. As the admin, you can edit group details, manage members, and more.
        </p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading your managed groups...</div>
      ) : groups.length === 0 ? (
        <div className="no-groups">
          <p>You haven't created any groups yet.</p>
          <button 
            className="create-group-btn"
            onClick={() => navigate('/groups/create')}
          >
            Create a New Group
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
                    <FontAwesomeIcon icon={faEye} /> View
                  </Link>
                  <Link to={`/groups/${group.id}/edit`} className="edit-group-btn">
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </Link>
                  <button 
                    className="members-group-btn"
                    onClick={() => viewMembersList(group.id)}
                  >
                    <FontAwesomeIcon icon={faUsers} /> Members
                  </button>
                  <button 
                    className="delete-group-btn"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} /> Delete
                  </button>
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

export default ManagedGroups; 