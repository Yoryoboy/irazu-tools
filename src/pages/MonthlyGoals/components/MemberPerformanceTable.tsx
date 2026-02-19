import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { MemberPerformance } from '../MonthlyGoals.types';

interface MemberPerformanceTableProps {
  title: string;
  members: MemberPerformance[];
  splitLabel: string;
}

function formatPoints(points: number) {
  return Number.isInteger(points) ? points.toString() : points.toFixed(2);
}

export function MemberPerformanceTable({
  title,
  members,
  splitLabel,
}: MemberPerformanceTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground transition-colors hover:text-foreground">
              <Info className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{splitLabel}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead className="text-right">Tasks</TableHead>
            <TableHead className="text-right">Points</TableHead>
            <TableHead className="text-right">Goal</TableHead>
            <TableHead className="text-right">Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No members found for this month.
              </TableCell>
            </TableRow>
          ) : (
            members.map(member => {
              const clampedProgress = Math.min(Math.max(member.progressPercent, 0), 100);

              return (
                <TableRow key={member.memberId}>
                  <TableCell className="font-medium">{member.memberName}</TableCell>
                  <TableCell className="text-right">{member.taskCount}</TableCell>
                  <TableCell className="text-right">{formatPoints(member.totalPoints)}</TableCell>
                  <TableCell className="text-right">{formatPoints(member.goal)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20">
                        <Progress value={clampedProgress} />
                      </div>
                      <Badge variant="outline" className="tabular-nums">
                        {member.progressPercent.toFixed(1)}%
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
