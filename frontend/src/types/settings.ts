export type Settings = {
  privacy: {
    profileType: "public" | "private";
    allowChatsFrom: "everyone" | "followers" | "friends" | "no_one";
    allowFriendRequestsFrom: "everyone" | "followers" | "no_one";
    allowFollowRequests: boolean;
    whoCanViewAge: "everyone" | "friends" | "followers" | "no_one";
    allowDirectCalls: boolean;
    whoCanSeeOnlineStatus: "everyone" | "friends" | "followers" | "no_one";
    whoCanSeeBio: "everyone" | "friends" | "followers" | "no_one";
  };
  notifications: {
    friendRequests: boolean;
    followRequests: boolean;
    chats: boolean;
    calls: boolean;
    callEnd: boolean;
    clubs: boolean;
    posts: {
      likes: boolean;
      comments: boolean;
    };
    gifts: boolean;
  };
  preferences: {
    languages: string[];
    country: string;
    matchDistance: number;
  };
  account: {
    theme: "light" | "dark" | "system";
  };
  blocked: string[];
};