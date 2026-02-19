import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { MonthlyGoalTask } from '../MonthlyGoals.types';

interface WarningsPanelProps {
  tasksWithWarnings: MonthlyGoalTask[];
}

export function WarningsPanel({ tasksWithWarnings }: WarningsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (tasksWithWarnings.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-amber-300/40 bg-amber-50/50 p-4 text-left">
      <button
        type="button"
        onClick={() => setIsExpanded(previous => !previous)}
        className="flex w-full items-center justify-between gap-3 text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-600" />
          {tasksWithWarnings.length} tasks have missing fields
        </span>
        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {isExpanded && (
        <div className="mt-3 max-h-64 overflow-auto rounded-md border bg-background">
          <ul className="divide-y text-sm">
            {tasksWithWarnings.map(task => (
              <li key={task.id} className="space-y-1 p-3">
                <p className="font-medium">{task.name}</p>
                <p className="text-muted-foreground">{task.warnings.join(' | ')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
