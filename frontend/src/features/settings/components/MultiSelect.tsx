import { ChevronDown, X } from "lucide-react";
import { useState } from "react";



export const MultiSelect = ({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  description,
  placeholder = "Select options..."
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  icon?: React.ElementType;
  description?: string;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !value.includes(option)
  );

  const handleAdd = (option: string) => {
    onChange([...value, option]);
    setSearchTerm("");
  };

  const handleRemove = (option: string) => {
    onChange(value.filter(item => item !== option));
  };

  return (
    <div className="py-3">
      <div className="flex items-center gap-3 mb-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <div>
          <label className="font-medium text-gray-900 dark:text-white">{label}</label>
          {description && <div className="text-sm text-gray-500">{description}</div>}
        </div>
      </div>

      {/* Selected items */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
            >
              {item}
              <button
                onClick={() => handleRemove(item)}
                className="ml-2 hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
        >
          <span className="text-gray-500">
            {value.length > 0 ? `${value.length} selected` : placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700 text-sm"
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-2 text-sm text-gray-500 text-center">
                  {searchTerm ? 'No matching options' : 'All options selected'}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAdd(option)}
                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                  >
                    {option}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};