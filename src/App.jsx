import LogoutButton from "./components/LogoutButton";
import UserForm from "./components/user/user.form";
import './assets/css/App.css';


const App = () => {
  const email = localStorage.getItem("userEmail");

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="app-header-content">
          <h1>Home Page</h1>
          <p>Welcome, <strong>{email}</strong></p>
        </div>
        <div className="logout-container">
          <LogoutButton />
        </div>
      </div>

      <div className="app-main">
        <div className="form-section">
          <h2 className="form-section-title">Create Warranty Claim Form</h2>
          <UserForm />
        </div>
      </div>
    </div>
  );
};

export default App;