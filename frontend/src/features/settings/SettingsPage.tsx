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
  Clock,
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


// Country and Language data


const LANGUAGES = ISO6391.getAllNames()



// Main Settings Component
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
                value={settings?.privacy?.isProfilePublic ? "public" : "private"}
                onChange={(value) => handleToggle("privacy.isProfilePublic", value === "public")}
                options={[
                  { value: "public", label: "Public" },
                  { value: "private", label: "Private" }
                ]}
                icon={Eye}
              />

              <Toggle
                label="Show Online Status"
                checked={Boolean(settings?.privacy?.showOnlineStatus)}
                onChange={(checked) => handleToggle("privacy.showOnlineStatus", checked)}
                icon={Globe}
                description="Let others see when you're online"
              />

              <Toggle
                label="Show Last Active"
                checked={Boolean(settings?.privacy?.showLastActive)}
                onChange={(checked) => handleToggle("privacy.showLastActive", checked)}
                icon={Clock}
                description="Display when you were last active"
              />

              <Toggle
                label="Hide Age"
                checked={Boolean(settings?.privacy?.hideAge)}
                onChange={(checked) => handleToggle("privacy.hideAge", checked)}
                icon={Calendar}
                description="Keep your age private"
              />

              <Toggle
                label="Hide Location"
                checked={Boolean(settings?.privacy?.hideLocation)}
                onChange={(checked) => handleToggle("privacy.hideLocation", checked)}
                icon={MapPin}
                description="Don't show your location"
              />
            </div>
          </Card>

          {/* Communication Settings */}
          <Card>
            <CardHeader icon={MessageCircle} title="Communication" />
            <div className="p-6 space-y-1">
              <Toggle
                label="Allow Friend Requests"
                checked={Boolean(settings?.communication?.allowFriendRequests)}
                onChange={(checked) => handleToggle("communication.allowFriendRequests", checked)}
                icon={UserCheck}
                description="Let others send you friend requests"
              />

              <Toggle
                label="Allow Chat Requests"
                checked={Boolean(settings?.communication?.allowChatRequests)}
                onChange={(checked) => handleToggle("communication.allowChatRequests", checked)}
                icon={MessageCircle}
                description="Receive messages from new people"
              />

              <Toggle
                label="Allow Calls"
                checked={Boolean(settings?.communication?.allowCalls)}
                onChange={(checked) => handleToggle("communication.allowCalls", checked)}
                icon={Phone}
                description="Enable voice and video calls"
              />

              <Toggle
                label="Allow Gifts"
                checked={Boolean(settings?.communication?.allowGiftRequests)}
                onChange={(checked) => handleToggle("communication.allowGiftRequests", checked)}
                icon={Gift}
                description="Receive virtual gifts"
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
                label="Chat Notifications"
                checked={Boolean(settings?.account?.notifications?.chat)}
                onChange={(checked) => handleToggle("account.notifications.chat", checked)}
                icon={MessageCircle}
              />

              <Toggle
                label="Call Notifications"
                checked={Boolean(settings?.account?.notifications?.calls)}
                onChange={(checked) => handleToggle("account.notifications.calls", checked)}
                icon={Phone}
              />

              <Toggle
                label="Gift Notifications"
                checked={Boolean(settings?.account?.notifications?.gifts)}
                onChange={(checked) => handleToggle("account.notifications.gifts", checked)}
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