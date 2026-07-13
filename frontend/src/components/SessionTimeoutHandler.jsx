import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../lib/LanguageContext";
import { signOut, renewToken } from "../lib/auth";

const SessionTimeoutHandler = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("userToken");
      const expiresAtStr = localStorage.getItem("userTokenExpiresAt");

      if (!token || !expiresAtStr) {
        // No active session, make sure modal is closed
        if (showModal) {
          setShowModal(false);
          clearInterval(countdownIntervalRef.current);
        }
        return;
      }

      const expiresAt = Number(expiresAtStr);
      const now = Date.now();
      const timeLeft = expiresAt - now;

      // If already expired, log out immediately
      if (timeLeft <= 0) {
        clearInterval(countdownIntervalRef.current);
        handleLogout();
        return;
      }

      // Show warning modal when 60 seconds (60000 ms) or less remain
      if (timeLeft <= 60000) {
        if (!showModal) {
          setShowModal(true);
          const initialSecs = Math.max(0, Math.floor(timeLeft / 1000));
          setSecondsRemaining(initialSecs);
        }
      } else {
        // If renewed or token changed and time left is > 60s, close modal
        if (showModal) {
          setShowModal(false);
        }
      }
    };

    // Run check every 1 second
    const checkInterval = setInterval(checkSession, 1000);

    // Initial check
    checkSession();

    // Listen to storage or auth events
    window.addEventListener("authChanged", checkSession);

    return () => {
      clearInterval(checkInterval);
      clearInterval(countdownIntervalRef.current);
      window.removeEventListener("authChanged", checkSession);
    };
  }, [showModal]);

  // Modal countdown tick
  useEffect(() => {
    if (showModal) {
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownIntervalRef.current);
    }

    return () => clearInterval(countdownIntervalRef.current);
  }, [showModal]);

  const handleLogout = async () => {
    setShowModal(false);
    await signOut();
    navigate("/Home");
  };

  const handleExtend = async () => {
    const success = await renewToken();
    if (success) {
      setShowModal(false);
    } else {
      // If token renewal failed (e.g. server down or already invalidated), logout
      handleLogout();
    }
  };

  return (
    <Modal
      show={showModal}
      onHide={handleLogout}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Body className="p-4 text-center" style={{ borderRadius: "1rem" }}>
        <div className="mb-3 text-warning" style={{ fontSize: "3rem" }}>
          ⏰
        </div>
        <h4 className="fw-bold mb-3">{t("sessionTimeoutTitle")}</h4>
        <p className="text-secondary mb-4" style={{ fontSize: "0.95rem" }}>
          {t("sessionTimeoutDesc").replace("{seconds}", String(secondsRemaining))}
        </p>

        {/* Dynamic Countdown Bar */}
        <div className="progress mb-4" style={{ height: "6px", borderRadius: "10px" }}>
          <div
            className={`progress-bar progress-bar-striped progress-bar-animated ${
              secondsRemaining <= 15 ? "bg-danger" : "bg-warning"
            }`}
            style={{
              width: `${(secondsRemaining / 60) * 100}%`,
              transition: "width 1s linear",
            }}
          ></div>
        </div>

        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-outline-secondary px-4 py-2 rounded-lg text-sm fw-semibold"
            onClick={handleLogout}
          >
            {t("sessionTimeoutExitBtn")}
          </button>
          <button
            className="btn btn-primary px-4 py-2 rounded-lg text-sm fw-semibold"
            onClick={handleExtend}
          >
            {t("sessionTimeoutStayBtn")}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SessionTimeoutHandler;
