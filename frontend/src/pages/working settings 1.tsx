// src/pages/SettingsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useSettingsService } from "../services/settingsApi";
// import type { IUser } from "../types/user";
import { useNavigate } from "react-router-dom";

type SettingsState = any; // you can replace `any` with a typed Settings interface

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [blockedList, setBlockedList] = useState<string[]>([]);
  const {getSettings, updateSettings, deactivateAccount, deleteAccount, unblockUser} = useSettingsService()
  // const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getSettings()
      .then((res) => {
        if (!mounted) return;
        setSettings(res.settings);
        // blocked users (if sent from backend)
        if (res.settings?.blocked) setBlockedList(res.settings.blocked);
      })
      .catch((err) => {
        console.error(err);
        setError(err?.body?.message || "Failed to load settings");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  // Controlled updates: update local state only. Save explicitly or auto-save with debounce.
  const handleToggle = (path: string, val: any) => {
    setSettings((s: any) => {
      const copy = JSON.parse(JSON.stringify(s));
      const parts = path.split(".");
      let cur = copy;
      for (let i=0;i<parts.length-1;i++) cur = cur[parts[i]];
      cur[parts[parts.length-1]] = val;
      return copy;
    });
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      console.log(settings)
      await updateSettings(settings);
      // optionally show toast
    } catch (err: any) {
      console.error(err);
      setError(err?.body?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const onUnblock = async (userId: string) => {
    try {
      await unblockUser(userId);
      setBlockedList((prev) => prev.filter((id) => id !== userId));
    } catch (err: any) {
      setError(err?.body?.message || "Failed to unblock");
    }
  };

  const onDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate your account?")) return;
    try {
      await deactivateAccount();
      // log out and redirect
      localStorage.removeItem("token");
      navigate("/goodbye");
    } catch (err: any) {
      setError(err?.body?.message || "Failed to deactivate");
    }
  };

  const onDelete = async () => {
    if (!confirm("Permanently delete your account? This is irreversible.")) return;
    try {
      await deleteAccount();
      localStorage.removeItem("token");
      navigate("/goodbye");
    } catch (err: any) {
      setError(err?.body?.message || "Failed to delete");
    }
  };

  const languagesString = useMemo(() => {
    if (!settings) return "";
    const langs = settings.preferences?.languages || [];
    return Array.isArray(langs) ? langs.join(", ") : "";
  }, [settings]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{error}</div>}

      <section className="bg-white dark:bg-gray-800 rounded p-4 mb-4 shadow-sm">
        <h2 className="text-lg font-medium">Privacy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <label className="flex items-center justify-between">
            <span>Profile visibility</span>
            <select
              value={settings?.privacy?.isProfilePublic ? "public" : "private"}
              onChange={(e) => handleToggle("privacy.isProfilePublic", e.target.value === "public")}
              className="ml-3 p-2 rounded border"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>

          <label className="flex items-center justify-between">
            <span>Show online status</span>
            <input
              type="checkbox"
              checked={Boolean(settings?.privacy?.showOnlineStatus)}
              onChange={(e) => handleToggle("privacy.showOnlineStatus", e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Show last active</span>
            <input
              type="checkbox"
              checked={Boolean(settings?.privacy?.showLastActive)}
              onChange={(e) => handleToggle("privacy.showLastActive", e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Hide age</span>
            <input
              type="checkbox"
              checked={Boolean(settings?.privacy?.hideAge)}
              onChange={(e) => handleToggle("privacy.hideAge", e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Hide location</span>
            <input
              type="checkbox"
              checked={Boolean(settings?.privacy?.hideLocation)}
              onChange={(e) => handleToggle("privacy.hideLocation", e.target.checked)}
            />
          </label>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded p-4 mb-4 shadow-sm">
        <h2 className="text-lg font-medium">Communication</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <label className="flex items-center justify-between">
            <span>Allow friend requests</span>
            <input
              type="checkbox"
              checked={Boolean(settings?.communication?.allowFriendRequests)}
              onChange={(e) => handleToggle("communication.allowFriendRequests", e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Allow chat requests</span>
            <input
              type="checkbox"
              checked={Boolean(settings?.communication?.allowChatRequests)}
              onChange={(e) => handleToggle("communication.allowChatRequests", e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Allow calls</span>
            <input
              type="checkbox"
              checked={Boolean(settings?.communication?.allowCalls)}
              onChange={(e) => handleToggle("communication.allowCalls", e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Allow gifts</span>
            <input
              type="checkbox"
              checked={Boolean(settings?.communication?.allowGiftRequests)}
              onChange={(e) => handleToggle("communication.allowGiftRequests", e.target.checked)}
            />
          </label>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded p-4 mb-4 shadow-sm">
        <h2 className="text-lg font-medium">Preferences</h2>
        <div className="space-y-3 mt-3">
          <label className="block">
            <div className="text-sm">Languages (comma separated)</div>
            <input
              type="text"
              value={languagesString}
              onChange={(e) => {
                const arr = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                handleToggle("preferences.languages", arr);
              }}
              className="w-full p-2 border rounded mt-1"
              placeholder="e.g., English, Hindi, Spanish"
            />
          </label>

          <label className="block">
            <div className="text-sm">Country</div>
            <input
              type="text"
              value={settings?.preferences?.country || ""}
              onChange={(e) => handleToggle("preferences.country", e.target.value)}
              className="w-full p-2 border rounded mt-1"
            />
          </label>

          {/* <label className="block">
            <div className="text-sm">Theme</div>
            <select
              value={settings?.account?.theme || "system"}
              onChange={(e) => {
                handleToggle("account.theme", e.target.value);
                setTheme(e.target.value as any);
              }}
              className="w-full p-2 border rounded mt-1"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label> */}

          <div>
            <div className="text-sm mb-1">Notifications</div>
            <label className="flex items-center justify-between">
              Chat notifications
              <input type="checkbox" checked={Boolean(settings?.account?.notifications?.chat)} onChange={(e) => handleToggle("account.notifications.chat", e.target.checked)} />
            </label>
            <label className="flex items-center justify-between">
              Call notifications
              <input type="checkbox" checked={Boolean(settings?.account?.notifications?.calls)} onChange={(e) => handleToggle("account.notifications.calls", e.target.checked)} />
            </label>
            <label className="flex items-center justify-between">
              Gift notifications
              <input type="checkbox" checked={Boolean(settings?.account?.notifications?.gifts)} onChange={(e) => handleToggle("account.notifications.gifts", e.target.checked)} />
            </label>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded p-4 mb-4 shadow-sm">
        <h2 className="text-lg font-medium">Blocked users</h2>
        <div className="mt-3 space-y-2">
          {blockedList.length === 0 && <div className="text-sm text-gray-500">No blocked users</div>}
          {blockedList.map((id) => (
            <div key={id} className="flex items-center justify-between p-2 border rounded">
              <div className="text-sm">{id}</div>
              <button className="ml-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => onUnblock(id)}>Unblock</button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>

        <button onClick={() => { setSettings(null); /* reload the page or re-fetch */ window.location.reload(); }} className="px-4 py-2 border rounded">
          Reset
        </button>
      </div>

      <section className="mt-6 bg-red-50 rounded p-4">
        <h3 className="font-medium text-red-700">Account</h3>
        <div className="mt-2 space-x-2">
          <button onClick={onDeactivate} className="px-3 py-2 bg-yellow-500 rounded">Deactivate</button>
          <button onClick={onDelete} className="px-3 py-2 bg-red-600 text-white rounded">Delete account</button>
        </div>
      </section>
    </div>
  );
}
