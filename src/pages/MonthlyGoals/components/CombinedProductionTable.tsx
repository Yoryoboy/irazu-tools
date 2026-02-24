import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CombinedProductionMember } from '../MonthlyGoals.types';

interface CombinedProductionTableProps {
  members: CombinedProductionMember[];
}

function formatMiles(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

export function CombinedProductionTable({ members }: CombinedProductionTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Combined Production</h3>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead className="text-right">Asbuilt Miles</TableHead>
            <TableHead className="text-right">Design Miles</TableHead>
            <TableHead className="text-right">Redesign Miles</TableHead>
            <TableHead className="text-right">Total Miles</TableHead>
            <TableHead className="text-right">Tasks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No members found for this month.
              </TableCell>
            </TableRow>
          ) : (
            members.map(member => (
              <TableRow key={member.memberId}>
                <TableCell className="font-medium">{member.memberName}</TableCell>
                <TableCell className="text-right">{formatMiles(member.asbuiltMiles)}</TableCell>
                <TableCell className="text-right">{formatMiles(member.designMiles)}</TableCell>
                <TableCell className="text-right">{formatMiles(member.redesignMiles)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatMiles(member.totalMiles)}
                </TableCell>
                <TableCell className="text-right">{member.taskCount}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
