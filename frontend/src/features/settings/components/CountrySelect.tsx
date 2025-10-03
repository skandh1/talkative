import { useState } from "react";

import { countries } from 'countries-list';
import { ChevronDown } from "lucide-react";

const COUNTRIES = Object.values(countries).map(country => country.name);

export const CountrySelect = ({
  label,
  value,
  onChange,
  icon: Icon,
  description
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ElementType;
  description?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (country: string) => {
    onChange(country);
    setIsOpen(false);
    setSearchTerm("");
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

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between text-left"
        >
          <span className={value ? "text-gray-900 dark:text-white" : "text-gray-500"}>
            {value || "Select a country..."}
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
                placeholder="Search countries..."
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-700 text-sm"
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="p-2 text-sm text-gray-500 text-center">No matching countries</div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => handleSelect(country)}
                    className={`w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${value === country ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                      }`}
                  >
                    {country}
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