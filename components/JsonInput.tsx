
import React from 'react';

interface JsonInputProps {
  jsonString: string;
  setJsonString: (value: string) => void;
  onVisualize: () => void;
  error: string | null;
}

export const JsonInput: React.FC<JsonInputProps> = ({ jsonString, setJsonString, onVisualize, error }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col h-full shadow-lg">
      <h2 className="text-xl font-semibold mb-3 text-teal-500">JSON Input</h2>
      <div className="flex-grow flex flex-col">
          <textarea
            className="w-full flex-grow bg-gray-900 text-gray-200 p-3 rounded-md border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono text-sm resize-none"
            value={jsonString}
            onChange={(e) => setJsonString(e.target.value)}
            placeholder="Paste your JSON here..."
            spellCheck="false"
          />
      </div>
      {error && (
          <div className="mt-3 p-3 bg-red-500/20 text-red-400 border border-red-500/50 rounded-md text-sm">
            {error}
          </div>
        )}
      <button
        onClick={onVisualize}
        className="mt-4 w-full bg-teal-500 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-colors duration-200"
      >
        Visualize
      </button>
    </div>
  );
};
