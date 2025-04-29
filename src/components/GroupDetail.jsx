import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GroupService from '../services/GroupService';
import Swal from 'sweetalert2';
import '../styles/GroupDetail.css';

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState({
    isMember: false,
    isModerator: false,
    isAdmin: false
  });
  
  // Mock user ID (would come from auth context in a real app)
  const currentUserId = 1;

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    setLoading(true);
    try {
      // Load group details
      const groupResponse = await GroupService.getGroupById(groupId);
      setGroup(groupResponse.data);
      
      // Load members
      const membersResponse = await GroupService.getGroupMembers(groupId);
      setMembers(membersResponse.data);
      
      // Load moderators
      const moderatorsResponse = await GroupService.getGroupModerators(groupId);
      setModerators(moderatorsResponse.data);
      
      // Check user roles
      const [isMemberRes, isModeratorRes, isAdminRes] = await Promise.all([
        GroupService.isMember(groupId, currentUserId),
        GroupService.isModerator(groupId, currentUserId),
        GroupService.isAdmin(groupId, currentUserId)
      ]);
      
      setUserRole({
        isMember: isMemberRes.data,
        isModerator: isModeratorRes.data,
        isAdmin: isAdminRes.data
      });
      
      setError(null);
    } catch (err) {
      setError('Failed to load group details. Please try again later.');
      console.error('Error loading group details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      await GroupService.joinGroup(groupId, currentUserId);
      Swal.fire({
        icon: 'success',
        title: 'Joined Successfully',
        text: 'You are now a member of this group'
      });
      loadGroupData(); // Refresh data
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Join',
        text: 'There was an error joining the group'
      });
      console.error('Error joining group:', err);
    }
  };

  const handleLeaveGroup = async () => {
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
          text: 'You have left the group'
        });
        loadGroupData(); // Refresh data
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

  const handleDeleteGroup = async () => {
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
        await GroupService.deleteGroup(groupId, currentUserId);
        Swal.fire({
          icon: 'success',
          title: 'Group Deleted',
          text: 'The group has been successfully deleted'
        });
        navigate('/groups'); // Redirect to groups list
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Delete',
        text: 'There was an error deleting the group'
      });
      console.error('Error deleting group:', err);
    }
  };

  const handleAddModerator = async (userId) => {
    try {
      await GroupService.addModerator(groupId, userId, currentUserId);
      Swal.fire({
        icon: 'success',
        title: 'Moderator Added',
        text: 'The user is now a moderator'
      });
      loadGroupData(); // Refresh data
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Moderator',
        text: 'There was an error adding the moderator'
      });
      console.error('Error adding moderator:', err);
    }
  };

  const handleRemoveModerator = async (userId) => {
    try {
      await GroupService.removeModerator(groupId, userId, currentUserId);
      Swal.fire({
        icon: 'success',
        title: 'Moderator Removed',
        text: 'The user is no longer a moderator'
      });
      loadGroupData(); // Refresh data
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Remove Moderator',
        text: 'There was an error removing the moderator'
      });
      console.error('Error removing moderator:', err);
    }
  };

  const handleTransferOwnership = async () => {
    try {
      const { value: newAdminId } = await Swal.fire({
        title: 'Transfer Ownership',
        input: 'select',
        inputOptions: Object.fromEntries(
          members
            .filter(member => member.id !== currentUserId)
            .map(member => [member.id, member.name])
        ),
        inputPlaceholder: 'Select a new admin',
        showCancelButton: true
      });
      
      if (newAdminId) {
        await GroupService.transferOwnership(groupId, Number(newAdminId), currentUserId);
        Swal.fire({
          icon: 'success',
          title: 'Ownership Transferred',
          text: 'Group ownership has been transferred successfully'
        });
        loadGroupData(); // Refresh data
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Transfer Ownership',
        text: 'There was an error transferring ownership'
      });
      console.error('Error transferring ownership:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading group details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!group) {
    return <div className="error-message">Group not found</div>;
  }

  const isModerator = userId => 
    moderators.some(moderator => moderator.id === userId);

  return (
    <div className="group-detail-container">
      <div className="group-header">
        <h2>{group.name}</h2>
        <p className="cuisine-type">Cuisine: {group.cuisineType}</p>
      </div>
      
      <div className="group-actions">
        {!userRole.isMember && (
          <button className="join-btn" onClick={handleJoinGroup}>Join Group</button>
        )}
        
        {userRole.isMember && !userRole.isAdmin && (
          <button className="leave-btn" onClick={handleLeaveGroup}>Leave Group</button>
        )}
        
        {userRole.isAdmin && (
          <>
            <button className="edit-btn" onClick={() => navigate(`/groups/${groupId}/edit`)}>
              Edit Group
            </button>
            <button className="transfer-btn" onClick={handleTransferOwnership}>
              Transfer Ownership
            </button>
            <button className="delete-btn" onClick={handleDeleteGroup}>
              Delete Group
            </button>
          </>
        )}
      </div>
      
      <div className="group-description">
        <h3>About</h3>
        <p>{group.description}</p>
      </div>
      
      <div className="group-members">
        <h3>Members ({members.length})</h3>
        <div className="members-list">
          {members.map(member => (
            <div key={member.id} className="member-card">
              <span className="member-name">{member.name}</span>
              {member.id === group.adminId && (
                <span className="admin-badge">Admin</span>
              )}
              {isModerator(member.id) && member.id !== group.adminId && (
                <span className="moderator-badge">Moderator</span>
              )}
              
              {userRole.isAdmin && member.id !== currentUserId && member.id !== group.adminId && (
                <>
                  {!isModerator(member.id) ? (
                    <button 
                      className="make-moderator-btn"
                      onClick={() => handleAddModerator(member.id)}
                    >
                      Make Moderator
                    </button>
                  ) : (
                    <button 
                      className="remove-moderator-btn"
                      onClick={() => handleRemoveModerator(member.id)}
                    >
                      Remove Moderator
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="group-discussions">
        <h3>Discussions</h3>
        {userRole.isMember && (
          <button 
            className="new-discussion-btn"
            onClick={() => navigate(`/groups/${groupId}/discussions/create`)}
          >
            Start New Discussion
          </button>
        )}
        {/* Discussion list would go here */}
        <p className="placeholder">Discussions feature coming soon...</p>
      </div>
    </div>
  );
};

export default GroupDetail; 