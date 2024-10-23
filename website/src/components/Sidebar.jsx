import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Sidebar({ isOpen }) {
  
  const [selectedLink, setSelectedLink] = useState('/');
  const navigate = useNavigate();

 
  const handleLinkClick = (link) => {
    setSelectedLink(link);
  };

  
  const handleLogout = () => {
   
    navigate('/');
  };

  return (
    <div
      style={{
        ...styles.sidebar,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      <h2 style={styles.heading}>TeleTrack</h2>
      <ul style={styles.list}>
        <li style={styles.listItem}>
          <Link
            to="/dashboard"
            style={{
              ...styles.link,
              ...(selectedLink === '/dashboard' ? styles.selectedLink : {}),
            }}
            onClick={() => handleLinkClick('/dashboard')}
          >
            Dashboard
          </Link>
        </li>
       
        <li style={styles.listItem}>
          <Link
            to="/call-logs"
            style={{
              ...styles.link,
              ...(selectedLink === '/call-logs' ? styles.selectedLink : {}),
            }}
            onClick={() => handleLinkClick('/call-logs')}
          >
            Call Logs
          </Link>
        </li>
        <li style={styles.listItem}>
          <Link
            to="/team"
            style={{
              ...styles.link,
              ...(selectedLink === '/team' ? styles.selectedLink : {}),
            }}
            onClick={() => handleLinkClick('/team')}
          >
            Employees
          </Link>
        </li>
      </ul>
      <div style={styles.profileSection}>
        <p style={styles.profileText}>Profile</p>
        <button
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100%',
    width: '250px',
    backgroundColor: '#f8f9fa',
    color: '#333',
    paddingTop: '5px',
    paddingLeft: '0px',
    boxShadow: '2px 0 15px rgba(0, 0, 0, 0.1)',
    zIndex: 999,
  },
  heading: {
    fontSize: '25px',
    marginBottom: '30px',
    color: '#4285f4',
    textAlign: 'center',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  listItem: {
    marginBottom: '5px',
  },
  link: {
    textDecoration: 'none',
    color: '#333',
    fontSize: '17px',
    padding: '20px 35px',
    display: 'block',
    transition: 'background-color 0.3s ease',
  },
  selectedLink: {
    backgroundColor: '#4285f4',
    color: '#fff',
  },
  profileSection: {
    marginTop: '30px',
    borderTop: '1px solid #eaeaea',
    paddingTop: '10px',
  },
  profileText: {
    fontSize: '14px',
    color: '#999',
    marginLeft: '20px',
    marginBottom: '10px',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    cursor: 'pointer',
    borderRadius: '5px',
    marginLeft: '20px',
    marginBottom: '10px',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
};

export default Sidebar;

