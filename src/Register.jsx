import { useState } from "react";
import { registerUser } from "../services/auth.service";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const submit = async (e) => {
    e.preventDefault();
    const data = await registerUser(form);

    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Registered successfully");
    } else {
      alert(data.msg);
    }
  };

  return (
    <form onSubmit={submit}>
      <input
        placeholder="Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button>Register</button>
    </form>
  );
}
