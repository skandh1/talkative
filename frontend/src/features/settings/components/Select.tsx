export const Select = ({
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