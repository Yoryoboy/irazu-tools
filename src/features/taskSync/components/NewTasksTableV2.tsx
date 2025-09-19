import { useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import type { MQMSTask } from '../../../types/Task';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

interface Props {
  rows: MQMSTask[];
  onSyncOne: (externalId: string) => void;
}

export default function NewTasksTableV2({ rows, onSyncOne }: Props) {
  const columns = useMemo<ColumnDef<MQMSTask, unknown>[]>(
    () => [
      {
        header: 'Job',
        accessorKey: 'JOB_NAME',
        cell: ({ getValue, row }) => (
          <div className="space-y-1">
            <p className="font-medium text-zinc-50">{getValue<string>() || 'Sin nombre'}</p>
            <p className="text-xs text-zinc-400">Nodo: {row.original.NODE_NAME || 'N/A'}</p>
          </div>
        ),
      },
      {
        header: 'IDs externos',
        accessorKey: 'EXTERNAL_ID',
        cell: ({ getValue, row }) => (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{getValue<string>() || '—'}</Badge>
            {row.original.SECONDARY_EXTERNAL_ID && (
              <Badge variant="secondary">{row.original.SECONDARY_EXTERNAL_ID}</Badge>
            )}
          </div>
        ),
      },
      {
        header: 'Request',
        accessorKey: 'REQUEST_NAME',
        cell: ({ getValue, row }) => (
          <div className="space-y-1">
            <p>{getValue<string>() || 'Sin descripción'}</p>
            <p className="text-xs text-zinc-500">WR ID: {row.original.REQUEST_ID || 'N/A'}</p>
          </div>
        ),
      },
      {
        header: 'Proyecto',
        accessorKey: 'PROJECT_TYPE',
        cell: ({ getValue }) => (
          <Badge variant="default" className="bg-emerald-500/80 text-zinc-950">
            {getValue<string>() || 'Sin tipo'}
          </Badge>
        ),
      },
      {
        header: 'Hub',
        accessorKey: 'HUB',
        cell: ({ getValue }) => (
          <Badge variant="secondary" className="bg-zinc-800/80">
            {getValue<string>() || 'N/A'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onSyncOne(row.original.EXTERNAL_ID)}
          >
            Sincronizar
          </Button>
        ),
      },
    ],
    [onSyncOne]
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/60">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
