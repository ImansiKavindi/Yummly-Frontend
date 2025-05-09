import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../pages/UserContext';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/home" className="navbar-logo">
                    Yummly
                </Link>
                
                {user ? (
                    <ul className="nav-menu">
                        <li className="nav-item">
                            <Link to="/home" className="nav-link">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/recipes" className="nav-link">Recipes</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/groups" className="nav-link">Groups</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/profile" className="nav-link">Profile</Link>
                        </li>
                        <li className="nav-item">
                            <button className="logout-btn" onClick={handleLogout}>Logout</button>
                        </li>
                    </ul>
                ) : (
                    <ul className="nav-menu">
                        <li className="nav-item">
                            <Link to="/" className="nav-link">Login</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/signup" className="nav-link">Sign Up</Link>
                        </li>
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navbar; 