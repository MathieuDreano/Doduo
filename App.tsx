import React, { useState, useCallback } from 'react';
import { JsonInput } from './components/JsonInput';
import { DataTable } from './components/DataTable';
import { TableData } from './types';

const App: React.FC = () => {
  const defaultJson = JSON.stringify(
    [
      { "id": 1, "product": "Laptop", "price": 1200, "in_stock": true, "specs": { "cpu": "i7", "ram": 16 } },
      { "id": 2, "product": "Mouse", "price": 25, "in_stock": true, "specs": { "dpi": 1600 } },
      { "id": 3, "product": "Keyboard", "price": 75, "in_stock": false, "specs": { "layout": "US" } },
      { "id": 4, "product": "Monitor", "price": 300, "in_stock": true, "specs": { "size": "27 inch", "resolution": "1440p" } }
    ],
    null,
    2
  );

  const [jsonString, setJsonString] = useState<string>(defaultJson);
  const [data, setData] = useState<TableData[] | null>(JSON.parse(defaultJson));
  const [error, setError] = useState<string | null>(null);

  const handleVisualize = useCallback(() => {
    if (!jsonString.trim()) {
      setData(null);
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      setError(null);

      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
          setData(parsed);
        } else if (parsed.length > 0) {
           setData(parsed.map((value, index) => ({ index, value })));
        } else {
          setData([]);
        }
      } else if (typeof parsed === 'object' && parsed !== null) {
        setData([parsed]);
      } else {
        setError('Unsupported JSON structure. Please provide an array of objects or a single object.');
        setData(null);
      }
    } catch (e) {
      setError('Invalid JSON format. Please check your syntax.');
      setData(null);
    }
  }, [jsonString]);

  const handleSplitColumn = useCallback((columnToSplit: string) => {
    if (!data) return;

    // 1. Collect all unique sub-keys from all rows for the target column.
    const allSubKeys = new Set<string>();
    data.forEach(row => {
      const valueToSplit = row[columnToSplit];
      if (typeof valueToSplit === 'object' && valueToSplit !== null && !Array.isArray(valueToSplit)) {
        Object.keys(valueToSplit).forEach(subKey => {
          allSubKeys.add(subKey);
        });
      }
    });

    if (allSubKeys.size === 0) return; // Nothing to split

    // 2. Create the new data array with the expanded columns.
    const newData = data.map(row => {
      const newRow: TableData = { ...row };
      const valueToSplit = newRow[columnToSplit];
      const isObjectToSplit = typeof valueToSplit === 'object' && valueToSplit !== null && !Array.isArray(valueToSplit);

      // Add all potential new columns to each row.
      allSubKeys.forEach(subKey => {
        const newColumnKey = `${columnToSplit}.${subKey}`;
        if (isObjectToSplit && subKey in valueToSplit) {
          newRow[newColumnKey] = valueToSplit[subKey];
        } else {
          // Ensure every row has the new columns, even if they are empty for that row.
          newRow[newColumnKey] = undefined;
        }
      });
      
      // Remove the original column.
      delete newRow[columnToSplit];
      return newRow;
    });
    
    setData(newData);
  }, [data]);


  const handleRegroupColumn = useCallback((columnToRegroup: string) => {
    if (!data || !columnToRegroup.includes('.')) return;

    const parentKey = columnToRegroup.split('.')[0];
    const prefix = `${parentKey}.`;

    const newData = data.map(row => {
      const newRow: TableData = {};
      const regroupedObject: Record<string, any> = {};
      
      for (const key in row) {
        if (key.startsWith(prefix)) {
          const childKey = key.substring(prefix.length);
          if (row[key] !== undefined) { // Only add defined properties to the regrouped object
            regroupedObject[childKey] = row[key];
          }
        } else {
          newRow[key] = row[key];
        }
      }
      
      newRow[parentKey] = regroupedObject;
      return newRow;
    });

    setData(newData);
  }, [data]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-teal-500">JSON Spreadsheet Viewer</h1>
        <p className="text-gray-400 mt-2">Paste your JSON into the editor and instantly visualize it as a table.</p>
      </header>
      
      <main className="flex-grow flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 flex flex-col">
          <JsonInput 
            jsonString={jsonString}
            setJsonString={setJsonString}
            onVisualize={handleVisualize}
            error={error}
          />
        </div>
        <div className="lg:w-2/3 flex flex-col">
          <DataTable data={data} onSplitColumn={handleSplitColumn} onRegroupColumn={handleRegroupColumn} />
        </div>
      </main>

      <footer className="text-center text-gray-600 mt-8">
        <p>Built with React, TypeScript, and Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;