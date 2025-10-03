import { useApi } from "@/hooks/useApi";

export function useSettingsService() {
  const { request } = useApi();

  const getSettings = () =>
    request<{ settings: any; userId: string }>("/users/me/settings");

  const updateSettings = (payload: Partial<any>) =>
    request("/users/me/settings", { method: "PATCH", body: JSON.stringify(payload) });

  const deactivateAccount = () =>
    request("/users/me/deactivate", { method: "POST" });

  const deleteAccount = () =>
    request("/users/me/delete", { method: "DELETE" });

  const unblockUser = (userId: string) =>
    request(`/users/me/unblock/${userId}`, { method: "POST" });

  return { getSettings, updateSettings, deactivateAccount, deleteAccount, unblockUser };
}
