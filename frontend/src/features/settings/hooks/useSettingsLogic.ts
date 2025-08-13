import { useSettingsService } from "@/services/settingsApi";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { type Settings } from "@/types/settings";

export const useSettingsLogic = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
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
      } catch (err: unknown) {
        if (!mounted) return;
        console.error(err);
        const errorMessage = (err as {body?: {message?: string}})?.body?.message || "Failed to load settings";
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
  }, []);

  const handleToggle = useCallback((path: string, val: unknown) => {
    setSettings((s: Settings | null) => {
      if (!s) return s;
      const copy = JSON.parse(JSON.stringify(s));
      const parts = path.split(".");
      let current: Record<string, unknown> = copy;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]] as Record<string, unknown>;
      }
      
      current[parts[parts.length - 1]] = val;
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
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = (err as {body?: {message?: string}})?.body?.message || "Failed to save settings";
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
      setSettings((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          blocked: prev.blocked?.filter(id => id !== userId)
        };
      });
      toast.success(`User ${userId} unblocked successfully`);
    } catch (err: unknown) {
      const errorMessage = (err as {body?: {message?: string}})?.body?.message || "Failed to unblock";
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
    } catch (err: unknown) {
      const errorMessage = (err as {body?: {message?: string}})?.body?.message || "Failed to deactivate";
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
    } catch (err: unknown) {
      const errorMessage = (err as {body?: {message?: string}})?.body?.message || "Failed to delete";
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