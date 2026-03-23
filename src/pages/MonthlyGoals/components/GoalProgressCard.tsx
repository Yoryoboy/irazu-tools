import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface GoalProgressCardProps {
  title: string;
  current: number;
  target: number;
  valueSuffix?: string;
}

function getProgressBarClass(progressPercent: number): string {
  if (progressPercent >= 100) {
    return '[&>div]:bg-emerald-500';
  }

  if (progressPercent >= 75) {
    return '[&>div]:bg-amber-500';
  }

  return '[&>div]:bg-rose-500';
}

function formatValue(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

export function GoalProgressCard({
  title,
  current,
  target,
  valueSuffix,
}: GoalProgressCardProps) {
  const progressPercent = target > 0 ? (current / target) * 100 : 0;
  const progressForBar = Math.max(0, Math.min(progressPercent, 100));
  const progressClassName = getProgressBarClass(progressPercent);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xl font-semibold leading-none">
          {formatValue(current)} / {formatValue(target)} {valueSuffix}
        </p>
        <Progress className={progressClassName} value={progressForBar} />
        <p className="text-xs text-muted-foreground">{progressPercent.toFixed(1)}%</p>
      </CardContent>
    </Card>
  );
}
