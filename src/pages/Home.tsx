
import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Platform</h1>
      {profile && (
        <div className="bg-white p-4 rounded shadow">
          <p>Hello, {profile.first_name} {profile.last_name}</p>
          <p>Role: {profile.role}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
