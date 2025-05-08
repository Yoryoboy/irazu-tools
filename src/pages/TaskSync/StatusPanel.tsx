import { Check, AlertCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StatusPanelProps {
  file: File | null;
  loadingClickUpData: boolean;
}

export function StatusPanel({ file, loadingClickUpData }: StatusPanelProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Alert className="bg-gray-800 border-gray-700">
        <AlertDescription className="flex items-center">
          {file ? (
            <Check className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
          )}
          Excel File: {file ? 'Uploaded' : 'Pending'}
        </AlertDescription>
      </Alert>
      <Alert className="bg-gray-800 border-gray-700">
        <AlertDescription className="flex items-center">
          {loadingClickUpData ? (
            <Loader className="h-4 w-4 text-gray-500 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 text-green-500 mr-2" />
          )}
          ClickUp Data: {loadingClickUpData ? 'Pending' : 'Fetched'}
        </AlertDescription>
      </Alert>
    </div>
  );
}
