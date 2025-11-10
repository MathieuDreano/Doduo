import React, { useState, useRef, useEffect } from 'react';
import { TableData } from '../types';
import { ColumnManager } from './ColumnManager';

interface DataTableProps {
  data: TableData[] | null;
  onSplitColumn: (column: string) => void;
  onRegroupColumn: (column: string) => void;
  visibleColumns: Set<string>;
  onToggleColumn: (column: string) => void;
}

const renderCellContent = (content: any): React.ReactNode => {
  if (content === undefined) {
    return <div className="px-4 py-3">&nbsp;</div>;
  }
  if (content === null) {
    return <div className="px-4 py-3"><span className="text-gray-500 italic">null</span></div>;
  }

  if (Array.isArray(content)) {
    if (content.length === 0) {
      return <div className="px-4 py-3"><span className="text-gray-500 italic">[ ]</span></div>;
    }
    return (
      <table className="w-full">
        <tbody className="divide-y divide-gray-700">
          {content.map((item, index) => (
            <tr key={index}>
              <td className="p-0 align-top">
                {renderCellContent(item)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (typeof content === 'object') {
    return (
      <div className="px-4 py-3">
        <pre className="text-xs bg-gray-900/50 p-2 rounded-md whitespace-pre-wrap font-mono">
          <code>{JSON.stringify(content, null, 2)}</code>
        </pre>
      </div>
    );
  }
  return <div className="px-4 py-3">{String(content)}</div>;
};

export const DataTable: React.FC<DataTableProps> = ({ data, onSplitColumn, onRegroupColumn, visibleColumns, onToggleColumn }) => {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const managerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (managerRef.current && !managerRef.current.contains(event.target as Node)) {
        setIsManagerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const allHeaders = Object.keys(data[0] || {});
  const visibleHeaders = allHeaders.filter(header => visibleColumns.has(header));

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex-grow flex flex-col overflow-auto shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-teal-500">Data View</h2>
        {allHeaders.length > 0 && (
          <div className="relative" ref={managerRef}>
            <button
              onClick={() => setIsManagerOpen(prev => !prev)}
              className="px-3 py-1 text-sm font-semibold bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-colors duration-200"
            >
              Manage Columns
            </button>
            {isManagerOpen && (
              <ColumnManager
                allColumns={allHeaders}
                visibleColumns={visibleColumns}
                onToggleColumn={onToggleColumn}
              />
            )}
          </div>
        )}
      </div>
      <div className="w-full h-full overflow-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50 sticky top-0 z-10">
            <tr>
              {visibleHeaders.map((header) => {
                const isSplittable = !header.includes('.') && data.some(row => {
                  const value = row[header];
                  if (value === null || typeof value !== 'object') {
                    return false;
                  }
                  if (!Array.isArray(value) && Object.keys(value).length > 0) {
                    return true; // Is a non-empty object
                  }
                  if (Array.isArray(value) && value.length > 0) {
                    return true; // Is a non-empty array
                  }
                  return false;
                });

                const isRegroupable = header.includes('.');
                const parentKey = isRegroupable ? header.split('.')[0] : '';

                return (
                  <th
                    key={header}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider group align-bottom"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate" title={header}>{header}</span>
                      <div className="flex items-center gap-1">
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
                        <button
                          onClick={() => onToggleColumn(header)}
                          className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                          title={`Hide column "${header}"`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-700/50 transition-colors duration-150">
                {visibleHeaders.map((header) => (
                  <td
                    key={`${rowIndex}-${header}`}
                    className="p-0 text-sm text-gray-200 align-top"
                  >
                    {renderCellContent(row[header])}
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