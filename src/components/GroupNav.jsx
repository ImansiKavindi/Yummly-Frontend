import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/GroupNav.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const GroupNav = ({ currentPage }) => {
  const navigate = useNavigate();

  return (
    <div className="group-nav-container">
      <div className="group-nav-left">
        <h2>Community Groups</h2>
      </div>
      
      <div className="group-nav-center">
        <Link to="/groups" className={`nav-link ${currentPage === 'all' ? 'active' : ''}`}>
          All Groups
        </Link>
        <Link to="/groups/my-groups" className={`nav-link ${currentPage === 'member' ? 'active' : ''}`}>
          My Groups
        </Link>
        <Link to="/groups/managed" className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`}>
          Managed by Me
        </Link>
      </div>
      
      <div className="group-nav-right">
        <button 
          className="home-btn"
          onClick={() => navigate('/home')}
        >
          <FontAwesomeIcon icon={faHome} /> Home
        </button>
      </div>
    </div>
  );
};

export default GroupNav; 