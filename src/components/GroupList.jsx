import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GroupService from '../services/GroupService';
import '../styles/GroupList.css';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('all');
  
  // Mock user ID (would come from auth context in a real app)
  const currentUserId = 1;

  useEffect(() => {
    loadGroups();
  }, [currentFilter]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      let response;
      
      switch(currentFilter) {
        case 'member':
          response = await GroupService.getGroupsByMember(currentUserId);
          break;
        case 'admin':
          response = await GroupService.getGroupsByAdmin(currentUserId);
          break;
        default:
          response = await GroupService.getAllGroups();
      }
      
      setGroups(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load groups. Please try again later.');
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadGroups();
      return;
    }
    
    setLoading(true);
    try {
      const response = await GroupService.searchGroups(searchQuery);
      setGroups(response.data);
      setError(null);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Error searching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group-list-container">
      <div className="group-list-header">
        <h2>Community Groups</h2>
        <Link to="/groups/create" className="create-group-btn">Create New Group</Link>
      </div>
      
      <div className="group-list-filters">
        <button 
          className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCurrentFilter('all')}
        >
          All Groups
        </button>
        <button 
          className={`filter-btn ${currentFilter === 'member' ? 'active' : ''}`}
          onClick={() => setCurrentFilter('member')}
        >
          My Groups
        </button>
        <button 
          className={`filter-btn ${currentFilter === 'admin' ? 'active' : ''}`}
          onClick={() => setCurrentFilter('admin')}
        >
          Managed by Me
        </button>
      </div>
      
      <div className="group-search">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by name or cuisine type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="no-groups">
          <p>No groups found. {currentFilter === 'all' ? 'Be the first to create one!' : ''}</p>
        </div>
      ) : (
        <div className="group-cards">
          {groups.map(group => (
            <div key={group.id} className="group-card">
              <div className="group-card-image">
                {group.imageUrl ? (
                  <img src={group.imageUrl} alt={group.name} />
                ) : (
                  <div className="group-card-image-placeholder">
                    <i className="fa fa-cutlery"></i>
                  </div>
                )}
              </div>
              <div className="group-card-content">
                <h3>{group.name}</h3>
                <p className="cuisine-type">Cuisine: {group.cuisineType}</p>
                <p className="description">{group.description}</p>
                <div className="group-meta">
                  <span><i className="fa fa-users"></i> {group.memberCount} members</span>
                  <span><i className="fa fa-user"></i> {group.adminName}</span>
                </div>
                <Link to={`/groups/${group.id}`} className="view-group-btn">View Group</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupList; 