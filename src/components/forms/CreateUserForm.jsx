import { useState } from "react";
import { createUserApi } from "../../services/api.service";

const CreateUser = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!role) {
      setError("Please select a role!");
      setLoading(false);
      return;
    }

    try {
      const res = await createUserApi(name, password, role);
      if (res?.data) {
        setSuccess("User created successfully!");
        setName("");
        setPassword("");
        setRole("");
      } else {
        setError("Failed to create user!");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Request failed!");
      } else if (err.request) {
        setError("Cannot connect to server!");
      } else {
        setError("Unexpected error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create New User</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label>Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">-- Select a role --</option>
            <option value="SC Staff">SC Staff</option>
            <option value="Technician">Technician</option>
            <option value="EVM Staff">EVM Staff</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default CreateUser;
