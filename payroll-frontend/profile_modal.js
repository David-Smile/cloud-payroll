// Profile Modal
const ProfileModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const currentProfile = isEditingProfile ? editedProfile : userProfile;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-xl">{currentProfile.avatar}</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{currentProfile.name}</h3>
              <p className="text-sm text-gray-500">{currentProfile.role}</p>
              <p className="text-sm text-gray-500">{currentProfile.department}</p>
            </div>
            {!isEditingProfile && (
              <button 
                onClick={handleEditProfile}
                className="ml-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={currentProfile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{currentProfile.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditingProfile ? (
                  <input
                    type="email"
                    value={currentProfile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{currentProfile.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditingProfile ? (
                  <input
                    type="tel"
                    value={currentProfile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{currentProfile.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={currentProfile.location}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{currentProfile.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Work Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={currentProfile.role}
                    onChange={(e) => handleProfileChange('role', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{currentProfile.role}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={currentProfile.department}
                    onChange={(e) => handleProfileChange('department', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{currentProfile.department}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                <p className="text-sm text-gray-900">{new Date(currentProfile.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Bio</h3>
            {isEditingProfile ? (
              <textarea
                value={currentProfile.bio}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{currentProfile.bio}</p>
            )}
          </div>

          {/* Preferences */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Push Notifications</span>
                <button 
                  onClick={() => handlePreferenceChange('notifications', !currentProfile.preferences.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    currentProfile.preferences.notifications ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    currentProfile.preferences.notifications ? 'translate-x-5' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Email Updates</span>
                <button 
                  onClick={() => handlePreferenceChange('emailUpdates', !currentProfile.preferences.emailUpdates)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    currentProfile.preferences.emailUpdates ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    currentProfile.preferences.emailUpdates ? 'translate-x-5' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Two-Factor Authentication</span>
                <button 
                  onClick={() => handlePreferenceChange('twoFactorAuth', !currentProfile.preferences.twoFactorAuth)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    currentProfile.preferences.twoFactorAuth ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    currentProfile.preferences.twoFactorAuth ? 'translate-x-5' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          {isEditingProfile ? (
            <>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 