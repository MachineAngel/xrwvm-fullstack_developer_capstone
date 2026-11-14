import { useState } from "react";
import Header from "../Header/Header";
import { csrfToken } from "../../csrf";
import "./Register.css";

const fields = [
  ["username", "Username", "text"], ["first_name", "First Name", "text"],
  ["last_name", "Last Name", "text"], ["email", "Email", "email"],
  ["password", "Password", "password"],
];

export default function Register() {
  const [error, setError] = useState("");
  async function register(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/djangoapp/register", {
        method: "POST",
        headers: {"Content-Type": "application/json", "X-CSRFToken": csrfToken()},
        body: JSON.stringify(fields),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(Object.values(result.errors || {}).flat().join(" ") || "Registration failed.");
        return;
      }
      sessionStorage.setItem("username", result.userName);
      window.location.assign("/");
    } catch {
      setError("Unable to reach the server.");
    }
  }
  return <>
    <Header />
    <form className="register_container p-4" onSubmit={register}>
      <h1>Sign up</h1>
      {fields.map(([name, label, type]) => <label key={name} className="p-2">
        {label}<input className="form-control" required name={name} type={type} />
      </label>)}
      <button className="btn btn-light" type="submit">Register</button>
      {error && <p role="alert">{error}</p>}
    </form>
  </>;
}
