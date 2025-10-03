// src/components/SocialPage.tsx
import { useState, useContext, createContext } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type UserBasicInfo,
  type PopulatedFriendRequest,
  type PopulatedFollowRequest,
  type SocialDataResponse,
} from "../../types/social";
import { useApi } from "@/hooks/useApi"; // ✅ your custom hook
import { Link } from "react-router-dom";

// --- Mock AuthContext for Standalone Demo ---
const mockDbUser = { _id: "user123", username: "current_user" };
const mockGetToken = async () => "mock-jwt-token";

const AuthContext = createContext({
  dbUser: mockDbUser,
  getToken: mockGetToken,
});
// --- End of Mock AuthContext ---

// --- Sub-components ---
const UserCard = ({ user }: { user: UserBasicInfo }) => (
  <div className="flex items-center p-3 bg-gray-800 rounded-lg mb-2 shadow-md">
    <img
      src={
        user.profilePic ||
        "https://placehold.co/40x40/2d3748/e2e8f0?text=U"
      }
      alt={user.username}
      className="w-10 h-10 rounded-full mr-4"
    />
    <span className="font-medium text-white">{user.username}</span>
    {user.isOnline && (
      <div className="w-3 h-3 bg-green-500 rounded-full ml-auto border-2 border-gray-800"></div>
    )}
  </div>
);

const RequestCard = ({
  request,
  onAccept,
  onReject,
  type,
}: {
  request: PopulatedFriendRequest | PopulatedFollowRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  type: "friend" | "follow";
}) => {
  const userInfo = "sender" in request ? request.sender : request.requester;
  return (
    <div className="flex items-center p-3 bg-gray-800 rounded-lg mb-2 shadow-md">
      <img
        src={
          userInfo.profilePic ||
          "https://placehold.co/40x40/2d3748/e2e8f0?text=U"
        }
        alt={userInfo.username}
        className="w-10 h-10 rounded-full mr-4"
      />
      <div className="flex-grow">
        <p className="font-medium text-white">{userInfo.username}</p>
        <p className="text-sm text-gray-400">
          {type === "friend"
            ? "Wants to be your friend"
            : "Wants to follow you"}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(request._id)}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-semibold"
        >
          Accept
        </button>
        <button
          onClick={() => onReject(request._id)}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-semibold"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---
type Tab = "friends" | "followers" | "following" | "requests";

const SocialPage = () => {
  const { dbUser } = useContext(AuthContext);
  const { request } = useApi();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>("friends");

  // ✅ Fetch social data
  const { data, isLoading, error } = useQuery<SocialDataResponse>({
    queryKey: ["socialData", dbUser?._id],
    queryFn: () => request("/social"),
    enabled: !!dbUser,
  });

  // ✅ Mutations
  const acceptFriend = useMutation({
    mutationFn: (id: string) =>
      request(`/users/requests/friend/${id}/accept`, { method: "PUT" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["socialData"] }),
  });

  const rejectFriend = useMutation({
    mutationFn: (id: string) =>
      request(`/users/requests/friend/${id}/reject`, { method: "PUT" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["socialData"] }),
  });

  const acceptFollow = useMutation({
    mutationFn: (id: string) =>
      request(`/users/requests/friend/${id}/accept`, { method: "PUT" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["socialData"] }),
  });

  const rejectFollow = useMutation({
    mutationFn: (id: string) =>
      request(`/users/requests/friend/${id}/reject`, { method: "PUT" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["socialData"] }),
  });

  const renderContent = () => {
    if (isLoading)
      return <div className="text-center p-10 text-white">Loading...</div>;
    if (error)
      return (
        <div className="text-center p-10 text-red-500">
          Error: {(error as Error).message}
        </div>
      );

    if (!data) return null;

    const { friends, followers, following, friendRequests, followRequests } =
      data;

    switch (activeTab) {
      case "friends":
        return friends.length ? (
          friends.map((user) => <Link to={"/profile/" + user._id}>
            <UserCard key={user._id} user={user} />
          </Link>)
        ) : (
          <p className="text-gray-400">No friends yet.</p>
        );
      case "followers":
        return followers.length ? (
          followers.map((user) => <Link to={"/profile/" + user._id}>
            <UserCard key={user._id} user={user} />
          </Link>)
        ) : (
          <p className="text-gray-400">No followers yet.</p>
        );
      case "following":
        return following.length ? (
          following.map((user) => <Link to={"/profile/" + user._id}>
            <UserCard key={user._id} user={user} />
          </Link>)
        ) : (
          <p className="text-gray-400">You are not following anyone yet.</p>
        );
      case "requests":
        return (
          <>
            <h3 className="text-lg font-semibold mb-2 text-gray-300">
              Friend Requests ({friendRequests.length})
            </h3>
            {friendRequests.length ? (
              friendRequests.map((req) => (
                <RequestCard
                  key={req._id}
                  request={req}
                  onAccept={(id) => acceptFriend.mutate(id)}
                  onReject={(id) => rejectFriend.mutate(id)}
                  type="friend"
                />
              ))
            ) : (
              <p className="text-gray-400 mb-4">No new friend requests.</p>
            )}

            <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-300">
              Follow Requests ({followRequests.length})
            </h3>
            {followRequests.length ? (
              followRequests.map((req) => (
                <RequestCard
                  key={req._id}
                  request={req}
                  onAccept={(id) => acceptFollow.mutate(id)}
                  onReject={(id) => rejectFollow.mutate(id)}
                  type="follow"
                />
              ))
            ) : (
              <p className="text-gray-400">No new follow requests.</p>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const totalRequests =
    (data?.friendRequests.length || 0) + (data?.followRequests.length || 0);

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Connections</h1>
        <div className="flex border-b border-gray-700 mb-6">
          {(["friends", "followers", "following", "requests"] as Tab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize py-2 px-4 text-sm sm:text-base font-medium relative transition-colors duration-200 ${activeTab === tab
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white"
                  }`}
              >
                {tab}
                {tab === "requests" && totalRequests > 0 && (
                  <span className="absolute top-1 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                    {totalRequests}
                  </span>
                )}
              </button>
            )
          )}
        </div>
        <div>{renderContent()}</div>
      </div>
    </div>
  );
};

export default SocialPage;
