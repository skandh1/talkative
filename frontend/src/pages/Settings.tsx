import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSettingsService } from "../services/settingsApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
  Check,
  X,
  Eye,
  EyeOff,
  Phone,
  Gift,
  UserCheck,
  MapPin,
  Calendar,
  Clock,
  ChevronDown,
  Plus
} from "lucide-react";

type SettingsState = any;

// Country and Language data
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria",
  "Cambodia", "Canada", "Chile", "China", "Colombia", "Costa Rica", "Croatia", "Czech Republic",
  "Denmark", "Dominican Republic", "Ecuador", "Egypt", "Estonia", "Finland", "France", "Georgia",
  "Germany", "Ghana", "Greece", "Guatemala", "Honduras", "Hong Kong", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kenya",
  "Kuwait", "Latvia", "Lebanon", "Lithuania", "Luxembourg", "Malaysia", "Mexico", "Morocco", "Netherlands",
  "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Saudi Arabia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea",
  "Spain", "Sri Lanka", "Sweden", "Switzerland", "Thailand", "Turkey", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Venezuela", "Vietnam"
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese",
  "Korean", "Arabic", "Hindi", "Bengali", "Telugu", "Tamil", "Gujarati", "Marathi", "Urdu", "Punjabi",
  "Malayalam", "Kannada", "Odia", "Assamese", "Nepali", "Dutch", "Swedish", "Norwegian", "Danish",
  "Finnish", "Polish", "Czech", "Hungarian", "Romanian", "Bulgarian", "Croatian", "Serbian", "Slovak",
  "Slovenian", "Estonian", "Latvian", "Lithuanian", "Greek", "Turkish", "Hebrew", "Persian", "Thai",
  "Vietnamese", "Indonesian", "Malay", "Filipino", "Ukrainian", "Belarusian", "Georgian", "Armenian",
  "Azerbaijani", "Kazakh", "Uzbek", "Tajik", "Kyrgyz", "Mongolian", "Tibetan", "Burmese", "Khmer",
  "Lao", "Sinhala", "Swahili", "Amharic", "Yoruba", "Igbo", "Hausa", "Zulu", "Afrikaans"
];

// Custom Hook for Settings Logic
const useSettingsLogic = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [blockedList, setBlockedList] = useState<string[]>([]);
  
  const { getSettings, updateSettings, deactivateAccount, deleteAccount, unblockUser } = useSettingsService();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const loadSettings = async () => {
      try {
        setLoading(true);
        const res = await getSettings();
        if (!mounted) return;
        
        setSettings(res.settings);
        if (res.settings?.blocked) setBlockedList(res.settings.blocked);
        // Remove the success toast on initial load to prevent spam
      } catch (err: any) {
        if (!mounted) return;
        console.error(err);
        const errorMessage = err?.body?.message || "Failed to load settings";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSettings();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array to run only once

  const handleToggle = useCallback((path: string, val: any) => {
    setSettings((s: any) => {
      const copy = JSON.parse(JSON.stringify(s));
      const parts = path.split(".");
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
      cur[parts[parts.length - 1]] = val;
      return copy;
    });
  }, []);

  const save = useCallback(async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      await updateSettings(settings);
      toast.success("Settings saved successfully!");
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.body?.message || "Failed to save settings";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [settings, updateSettings]);

  const handleUnblock = useCallback(async (userId: string) => {
    try {
      await unblockUser(userId);
      setBlockedList((prev) => prev.filter((id) => id !== userId));
      toast.success(`User ${userId} unblocked successfully`);
    } catch (err: any) {
      const errorMessage = err?.body?.message || "Failed to unblock";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [unblockUser]);

  const handleDeactivate = useCallback(async () => {
    if (!confirm("Are you sure you want to deactivate your account?")) return;
    try {
      await deactivateAccount();
      localStorage.removeItem("token");
      toast.success("Account deactivated successfully");
      navigate("/goodbye");
    } catch (err: any) {
      const errorMessage = err?.body?.message || "Failed to deactivate";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [deactivateAccount, navigate]);

  const handleDelete = useCallback(async () => {
    if (!confirm("Permanently delete your account? This is irreversible.")) return;
    try {
      await deleteAccount();
      localStorage.removeItem("token");
      toast.success("Account deleted successfully");
      navigate("/goodbye");
    } catch (err: any) {
      const errorMessage = err?.body?.message || "Failed to delete";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [deleteAccount, navigate]);

  const reset = useCallback(() => {
    if (confirm("Are you sure you want to reset all changes?")) {
      window.location.reload();
    }
  }, []);

  return {
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
  };
};

// Reusable Components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-3 p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
  </div>
);

const Toggle = ({ 
  label, 
  checked, 
  onChange, 
  icon: Icon,
  description 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  icon?: React.ElementType;
  description?: string;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
        {description && <div className="text-sm text-gray-500">{description}</div>}
      </div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const Select = ({ 
  label, 
  value, 
  onChange, 
  options,
  icon: Icon 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ElementType;
}) => (
  <div className="py-3">
    <div className="flex items-center gap-3 mb-2">
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      <label className="font-medium text-gray-900 dark:text-white">{label}</label>
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const MultiSelect = ({ 
  label, 
  value, 
  onChange, 
  options,
  icon: Icon,
  description,
  placeholder = "Select options..."
}: { 
  label: string; 
  value: string[]; 
  onChange: (value: string[]) => void;
  options: string[];
  icon?: React.ElementType;
  description?: string;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !value.includes(option)
  );

  const handleAdd = (option: string) => {
    onChange([...value, option]);
    setSearchTerm("");
  };

  const handleRemove = (option: string) => {
    onChange(value.filter(item => item !== option));
  };

  return (
    <div className="py-3">
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <div>
          <label className="font-medium text-gray-900 dark:text-white">{label}</label>
          {description && <div className="text-sm text-gray-500">{description}</div>}
        </div>
      </div>
      
      {/* Selected items */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
            >
              {item}
              <button
                onClick={() => handleRemove(item)}
                className="ml-2 hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
        >
          <span className="text-gray-500">
            {value.length > 0 ? `${value.length} selected` : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700 text-sm"
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-2 text-sm text-gray-500 text-center">
                  {searchTerm ? 'No matching options' : 'All options selected'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAdd(option)}
                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                  >
                    {option}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CountrySelect = ({ 
  label, 
  value, 
  onChange, 
  icon: Icon,
  description 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  icon?: React.ElementType;
  description?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (country: string) => {
    onChange(country);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="py-3">
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <div>
          <label className="font-medium text-gray-900 dark:text-white">{label}</label>
          {description && <div className="text-sm text-gray-500">{description}</div>}
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between text-left"
        >
          <span className={value ? "text-gray-900 dark:text-white" : "text-gray-500"}>
            {value || "Select a country..."}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search countries..."
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700 text-sm"
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="p-2 text-sm text-gray-500 text-center">No matching countries</div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => handleSelect(country)}
                    className={`w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                      value === country ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    {country}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BlockedUserItem = ({ userId, onUnblock }: { userId: string; onUnblock: (id: string) => void }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
        <Users className="w-4 h-4 text-gray-500" />
      </div>
      <span className="font-medium text-gray-900 dark:text-white">{userId}</span>
    </div>
    <button
      onClick={() => onUnblock(userId)}
      className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
    >
      Unblock
    </button>
  </div>
);

const ErrorBanner = ({ error, onDismiss }: { error: string; onDismiss: () => void }) => (
  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
    <div className="flex items-center gap-3">
      <X className="w-5 h-5 text-red-500" />
      <span className="text-red-700 dark:text-red-300">{error}</span>
    </div>
    <button onClick={onDismiss} className="text-red-500 hover:text-red-700">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

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