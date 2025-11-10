import React from 'react';

interface ColumnManagerProps {
  allColumns: string[];
  visibleColumns: Set<string>;
  onToggleColumn: (column: string) => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({ allColumns, visibleColumns, onToggleColumn }) => {
  return (
    <div className="absolute right-0 mt-2 w-64 bg-gray-700 rounded-md shadow-lg z-20 border border-gray-600 max-h-80 overflow-y-auto">
      <div className="p-2">
        <h3 className="text-sm font-semibold text-gray-300 px-2 pt-1 pb-2">Visible Columns</h3>
        <ul>
          {allColumns.map(column => (
            <li key={column}>
              <label className="flex items-center w-full px-2 py-1.5 text-sm text-gray-200 hover:bg-gray-600 rounded-md cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-teal-500 bg-gray-800 border-gray-500 rounded focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent focus:ring-teal-500"
                  checked={visibleColumns.has(column)}
                  onChange={() => onToggleColumn(column)}
                  disabled={visibleColumns.size === 1 && visibleColumns.has(column)}
                />
                <span className="ml-3 truncate" title={column}>{column}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
