import { Users } from "lucide-react";

export const BlockedUserItem = ({ userId, onUnblock }: { userId: string; onUnblock: (id: string) => void }) => (
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