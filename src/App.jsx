import CreateUser from "./components/CreateUserForm";
import LogoutButton from "./components/LogoutButton";

const App = () => {
  const email = localStorage.getItem("userEmail");

  return (
    <div>
      <h1>Home Page</h1>
      <div>
        <p>Welcome, {email}</p>
        <LogoutButton />
      </div>
      <CreateUser />
    </div>
  );
};

export default App;
