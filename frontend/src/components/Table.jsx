import React from "react";

const Table = ({ columns, data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors">
              {columns.map((col, cIdx) => {
                let cellValue = row[col];
                if (col === "createdAt" && cellValue) {
                  cellValue = new Date(cellValue).toLocaleDateString("fr-FR");
                }
                return (
                  <td
                    key={cIdx}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                  >
                    {cellValue || "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
