import React from "react";
import { Link } from "react-router-dom";

/**
 * คอมโพเนนต์แถบส่วนท้ายของหน้าเว็บ (Footer Component)
 */
const Footer = () => {
  return (
    <>
      <style>{`
        #site-footer,
        #site-footer p,
        #site-footer a,
        #site-footer li,
        #site-footer span {
          color: #cbd5e1 !important;
        }
        #site-footer a:hover {
          color: #2dd4bf !important;
        }
      `}</style>
      <footer
        id="site-footer"
        className="w-full transition-all"
        style={{
          marginTop: "auto",
          padding: "2rem 0",
          fontFamily: "sans-serif",
          fontSize: "0.875rem",
          backgroundColor: "transparent",
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: "#f8fafc" }}>
            © 2026 RNM Task Management. All rights reserved.
          </p>

          <ul
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            <li>
              <Link
                to="/Home"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={{
                  color: "#e2e8f0",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/Contract"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={{
                  color: "#e2e8f0",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Contract
              </Link>
            </li>
            <li>
              <Link
                to="/About"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                style={{
                  color: "#e2e8f0",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                About
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    </>
  );
};

export default Footer;
