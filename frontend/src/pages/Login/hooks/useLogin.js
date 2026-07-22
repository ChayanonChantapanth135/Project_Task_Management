import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { signIn } from "../../../lib/auth";

export const useLogin = (t) => {
  const [values, setValues] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!values.email || !values.password) {
      setError(t("fillAllFields"));
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/auth/login", values);
      const token = response.data.token;

      if (!token) {
        setError("Login failed: token not found");
        setLoading(false);
        return;
      }

      await signIn({
        token,
        expiresInSeconds: response.data.expiresInSeconds || 2400,
        user: response.data.user || {
          email: values.email,
          name: values.email.split("@")[0],
          role: response.data.role || "user",
        },
      });

      if (response.data.requirePasswordReset) {
        setMessage(t("forceResetPrompt"));
        setValues({ email: "", password: "" });
        setTimeout(() => {
          navigate("/reset-password-first-time");
        }, 1500);
        return;
      }

      setMessage(response.data.message || t("loginSuccess"));
      setValues({ email: "", password: "" });

      if (response.status === 201) {
        navigate("/Dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || t("loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    message,
    error,
    loading,
    showPassword,
    setShowPassword,
    handleChange,
    handleSubmit,
  };
};
