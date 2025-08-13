export const CardHeader = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-3 p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
  </div>
);