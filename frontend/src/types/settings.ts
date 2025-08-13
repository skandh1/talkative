export type Settings = {
  privacy?: {
    isProfilePublic?: boolean;
    showOnlineStatus?: boolean;
    showLastActive?: boolean;
    hideAge?: boolean;
    hideLocation?: boolean;
  };
  communication?: {
    allowFriendRequests?: boolean;
    allowChatRequests?: boolean;
    allowCalls?: boolean;
    allowGiftRequests?: boolean;
  };
  preferences?: {
    languages?: string[];
    country?: string | null;
    matchDistance?: number;
  };
  account?: {
    theme?: "light" | "dark" | "system";
    notifications?: {
      chat?: boolean;
      calls?: boolean;
      gifts?: boolean;
    };
  };
  blocked?: string[];
};