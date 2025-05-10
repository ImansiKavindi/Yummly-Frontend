import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GroupService from '../services/GroupService';
import GroupMessages from './GroupMessages';
import GroupNav from './GroupNav';
import { useUser } from '../pages/UserContext';
import Swal from 'sweetalert2';
import '../styles/GroupDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faExchangeAlt, faUserPlus, faSignOutAlt, faPenToSquare } from '@fortawesome/free-solid-svg-icons';

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
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
  const [activeTab, setActiveTab] = useState('about');
  
  // Get current user ID from context
  const currentUserId = user ? user.id : null;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Authentication Required',
        text: 'You need to log in to view group details',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        navigate('/');
      });
      return;
    }
    
    // Get the requested tab from URL hash, if any
    const hash = window.location.hash.substring(1);
    if (hash === 'messages') {
      setActiveTab('messages');
    }
    
    loadGroupData();
  }, [groupId, currentUserId, user, navigate]);

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

  const handleRemoveMember = async (userId) => {
    try {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Remove Member?',
        text: 'Are you sure you want to remove this member from the group?',
        showCancelButton: true,
        confirmButtonText: 'Yes, Remove',
        cancelButtonText: 'Cancel'
      });
      
      if (result.isConfirmed) {
        await GroupService.removeMember(groupId, userId, currentUserId);
        Swal.fire({
          icon: 'success',
          title: 'Member Removed',
          text: 'The member has been removed from the group'
        });
        loadGroupData(); // Refresh data
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed to Remove Member',
        text: 'There was an error removing the member'
      });
      console.error('Error removing member:', err);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
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
      <GroupNav />
      
      <div className="group-header">
        <div className="group-header-content">
          <div className="group-header-image">
            {group.imageUrl ? (
              <img src={group.imageUrl} alt={group.name} />
            ) : (
              <div className="no-image">
                <span>{group.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="group-header-text">
            <h2>{group.name}</h2>
            <p className="cuisine-type">Cuisine: {group.cuisineType}</p>
          </div>
        </div>
        
        <div className="group-actions">
          {!userRole.isMember && (
            <button className="join-btn" onClick={handleJoinGroup}>
              <FontAwesomeIcon icon={faUserPlus} /> Join Group
            </button>
          )}
          
          {userRole.isMember && !userRole.isAdmin && (
            <button className="leave-btn" onClick={handleLeaveGroup}>
              <FontAwesomeIcon icon={faSignOutAlt} /> Leave Group
            </button>
          )}
          
          {userRole.isAdmin && (
            <div className="admin-buttons">
              <button className="edit-btn" onClick={() => navigate(`/groups/${groupId}/edit`)}>
                <FontAwesomeIcon icon={faPenToSquare} /> Edit
              </button>
              <button className="transfer-btn" onClick={handleTransferOwnership}>
                <FontAwesomeIcon icon={faExchangeAlt} /> Transfer
              </button>
              <button className="delete-btn" onClick={handleDeleteGroup}>
                <FontAwesomeIcon icon={faTrashAlt} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="group-tabs">
        <button 
          className={`group-tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => switchTab('about')}
        >
          About
        </button>
        {userRole.isMember && (
          <button 
            className={`group-tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => switchTab('messages')}
          >
            Messages
          </button>
        )}
      </div>
      
      {activeTab === 'about' && (
        <>
          <div className="group-description">
            <h3>About this Group</h3>
            <p>{group.description}</p>
          </div>
          
          <div className="group-members">
            <h3>Members ({members.length})</h3>
            <ul className="members-list">
              {members.map(member => (
                <li key={member.id} className="member-item">
                  <span className="member-name">
                    {member.name}
                    {group.adminId === member.id && <span className="admin-badge">Admin</span>}
                    {isModerator(member.id) && <span className="moderator-badge">Moderator</span>}
                  </span>
                  
                  {/* Member actions for moderators and admin */}
                  {(userRole.isAdmin || (userRole.isModerator && !isModerator(member.id) && group.adminId !== member.id)) && (
                    <div className="member-actions">
                      {/* Remove member button */}
                      {group.adminId !== member.id && member.id !== currentUserId && (
                        <button 
                          className="remove-member-btn"
                          onClick={() => handleRemoveMember(member.id)}
                          title="Remove member"
                        >
                          Remove
                        </button>
                      )}
                      
                      {/* Moderator toggle button (admin only) */}
                      {userRole.isAdmin && member.id !== currentUserId && (
                        isModerator(member.id) ? (
                          <button 
                            className="toggle-mod-btn"
                            onClick={() => handleRemoveModerator(member.id)}
                            title="Remove moderator role"
                          >
                            Remove Mod
                          </button>
                        ) : (
                          <button 
                            className="toggle-mod-btn"
                            onClick={() => handleAddModerator(member.id)}
                            title="Add moderator role"
                          >
                            Make Mod
                          </button>
                        )
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      
      {activeTab === 'messages' && userRole.isMember && (
        <GroupMessages groupId={groupId} userRole={userRole} />
      )}
    </div>
  );
};

export default GroupDetail; 