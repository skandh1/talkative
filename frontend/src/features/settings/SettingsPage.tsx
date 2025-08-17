import { useMemo , useCallback } from "react";
import {
  Shield,
  MessageCircle,
  Globe,
  Bell,
  Users,
  Trash2,
  Power,
  Save,
  RefreshCw,
  Eye,
  Phone,
  Gift,
  UserCheck,
  MapPin,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Megaphone
} from "lucide-react";
import ISO6391 from 'iso-639-1';

import { useSettingsLogic } from "@/features/settings/hooks/useSettingsLogic";
import { Card } from "./components/Card";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ErrorBanner } from "./components/ErrorBanner";
import { CardHeader } from "./components/CardHeader";
import { Select } from "./components/Select";
import { Toggle } from "./components/Toggle";
import { MultiSelect } from "./components/MultiSelect";
import { CountrySelect } from "./components/CountrySelect";
import { BlockedUserItem } from "./components/BlockedUserItem";

const LANGUAGES = ISO6391.getAllNames();

export default function SettingsPage() {
  const {
    loading,
    saving,
    error,
    settings,
    blockedList,
    handleToggle,
    save,
    handleUnblock,
    handleDeactivate,
    handleDelete,
    reset,
    setError
  } = useSettingsLogic();

  const languagesArray = useMemo(() => {
    if (!settings) return [];
    const langs = settings.preferences?.languages || [];
    return Array.isArray(langs) ? langs : [];
  }, [settings]);

  const handleLanguageChange = useCallback((languages: string[]) => {
    handleToggle("preferences.languages", languages);
  }, [handleToggle]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account preferences and privacy settings
          </p>
        </div>

        {error && <ErrorBanner error={error} onDismiss={() => setError(null)} />}

        <div className="space-y-6">
          {/* Privacy Settings */}
          <Card>
            <CardHeader icon={Shield} title="Privacy" />
            <div className="p-6 space-y-1">
              <Select
                label="Profile Visibility"
                value={settings?.privacy?.profileType || "public"}
                onChange={(value) => handleToggle("privacy.profileType", value)}
                options={[
                  { value: "public", label: "Public" },
                  { value: "private", label: "Private" }
                ]}
                icon={Eye}
              />

              <Select
                label="Who Can Message You"
                value={settings?.privacy?.allowChatsFrom || "everyone"}
                onChange={(value) => handleToggle("privacy.allowChatsFrom", value)}
                options={[
                  { value: "everyone", label: "Everyone" },
                  { value: "followers", label: "Followers" },
                  { value: "friends", label: "Friends" },
                  { value: "no_one", label: "No One" }
                ]}
                icon={MessageCircle}
              />

              <Select
                label="Who Can Send Friend Requests"
                value={settings?.privacy?.allowFriendRequestsFrom || "everyone"}
                onChange={(value) => handleToggle("privacy.allowFriendRequestsFrom", value)}
                options={[
                  { value: "everyone", label: "Everyone" },
                  { value: "followers", label: "Followers" },
                  { value: "no_one", label: "No One" }
                ]}
                icon={UserCheck}
              />

              <Toggle
                label="Allow Follow Requests"
                checked={Boolean(settings?.privacy?.allowFollowRequests)}
                onChange={(checked) => handleToggle("privacy.allowFollowRequests", checked)}
                icon={Users}
              />

              <Select
                label="Who Can See Your Age"
                value={settings?.privacy?.whoCanViewAge || "everyone"}
                onChange={(value) => handleToggle("privacy.whoCanViewAge", value)}
                options={[
                  { value: "everyone", label: "Everyone" },
                  { value: "followers", label: "Followers" },
                  { value: "friends", label: "Friends" },
                  { value: "no_one", label: "No One" }
                ]}
                icon={Calendar}
              />

              <Toggle
                label="Allow Direct Calls"
                checked={Boolean(settings?.privacy?.allowDirectCalls)}
                onChange={(checked) => handleToggle("privacy.allowDirectCalls", checked)}
                icon={Phone}
              />

              <Select
                label="Who Can See Online Status"
                value={settings?.privacy?.whoCanSeeOnlineStatus || "everyone"}
                onChange={(value) => handleToggle("privacy.whoCanSeeOnlineStatus", value)}
                options={[
                  { value: "everyone", label: "Everyone" },
                  { value: "followers", label: "Followers" },
                  { value: "friends", label: "Friends" },
                  { value: "no_one", label: "No One" }
                ]}
                icon={Globe}
              />

              <Select
                label="Who Can See Your Bio"
                value={settings?.privacy?.whoCanSeeBio || "everyone"}
                onChange={(value) => handleToggle("privacy.whoCanSeeBio", value)}
                options={[
                  { value: "everyone", label: "Everyone" },
                  { value: "followers", label: "Followers" },
                  { value: "friends", label: "Friends" },
                  { value: "no_one", label: "No One" }
                ]}
                icon={Shield}
              />
            </div>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader icon={Globe} title="Preferences" />
            <div className="p-6 space-y-1">
              <MultiSelect
                label="Languages"
                value={languagesArray}
                onChange={handleLanguageChange}
                options={LANGUAGES}
                icon={Globe}
                description="Select the languages you speak"
                placeholder="Select languages..."
              />

              <CountrySelect
                label="Country"
                value={settings?.preferences?.country || ""}
                onChange={(value) => handleToggle("preferences.country", value)}
                icon={MapPin}
                description="Select your country"
              />
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader icon={Bell} title="Notifications" />
            <div className="p-6 space-y-1">
              <Toggle
                label="Friend Request Notifications"
                checked={Boolean(settings?.notifications?.friendRequests)}
                onChange={(checked) => handleToggle("notifications.friendRequests", checked)}
                icon={UserCheck}
              />

              <Toggle
                label="Follow Request Notifications"
                checked={Boolean(settings?.notifications?.followRequests)}
                onChange={(checked) => handleToggle("notifications.followRequests", checked)}
                icon={Users}
              />

              <Toggle
                label="Chat Notifications"
                checked={Boolean(settings?.notifications?.chats)}
                onChange={(checked) => handleToggle("notifications.chats", checked)}
                icon={MessageCircle}
              />

              <Toggle
                label="Call Notifications"
                checked={Boolean(settings?.notifications?.calls)}
                onChange={(checked) => handleToggle("notifications.calls", checked)}
                icon={Phone}
              />

              <Toggle
                label="Call End Notifications"
                checked={Boolean(settings?.notifications?.callEnd)}
                onChange={(checked) => handleToggle("notifications.callEnd", checked)}
                icon={Phone}
              />

              <Toggle
                label="Club Notifications"
                checked={Boolean(settings?.notifications?.clubs)}
                onChange={(checked) => handleToggle("notifications.clubs", checked)}
                icon={Megaphone}
              />

              <Toggle
                label="Post Like Notifications"
                checked={Boolean(settings?.notifications?.posts?.likes)}
                onChange={(checked) => handleToggle("notifications.posts.likes", checked)}
                icon={ThumbsUp}
              />

              <Toggle
                label="Post Comment Notifications"
                checked={Boolean(settings?.notifications?.posts?.comments)}
                onChange={(checked) => handleToggle("notifications.posts.comments", checked)}
                icon={MessageSquare}
              />

              <Toggle
                label="Gift Notifications"
                checked={Boolean(settings?.notifications?.gifts)}
                onChange={(checked) => handleToggle("notifications.gifts", checked)}
                icon={Gift}
              />
            </div>
          </Card>

          {/* Blocked Users */}
          <Card>
            <CardHeader icon={Users} title="Blocked Users" />
            <div className="p-6">
              {blockedList.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No blocked users</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedList.map((id) => (
                    <BlockedUserItem key={id} userId={id} onUnblock={handleUnblock} />
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors flex-1 sm:flex-none"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">Danger Zone</h3>
                  <p className="text-sm text-red-600 dark:text-red-400">Irreversible actions</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDeactivate}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors flex-1 sm:flex-none"
                >
                  <Power className="w-4 h-4" />
                  Deactivate Account
                </button>

                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex-1 sm:flex-none"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
