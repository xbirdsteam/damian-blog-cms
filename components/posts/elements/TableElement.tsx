/* eslint-disable @typescript-eslint/no-explicit-any */
import ListElement from "./ListElement";

interface Column {
  header: string;
  key: string;
}

interface TableElementProps {
  columns: Column[];
  rows: Array<{ [key: string]: any }>;
}

export default function TableElement({ columns, rows }: TableElementProps) {
  const cellWidth = `${100 / columns.length}%`;
  return (
    <div className="overflow-x-auto my-4">
      {/* Desktop View (≥ mlg) */}
      <table className="hidden mlg:table min-w-full divide-y border border-[#E5E5E5]">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                style={{ width: cellWidth }}
                className="h-[60px] px-8 py-4 bg-[#F1EFF1] text-left text-heading-b-20 text-neutral-primary-text border border-[#E5E5E5]"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E5E5]">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  style={{ width: cellWidth }}
                  className="p-8 border border-[#E5E5E5] align-top"
                >
                  {row[column.key].type === "list" ? (
                    <ListElement lists={row[column.key].lists} />
                  ) : (
                    row[column.key]?.content
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile View (< mlg) */}
      <div className="mlg:hidden space-y-8">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex}>
            {columns.map((column, colIndex) => (
              <div
                key={colIndex}
                className={`border border-[#E5E5E5] ${
                  colIndex !== 0 ? "border-t-0" : ""
                }`}
              >
                <div className="h-[60px] px-6 py-4 bg-[#F1EFF1] text-left text-heading-b-20 text-neutral-primary-text border-b border-[#E5E5E5]">
                  {column.header}
                </div>
                <div className="p-6">
                  {row[column.key].type === "list" ? (
                    <ListElement lists={row[column.key].lists} />
                  ) : (
                    row[column.key]?.content
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
