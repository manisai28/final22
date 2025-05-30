import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit3,
  Save,
  X,
  Lock,
  Settings,
  Upload,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Globe,
} from "lucide-react";

const Profile = ({
  initialUser = {
    profilePicture: "",
    fullName: "manisai",
    username: "manisai28",
    email: "manisaibijjal28@gmail.com",
    phoneNumber: "+91 6301281813",
    location: "hyderabad",
    website: "https://johndoe.com",
    bio: "live as if you were to die tomorrow",
    joinDate: "2025-04-15",
  },
}) => {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...initialUser });
  const [saveStatus, setSaveStatus] = useState("");

  const handleInputChange = (field, value) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
    setSaveStatus("Profile updated successfully!");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imageUrl = ev.target.result;
      if (isEditing) {
        handleInputChange("profilePicture", imageUrl);
      } else {
        setUser((prev) => ({ ...prev, profilePicture: imageUrl }));
        setSaveStatus("Profile picture updated!");
        setTimeout(() => setSaveStatus(""), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const ProfilePictureSection = () => (
    <div className="flex flex-col items-center mb-8">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden shadow-lg">
          {(isEditing ? editedUser.profilePicture : user.profilePicture) ? (
            <img
              src={isEditing ? editedUser.profilePicture : user.profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-purple-700">
              <User className="w-16 h-16 text-white" />
            </div>
          )}
        </div>
        <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <Camera className="w-4 h-4" />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>
      <p className="text-sm text-gray-400 mt-2">
        Click camera icon to change photo
      </p>
    </div>
  );

  const FormField = ({
    label,
    value,
    field,
    type = "text",
    disabled = false,
    placeholder,
  }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      {isEditing && !disabled ? (
        type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder={placeholder}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={placeholder}
          />
        )
      ) : (
        <div
          className={`px-3 py-2 bg-gray-900 border border-gray-700 rounded-md ${
            disabled ? "text-gray-500" : "text-gray-100"
          }`}
        >
          {value || "Not provided"}
          {disabled && (
            <span className="text-xs text-gray-500 ml-2">
              (Contact support to change)
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      {saveStatus && (
        <div className="bg-green-600 text-white px-4 py-2 rounded mb-4">
          {saveStatus}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Profile Information</h2>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Edit3 className="w-5 h-5" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <ProfilePictureSection />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            label="Full Name"
            value={isEditing ? editedUser.fullName : user.fullName}
            field="fullName"
            placeholder="Enter your full name"
          />
          <FormField
            label="Username"
            value={isEditing ? editedUser.username : user.username}
            field="username"
            placeholder="Enter your username"
          />
          <FormField
            label="Email Address"
            value={user.email}
            field="email"
            type="email"
            disabled={true}
          />
          <FormField
            label="Phone Number"
            value={isEditing ? editedUser.phoneNumber : user.phoneNumber}
            field="phoneNumber"
            placeholder="Enter your phone number"
          />
          <FormField
            label="Location"
            value={isEditing ? editedUser.location : user.location}
            field="location"
            placeholder="Enter your location"
          />
          <FormField
            label="Website"
            value={isEditing ? editedUser.website : user.website}
            field="website"
            placeholder="Enter your website URL"
            type="url"
          />
          <FormField
            label="Bio"
            value={isEditing ? editedUser.bio : user.bio}
            field="bio"
            type="textarea"
            placeholder="Tell something about yourself"
          />
          <FormField
            label="Joined On"
            value={user.joinDate}
            field="joinDate"
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
