
import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Profile: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="bg-white p-6 rounded shadow">
        <p className="mb-2"><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
        <p className="mb-2"><strong>Role:</strong> {profile.role}</p>
        {profile.phone && <p className="mb-2"><strong>Phone:</strong> {profile.phone}</p>}
        {profile.address && <p className="mb-2"><strong>Address:</strong> {profile.address}</p>}
        {profile.city && <p className="mb-2"><strong>City:</strong> {profile.city}</p>}
        {profile.county && <p className="mb-2"><strong>County:</strong> {profile.county}</p>}
        {profile.country && <p className="mb-2"><strong>Country:</strong> {profile.country}</p>}
      </div>
    </div>
  );
};

export default Profile;
