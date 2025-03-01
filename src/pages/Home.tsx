
import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Platform</h1>
      {profile ? (
        <div className="bg-white p-4 rounded shadow">
          <p>Hello, {profile.first_name} {profile.last_name}</p>
          <p>Role: {profile.role}</p>
        </div>
      ) : (
        <p>No profile information available. Please update your profile.</p>
      )}
    </div>
  );
};

export default Home;
