import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GroupService from '../services/GroupService';
import GroupNav from './GroupNav';
import { useUser } from '../pages/UserContext';
import '../styles/GroupList.css';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEye, faComments, faUserPlus, faSignOutAlt, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';

const AllGroups = () => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userMemberships, setUserMemberships] = useState({});
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
        text: 'You need to log in to view community groups',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        navigate('/');
      });
      return;
    }
    
    fetchGroups();
    if (user) {
      fetchUserMemberships();
    }
  }, [user, navigate]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await GroupService.getAllGroups();
      setGroups(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch groups. Please try again later.');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMemberships = async () => {
    try {
      const response = await GroupService.getUserGroups(user.id);
      const membershipsMap = {};
      
      response.data.forEach(group => {
        membershipsMap[group.id] = true;
      });
      
      setUserMemberships(membershipsMap);
    } catch (err) {
      console.error('Error fetching user memberships:', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleJoinGroup = async (groupId) => {
    try {
      if (!user) {
        navigate('/');
        return;
      }
      
      await GroupService.joinGroup(groupId, user.id);
      
      setUserMemberships({
        ...userMemberships,
        [groupId]: true
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'You have joined this group successfully!',
        timer: 1500
      });
    } catch (err) {
      console.error('Error joining group:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to join the group. Please try again.'
      });
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      if (!user) {
        navigate('/');
        return;
      }
      
      await GroupService.leaveGroup(groupId, user.id);
      
      const updatedMemberships = { ...userMemberships };
      delete updatedMemberships[groupId];
      setUserMemberships(updatedMemberships);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'You have left this group successfully!',
        timer: 1500
      });
    } catch (err) {
      console.error('Error leaving group:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to leave the group. Please try again.'
      });
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.cuisineType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="group-list-container">
      <GroupNav />
      
      <div className="group-list-header">
        <h2 className="page-title">Community Groups</h2>
        <p className="page-description">
          Join groups to connect with people who share your culinary interests
        </p>
        
        <div className="group-search">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search groups by name, cuisine, or description..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading groups...</div>
      ) : filteredGroups.length === 0 ? (
        <div className="no-groups">
          <p>No groups match your search criteria.</p>
          <button 
            className="create-group-btn" 
            onClick={() => navigate("/groups/create")}
          >
            Create a New Group
          </button>
        </div>
      ) : (
        <div className="group-cards">
          {filteredGroups.map((group) => (
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
                  
                  {userMemberships[group.id] && (
                    <Link to={`/groups/${group.id}#messages`} className="chat-group-btn">
                      <FontAwesomeIcon icon={faComments} /> Chat
                    </Link>
                  )}
                  
                  {!userMemberships[group.id] ? (
                    <button
                      className="join-group-btn"
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      <FontAwesomeIcon icon={faUserPlus} /> Join
                    </button>
                  ) : (
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
}

export default AllGroups; 