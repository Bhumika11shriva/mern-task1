import React, { useState } from "react";

const API_URL = "http://localhost:5000/api/auth";

function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    const endpoint = isRegistering ? "register" : "login";

    fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status >= 400) {
          setMessage(data.message || "Something went wrong");
          return;
        }

        if (isRegistering) {
          setMessage("Account created! You can now log in.");
          setIsRegistering(false);
        } else {
          // Save token so the admin stays logged in
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.username);
          onLoginSuccess(data.token, data.username);
        }
      })
      .catch(() => setMessage("Could not connect to server"));
  };

  return (
    <div className="login-box">
      <h2>{isRegistering ? "Create Admin Account" : "Admin Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegistering ? "Register" : "Login"}</button>
      </form>

      {message && <p className="login-message">{message}</p>}

      <p className="toggle-link" onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering
          ? "Already have an account? Log in"
          : "First time? Create an admin account"}
      </p>
    </div>
  );
}

export default Login;
