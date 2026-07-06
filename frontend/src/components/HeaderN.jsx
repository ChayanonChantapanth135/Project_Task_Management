import React from "react";
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import logoB from '../assets/logoW.png';
import signOut from '../lib/auth';
import profilePic from '../assets/profile2.jpg';

const HeaderN = () => {
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/Home_Anonymous');
  };

  return (
    <div>
      <header className="p-3 mb-3 border-bottom bg-dark">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
            <a
              className="d-flex align-items-center text-white mb-2 mb-lg-0 link-body-emphasis text-decoration-none"
            >
              <img
                src={logoB}
                alt="Logo"
                className="me-2"
                width="40"
                height="32"
                style={{
                  mixBlendMode: "screen",
                  filter: "invert(1)",
                }}
              />
            </a>
            <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
              <li>
                <a href="#" className="nav-link px-2 text-white">Dashboard</a>
              </li>
              <li>
                <a href="#" className="nav-link px-2 text-white">Manage Users</a>
              </li>
              <li>
                <a href="#" className="nav-link px-2 text-white">Projects</a>
              </li>
              <li>
                <a href="#" className="nav-link px-2 text-white">Reports</a>
              </li>
            </ul>
              <img
                  src={profilePic}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-circle"
                  style={{ objectFit: 'cover' }}
              />
            {/* ใช้ React Bootstrap Dropdown */}
            <Dropdown align="end" className="ms-3" >
              <Dropdown.Toggle 
                variant="link" 
                className="p-0 border-0 text-warning"
                id="dropdown-profile"
              >
                
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="#">Profile</Dropdown.Item>
                <Dropdown.Item href="#">My Task</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as="button" onClick={handleSignOut}>
                  Sign out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </header>
    </div>
  );
};

export default HeaderN;