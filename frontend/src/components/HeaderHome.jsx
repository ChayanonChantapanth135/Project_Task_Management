import React from 'react';
import { Link } from 'react-router-dom';
import logoB from '../assets/logoW.png';

const Header = () => {
    return (
            <header className="p-3 text-bg-dark">
                <div className="container">
                    <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                    <a
                        className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none"
                    >
                        <img 
                        src={logoB} 
                        alt="Logo" 
                        className="me-2" 
                        width="40" 
                        height="32"
                        style={{ 
                            mixBlendMode: 'screen',
                            filter: 'invert(1)'
                        }}
                    />
                    </a>
                    <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                        <li>
                        <a href="/" className="nav-link px-2 text-white">
                            Dashboard
                        </a>
                        </li>
                        <li>
                        <a href="#" className="nav-link px-2 text-white">
                            Projects
                        </a>
                        </li>
                        <li>
                        <a href="#" className="nav-link px-2 text-white">
                            Reports
                        </a>
                        </li>
                    </ul>
                    <div className="text-end">
                        {" "}
                        <Link to="/login">
                        <button type="button" className="btn btn-outline-light me-2">
                        Login
                        </button>
                        </Link>
                    </div>
                    </div>
                </div>
        </header>
    );
};

export default Header;