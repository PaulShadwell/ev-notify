{/* Previous imports remain the same */}

export function ProfileEdit({ session }: ProfileEditProps) {
  {/* Previous state declarations remain the same */}

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Information</h2>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 sm:p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm sm:text-base">{success}</p>
            </div>
          )}

          <div className="flex justify-center mb-6">
            <AvatarUpload
              userId={session.user.id}
              currentAvatarUrl={formData.avatar_url}
              onAvatarChange={handleAvatarChange}
            />
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
              <FormField
                label="Last Name"
                value={formData.last_name || ''}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>

            {/* Other form fields remain the same */}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}