import React from 'react';
import { TableData } from '../types';

interface DataTableProps {
  data: TableData[] | null;
  onSplitColumn: (column: string) => void;
  onRegroupColumn: (column: string) => void;
}

const renderCellContent = (content: any): string => {
  if (content === undefined) {
    return ''; // Use an empty string for undefined to signify absence of value
  }
  if (content === null) {
    return 'null';
  }
  if (typeof content === 'object') {
    return JSON.stringify(content);
  }
  return String(content);
}

export const DataTable: React.FC<DataTableProps> = ({ data, onSplitColumn, onRegroupColumn }) => {
  if (!data) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-800 rounded-lg p-4 shadow-lg">
        <p className="text-gray-500">Paste valid JSON and click "Visualize" to see your data table.</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
       <div className="flex-grow flex items-center justify-center bg-gray-800 rounded-lg p-4 shadow-lg">
        <p className="text-gray-500">JSON array is empty. Nothing to display.</p>
      </div>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex-grow overflow-auto shadow-lg">
       <h2 className="text-xl font-semibold mb-3 text-teal-500">Data View</h2>
      <div className="w-full h-full overflow-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50 sticky top-0">
            <tr>
              {headers.map((header) => {
                const isSplittable = !header.includes('.') && data.some(row => 
                  typeof row[header] === 'object' && row[header] !== null && !Array.isArray(row[header])
                );

                const isRegroupable = header.includes('.');
                const parentKey = isRegroupable ? header.split('.')[0] : '';

                return (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate" title={header}>{header}</span>
                      {isSplittable && (
                        <button
                          onClick={() => onSplitColumn(header)}
                          className="px-2 py-0.5 text-xs font-semibold bg-teal-600 text-white rounded-md hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-teal-500 transition-colors duration-200 whitespace-nowrap"
                          title={`Split "${header}" into multiple columns`}
                        >
                          Split
                        </button>
                      )}
                      {isRegroupable && (
                        <button
                          onClick={() => onRegroupColumn(header)}
                          className="px-2 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-blue-500 transition-colors duration-200 whitespace-nowrap"
                          title={`Regroup columns starting with "${parentKey}."`}
                        >
                          Regroup
                        </button>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-700/50 transition-colors duration-150">
                {headers.map((header) => (
                  <td
                    key={`${rowIndex}-${header}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-200"
                  >
                    <span className="max-w-xs block truncate" title={renderCellContent(row[header])}>
                      {renderCellContent(row[header])}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};