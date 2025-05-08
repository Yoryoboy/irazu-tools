
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Upload, Check, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FileUploaderProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

export function FileUploader({ file, setFile }: FileUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        toast('Excel file uploaded successfully');
      }
    },
  });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Upload Excel File</label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-700 hover:border-blue-500/50'
        } cursor-pointer`}
      >
        <input {...getInputProps()} />
        <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-400">
          {isDragActive
            ? 'Drop the Excel file here'
            : 'Drag and drop an Excel file here, or click to select'}
        </p>
        <Button variant="outline" className="mt-4">
          <Upload className="mr-2 h-4 w-4" />
          Upload Excel File
        </Button>
        {file && (
          <div className="mt-4 flex items-center justify-center">
            <Badge
              variant="outline"
              className="bg-green-500/20 text-green-400 border-green-500/50"
            >
              <Check className="mr-1 h-3 w-3" /> {file.name}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
