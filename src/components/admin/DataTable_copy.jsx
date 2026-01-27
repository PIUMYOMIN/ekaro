const DataTable = ({
  columns,
  data,
  searchTerm = "",
  onSearchChange = () => { },
  className = ""
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const processedData = React.useMemo(() => {
    // Ensure data is an array
    let filteredData = Array.isArray(data) ? data : [];

    if (searchTerm) {
      filteredData = filteredData.filter((item) =>
        columns.some((column) => {
          const value = item[column.accessor];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }

    if (sortConfig.key) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [data, sortConfig, searchTerm, columns]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // Ensure paginatedData is always an array
  const paginatedData = Array.isArray(processedData)
    ? processedData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
    : [];

  return (
    <div className={`overflow-x-auto ${className}`}>
      {/* ... rest of the component remains the same ... */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort(column.accessor)}
              >
                <div className="flex items-center">
                  {column.header}
                  {sortConfig.key === column.accessor && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.isArray(paginatedData) && paginatedData.length > 0 ? (
            paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => {
                  const cellValue = row[column.accessor];
                  return (
                    <td
                      key={`${rowIndex}-${column.accessor}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {column.cell ? (
                        column.cell(row)
                      ) : column.isImage ? (
                        <img
                          src={cellValue || "/placeholder-image.jpg"}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : column.isCurrency ? (
                        new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD"
                        }).format(cellValue || 0)
                      ) : column.isStars ? (
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              className={`h-4 w-4 ${star <= cellValue
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                      ) : column.isStatus ? (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${cellValue === "approved" || cellValue === "active"
                            ? "bg-green-100 text-green-800"
                            : cellValue === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : cellValue === "rejected" ||
                                cellValue === "suspended"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {cellValue}
                        </span>
                      ) : (
                        cellValue
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                {Array.isArray(data) && data.length === 0 ? "No data available" : "Loading..."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, processedData.length)}
            </span>{" "}
            of <span className="font-medium">{processedData.length}</span>{" "}
            results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
