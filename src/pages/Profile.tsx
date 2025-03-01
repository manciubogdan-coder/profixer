
import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Profile: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Se încarcă profilul...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700">No profile information available. Please update your profile.</p>
        </div>
      </div>
    );
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
