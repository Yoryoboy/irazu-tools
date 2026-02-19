import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface ExportImportConfigProps {
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
}

export function ExportImportConfig({ onExport, onImport }: ExportImportConfigProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [importing, setImporting] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" onClick={onExport}>
        <Download className="mr-1 size-4" />
        Export
      </Button>

      <Button
        type="button"
        variant="outline"
        disabled={importing}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-1 size-4" />
        {importing ? 'Importing...' : 'Import'}
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async event => {
          const file = event.target.files?.[0];
          event.target.value = '';

          if (!file) {
            return;
          }

          setImporting(true);

          try {
            await onImport(file);
          } finally {
            setImporting(false);
          }
        }}
      />
    </div>
  );
}
