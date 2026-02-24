import { Button } from '@/components/ui/button';
import { AlertTriangle, ChevronDown, ChevronUp, Download, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { MonthlyGoalTask } from '../MonthlyGoals.types';
import { generateWarningsExcel } from '../utils/exportWarnings';

interface WarningsPanelProps {
  tasksWithWarnings: MonthlyGoalTask[];
  monthKey: string;
  type: 'BAU' | 'HS';
}

function getClickUpTaskUrl(taskId: string): string {
  return `https://app.clickup.com/t/${taskId}`;
}

export function WarningsPanel({ tasksWithWarnings, monthKey, type }: WarningsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (tasksWithWarnings.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-amber-300/40 bg-amber-50/50 p-4 text-left">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded(previous => !previous)}
          className="flex flex-1 items-center justify-between gap-3 text-sm font-medium"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600" />
            {tasksWithWarnings.length} tasks have warnings
          </span>
          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void generateWarningsExcel(tasksWithWarnings, monthKey, type);
          }}
        >
          <Download className="mr-2 size-4" />
          Export Warnings
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-3 max-h-64 overflow-auto rounded-md border bg-background">
          <ul className="divide-y text-sm">
            {tasksWithWarnings.map(task => (
              <li key={task.id} className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{task.name}</p>
                  <a
                    href={getClickUpTaskUrl(task.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                  >
                    Open in ClickUp
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                <p className="text-muted-foreground">{task.warnings.join(' | ')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
