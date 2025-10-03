export const Toggle = ({
  label,
  checked,
  onChange,
  icon: Icon,
  description
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ElementType;
  description?: string;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
        {description && <div className="text-sm text-gray-500">{description}</div>}
      </div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
          }`}
      />
    </button>
  </div>
);