import type { User } from "@/types/user";
import StatCard from "./StatCard";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UserInfoDisplay = ({ displayUser, isOwner, status }: { displayUser: User, isOwner: string | boolean | undefined, status: any }) => (
  <div className="space-y-8">
    <div className="flex items-start md:items-center space-x-6 md:space-x-8 pb-6 border-b border-gray-200 dark:border-gray-700">
      <div className="relative">
        <img
          src={displayUser.profilePic || 'https://www.gravatar.com/avatar/?d=mp'}
          alt="Profile"
          className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-indigo-500/50"
        />
        <div
          className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800
            ${status?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
          title={status?.isOnline ? "Online" : "Offline"}
        />
      </div>
      <div className="flex-1">
        <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {displayUser.displayName}
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
          @{displayUser.username}
        </p>
        {displayUser.profileStatus && (
          <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase
            ${displayUser.profileStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
              displayUser.profileStatus === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`
          }>
            {displayUser.profileStatus}
          </span>
        )}
        {isOwner && (
          <p className="text-md text-gray-500 dark:text-gray-400 mt-4">{displayUser.email}</p>
        )}
        <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
          <strong>About:</strong> {displayUser.about || 'Not set'}
        </p>
      </div>
    </div>
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">General Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <p className="text-lg"><strong>Age:</strong> {displayUser.age ?? 'Not set'}</p>
        <p className="text-lg"><strong>Gender:</strong> {displayUser.gender ?? 'Not set'}</p>
        {isOwner && (
          <p className="text-sm col-span-1 sm:col-span-2 break-all text-gray-500 dark:text-gray-400">
            <strong>User ID:</strong> {displayUser._id}
          </p>
        )}
      </div>
    </div>
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isOwner && <StatCard label="Coins" value={displayUser.coins ?? 0} />}
        <StatCard label="Rating" value={displayUser.rating?.average ?? 0} />
        <StatCard label="Calls" value={displayUser.callCount ?? 0} />
        {isOwner && <StatCard label="friends" value={displayUser.friends?.length ?? 0} />}
      </div>
    </div>
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Interests</h2>
      <div className="flex flex-wrap gap-2 mt-2">
        {displayUser.topics?.length ? (
          displayUser.topics.map((topic) => (
            <span
              key={topic}
              className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm font-medium px-3 py-1 rounded-full shadow-sm"
            >
              {topic}
            </span>
          ))
        ) : (
          <span className="text-gray-500 dark:text-gray-400">No topics added.</span>
        )}
      </div>
    </div>
  </div>
);

export default UserInfoDisplay