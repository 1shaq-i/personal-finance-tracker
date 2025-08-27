import { useMemo, useState } from "react";
import {
  type FinancialRecord,
  useFinancialRecords,
} from "../../contexts/financial-record-context";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type CellContext,
} from "@tanstack/react-table";

/** ---- Module augmentation for column/table meta (v8 pattern) ---- */
declare module "@tanstack/react-table" {
  // Per-column extras
  interface ColumnMeta<TData, TValue> {
    editable?: boolean;
  }
  // Table-level helpers you want available inside cell renderers
  interface TableMeta<TData> {
    updateRecord: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

/** ---- Editable cell (v8 Cell renderer) ---- */
function EditableCell<TData, TValue>({
  getValue,
  row,
  column,
  table,
}: CellContext<TData, TValue>) {
  const initialValue = getValue();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<unknown>(initialValue);

  const editable = column.columnDef.meta?.editable ?? false;

  const onBlur = () => {
    setIsEditing(false);
    table.options.meta?.updateRecord(row.index, column.id, value);
  };

  const display =
    value == null
      ? ""
      : typeof value === "string"
      ? value
      : typeof value === "number"
      ? String(value)
      : String(value);

  return (
    <div
      onClick={() => editable && setIsEditing(true)}
      style={{ cursor: editable ? "pointer" : "default" }}
    >
      {isEditing ? (
        <input
          value={
            typeof value === "string" || typeof value === "number"
              ? String(value)
              : ""
          }
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          onBlur={onBlur}
          style={{ width: "100%" }}
        />
      ) : (
        display
      )}
    </div>
  );
}

/** ---- Main component ---- */
export const FinancialRecordList = () => {
  const { records, updateRecord, deleteRecord } = useFinancialRecords();

  const updateCellRecord = (
    rowIndex: number,
    columnId: string,
    value: unknown
  ) => {
    const id = records[rowIndex]?._id ?? "";
    const current = records[rowIndex];
    if (!current) return;
    updateRecord(id, { ...current, [columnId]: value });
  };

  const columns: ColumnDef<FinancialRecord>[] = useMemo(
    () => [
      {
        header: "Description",
        accessorKey: "description",
        meta: { editable: true },
        cell: (ctx) => <EditableCell {...ctx} />,
      },
      {
        header: "Amount",
        accessorKey: "amount",
        meta: { editable: true },
        cell: (ctx) => <EditableCell {...ctx} />,
      },
      {
        header: "Category",
        accessorKey: "category",
        meta: { editable: true },
        cell: (ctx) => <EditableCell {...ctx} />,
      },
      {
        header: "Payment Method",
        accessorKey: "paymentMethod",
        meta: { editable: true },
        cell: (ctx) => <EditableCell {...ctx} />,
      },
      {
        header: "Date",
        accessorKey: "date",
        meta: { editable: false },
        cell: (ctx) => <EditableCell {...ctx} />,
      },
      {
        id: "delete",
        header: "Delete",
        cell: ({ row }) => (
          <button
            onClick={() => deleteRecord(row.original._id ?? "")}
            className="button"
          >
            Delete
          </button>
        ),
      },
    ],
    [deleteRecord, records]
  );

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateRecord: updateCellRecord,
    },
  });

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
