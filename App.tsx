import React, { useState, useCallback } from 'react';
import { JsonInput } from './components/JsonInput';
import { DataTable } from './components/DataTable';
import { TableData } from './types';

const App: React.FC = () => {
  const defaultJson = JSON.stringify(
    [
      { 
        "id": 1, 
        "product": "Laptop", 
        "price": 1200, 
        "in_stock": true, 
        "specs": { "cpu": "i7", "ram": 16 }, 
        "accessories": ["charger", "case"],
        "components": [
          { "name": "CPU", "model": "Intel Core i7" },
          { "name": "RAM", "model": "16GB DDR4" },
          { "name": "Storage", "model": "512GB SSD" }
        ]
      },
      { "id": 2, "product": "Mouse", "price": 25, "in_stock": true, "specs": { "dpi": 1600 }, "accessories": [] },
      { "id": 3, "product": "Keyboard", "price": 75, "in_stock": false, "specs": { "layout": "US" } },
      { "id": 4, "product": "Monitor", "price": 300, "in_stock": true, "specs": { "size": "27 inch", "resolution": "1440p" }, "accessories": ["hdmi cable", "power cord", "stand"] }
    ],
    null,
    2
  );

  const initialData = JSON.parse(defaultJson);
  const [jsonString, setJsonString] = useState<string>(defaultJson);
  const [data, setData] = useState<TableData[] | null>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(Object.keys(initialData[0] || {})));

  const handleToggleColumn = useCallback((column: string) => {
    setVisibleColumns(prev => {
        const newSet = new Set(prev);
        if (newSet.has(column)) {
            // Prevent hiding the last column
            if (newSet.size > 1) {
                newSet.delete(column);
            }
        } else {
            newSet.add(column);
        }
        return newSet;
    });
  }, []);

  const handleVisualize = useCallback(() => {
    if (!jsonString.trim()) {
      setData(null);
      setError(null);
      setVisibleColumns(new Set());
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      setError(null);
      let newData: TableData[] | null = null;
      
      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null) {
          newData = parsed;
        } else if (parsed.length > 0) {
           newData = parsed.map((value, index) => ({ index, value }));
        } else {
          newData = [];
        }
      } else if (typeof parsed === 'object' && parsed !== null) {
        newData = [parsed];
      } else {
        setError('Unsupported JSON structure. Please provide an array of objects or a single object.');
        setData(null);
        setVisibleColumns(new Set());
        return;
      }
      
      setData(newData);
      setVisibleColumns(new Set(Object.keys(newData[0] || {})));

    } catch (e) {
      setError('Invalid JSON format. Please check your syntax.');
      setData(null);
      setVisibleColumns(new Set());
    }
  }, [jsonString]);

 const handleSplitColumn = useCallback((columnToSplit: string) => {
    if (!data) return;

    // Check if the column contains an array of objects to pivot
    const isArrayOfObjects = data.some(row => 
        Array.isArray(row[columnToSplit]) && 
        row[columnToSplit].length > 0 && 
        typeof row[columnToSplit][0] === 'object' && 
        row[columnToSplit][0] !== null
    );

    if (isArrayOfObjects) {
      // Pivot logic for array of objects
      const allSubKeys = new Set<string>();
      data.forEach(row => {
        if (Array.isArray(row[columnToSplit])) {
          row[columnToSplit].forEach((item: any) => {
            if (typeof item === 'object' && item !== null) {
              Object.keys(item).forEach(key => allSubKeys.add(key));
            }
          });
        }
      });

      if (allSubKeys.size === 0) return;

      const newData = data.map(row => {
        const newRow: TableData = { ...row };
        const arrayToPivot = newRow[columnToSplit];

        if (Array.isArray(arrayToPivot)) {
          allSubKeys.forEach(subKey => {
            const newColumnKey = `${columnToSplit}.${subKey}`;
            newRow[newColumnKey] = arrayToPivot.map((item: any) => 
              (typeof item === 'object' && item !== null && subKey in item) ? item[subKey] : undefined
            );
          });
        }
        delete newRow[columnToSplit];
        return newRow;
      });
      setData(newData);
      setVisibleColumns(new Set(Object.keys(newData[0] || {})));

    } else {
      // Original logic for objects and arrays of primitives
      const allSubKeys = new Set<string>();
      data.forEach(row => {
        const valueToSplit = row[columnToSplit];
        if (typeof valueToSplit === 'object' && valueToSplit !== null) {
          Object.keys(valueToSplit).forEach(subKey => allSubKeys.add(subKey));
        }
      });

      if (allSubKeys.size === 0) return;

      const newData = data.map(row => {
        const newRow: TableData = { ...row };
        const valueToSplit = newRow[columnToSplit];
        const isObjectOrArrayToSplit = typeof valueToSplit === 'object' && valueToSplit !== null;

        allSubKeys.forEach(subKey => {
          const newColumnKey = `${columnToSplit}.${subKey}`;
          if (isObjectOrArrayToSplit && subKey in valueToSplit) {
            newRow[newColumnKey] = (valueToSplit as any)[subKey];
          } else {
            newRow[newColumnKey] = undefined;
          }
        });

        delete newRow[columnToSplit];
        return newRow;
      });
      setData(newData);
      setVisibleColumns(new Set(Object.keys(newData[0] || {})));
    }
  }, [data]);

  const handleRegroupColumn = useCallback((columnToRegroup: string) => {
    if (!data || !columnToRegroup.includes('.')) return;

    const parentKey = columnToRegroup.split('.')[0];
    const prefix = `${parentKey}.`;

    const newData = data.map(row => {
      const newRow: TableData = {};
      const regroupedObject: Record<string, any> = {};
      const childKeys: string[] = [];

      for (const key in row) {
        if (key.startsWith(prefix)) {
          const childKey = key.substring(prefix.length);
           if (row[key] !== undefined) { 
            regroupedObject[childKey] = row[key];
            childKeys.push(childKey);
          }
        } else {
          newRow[key] = row[key];
        }
      }

      // Heuristic to detect if we're un-pivoting an array of objects
      // All values in the regrouped object should be arrays of the same length.
      const isPivotedArray = childKeys.length > 0 && 
                             Array.isArray(regroupedObject[childKeys[0]]) &&
                             childKeys.every(k => 
                                Array.isArray(regroupedObject[k]) && 
                                regroupedObject[k].length === regroupedObject[childKeys[0]].length
                             );

      if (isPivotedArray) {
        const arrayLength = regroupedObject[childKeys[0]].length;
        const regroupedArray = [];
        for (let i = 0; i < arrayLength; i++) {
          const item: Record<string, any> = {};
          childKeys.forEach(k => {
            item[k] = regroupedObject[k][i];
          });
          regroupedArray.push(item);
        }
        newRow[parentKey] = regroupedArray;
        return newRow;
      }
      
      // Fallback for regular objects and arrays of primitives
      const keys = Object.keys(regroupedObject);
      if (keys.length > 0) {
        const areAllKeysNumericStrings = keys.every(key => /^\d+$/.test(key));
        if (areAllKeysNumericStrings) {
            const numericKeys = keys.map(k => parseInt(k, 10)).sort((a, b) => a - b);
            const isSequential = numericKeys.every((val, index) => val === index);
            if (isSequential) {
                const regroupedArray = [];
                for (let i = 0; i < numericKeys.length; i++) {
                    regroupedArray.push(regroupedObject[String(i)]);
                }
                newRow[parentKey] = regroupedArray;
                return newRow;
            }
        }
      }
      
      newRow[parentKey] = regroupedObject;
      return newRow;
    });

    setData(newData);
    setVisibleColumns(new Set(Object.keys(newData[0] || {})));
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
          <DataTable 
            data={data} 
            onSplitColumn={handleSplitColumn} 
            onRegroupColumn={handleRegroupColumn}
            visibleColumns={visibleColumns}
            onToggleColumn={handleToggleColumn} 
          />
        </div>
      </main>

      <footer className="text-center text-gray-600 mt-8">
        <p>Built with React, TypeScript, and Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;