import { useMemo } from 'react';
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
      { header: 'JOB_NAME', accessorKey: 'JOB_NAME' },
      { header: 'EXTERNAL_ID', accessorKey: 'EXTERNAL_ID' },
      { header: 'SECONDARY_EXTERNAL_ID', accessorKey: 'SECONDARY_EXTERNAL_ID' },
      { header: 'REQUEST_NAME', accessorKey: 'REQUEST_NAME' },
      { header: 'PROJECT_TYPE', accessorKey: 'PROJECT_TYPE' },
      { header: 'NODE_NAME', accessorKey: 'NODE_NAME' },
      { header: 'REQUEST_ID', accessorKey: 'REQUEST_ID' },
      { header: 'HUB', accessorKey: 'HUB' },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <button
            type="button"
            className="px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
            onClick={() => onSyncOne(row.original.EXTERNAL_ID)}
          >
            Sync
          </button>
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
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-900 text-zinc-200">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-3 py-2 text-left font-medium">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-zinc-800 bg-zinc-950">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-zinc-900/60">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-3 py-2 text-zinc-200">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
