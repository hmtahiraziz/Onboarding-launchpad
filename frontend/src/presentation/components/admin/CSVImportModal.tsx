import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, title: string, description: string) => Promise<void>;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    questionCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
        setValidationResult(null);
      } else {
        setError('Please select a valid CSV file');
        setFile(null);
      }
    }
  };

  const validateCSV = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await fetch('/api/questionnaires/validate-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setValidationResult(result.data);
      } else {
        setError(result.error || 'Validation failed');
        setValidationResult(null);
      }
    } catch (err) {
      setError('Failed to validate CSV file');
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file || !validationResult?.isValid) {
      setError('Please validate the CSV file first');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('csvFile', file);
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);

      const response = await fetch('/api/questionnaires/import-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setFile(null);
        setTitle('');
        setDescription('');
        setValidationResult(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onClose();
        // Refresh the page or trigger a callback to reload questionnaires
        window.location.reload();
      } else {
        setError(result.error || 'Import failed');
      }
    } catch (err) {
      setError('Failed to import CSV file');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setValidationResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Import Questionnaire from CSV</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="space-y-2">
                    <div className="text-green-600">
                      <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-gray-400">
                      <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">Click to select CSV file</p>
                    <p className="text-xs text-gray-500">or drag and drop</p>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {file ? 'Change File' : 'Browse Files'}
                </button>
              </div>
            </div>

            {/* Questionnaire Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Questionnaire Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter questionnaire title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <Card className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {validationResult.isValid ? (
                    <div className="text-green-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  <h3 className="font-medium text-gray-900">
                    {validationResult.isValid ? 'CSV is Valid' : 'CSV Validation Failed'}
                  </h3>
                </div>
                {validationResult.isValid ? (
                  <p className="text-sm text-gray-600">
                    Found {validationResult.questionCount} questions ready for import.
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-red-600 mb-2">Please fix the following errors:</p>
                    <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="text-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CSV Format Help */}
            <Card className="p-4 bg-blue-50">
              <h3 className="font-medium text-blue-900 mb-2">CSV Format Requirements</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Required columns:</strong> title, type</p>
                <p><strong>Optional columns:</strong> description, options, isRequired, order</p>
                <p><strong>Question types:</strong> text, textarea, radio, checkbox, dropdown, number, date</p>
                <p><strong>Options:</strong> Use pipe (|) to separate multiple options</p>
                <p><strong>Example:</strong> "Option 1|Option 2|Option 3"</p>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isValidating || isImporting}
              >
                Cancel
              </Button>
              <Button
                onClick={validateCSV}
                disabled={!file || isValidating || isImporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isValidating ? 'Validating...' : 'Validate CSV'}
              </Button>
              <Button
                onClick={handleImport}
                disabled={!validationResult?.isValid || isImporting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isImporting ? 'Importing...' : 'Import Questionnaire'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
