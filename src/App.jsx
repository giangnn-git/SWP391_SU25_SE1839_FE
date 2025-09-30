import LogoutButton from "./components/LogoutButton";

const App = () => {
  const email = localStorage.getItem("userEmail");

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome, {email}</p>
      <LogoutButton />
    </div>
  );
};

export default App;
