import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface LoadingSourceStatus {
  key: string;
  label: string;
  loading: boolean;
  pagesFetched: number;
  tasksFetched: number;
}

interface TasksLoadingIndicatorProps {
  title: string;
  description: string;
  pagesFetched: number;
  tasksFetched: number;
  sources?: readonly LoadingSourceStatus[];
}

export function TasksLoadingIndicator({
  title,
  description,
  pagesFetched,
  tasksFetched,
  sources,
}: TasksLoadingIndicatorProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <Loader2 className="mt-0.5 size-4 animate-spin text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">
              Pages fetched: {pagesFetched} • Tasks scanned: {tasksFetched}
            </p>
          </div>
        </div>

        {sources && sources.length > 0 && (
          <ul className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
            {sources.map(source => (
              <li key={source.key} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{source.label}</span>
                <span className="flex items-center gap-2 text-xs">
                  {source.loading ? (
                    <Loader2 className="size-3 animate-spin text-primary" />
                  ) : (
                    <CheckCircle2 className="size-3 text-emerald-600" />
                  )}
                  <span className="text-muted-foreground">
                    {source.pagesFetched} pages • {source.tasksFetched} tasks
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
