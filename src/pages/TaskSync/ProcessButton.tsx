import { RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProcessButtonProps {
  isProcessing: boolean;
  hasProcessedTasks: boolean;
  onProcess: () => void;
  disabled: boolean;
}

export function ProcessButton({ 
  isProcessing, 
  hasProcessedTasks, 
  onProcess, 
  disabled 
}: ProcessButtonProps) {
  return (
    <Button
      className="w-full sm:w-auto bg-[#3B82F6] hover:bg-blue-600"
      onClick={onProcess}
      disabled={disabled}
    >
      {isProcessing ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : hasProcessedTasks ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Processed
        </>
      ) : (
        'Process Tasks'
      )}
    </Button>
  );
}
