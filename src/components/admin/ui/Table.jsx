// components/admin/ui/table/Table.jsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Filter, ChevronUp, ChevronDown, Search, LoaderCircle, RotateCw } from 'lucide-react';
import Skeleton from './Skeleton';

const Table = ({
  data = [],
  columns = [],
  loading = false,
  searchable = true,
  sortable = true,
  selectable = false,
  searchPlaceholder = "Type to search...",
  emptyMessage = "No data found",
  className = "",
  maxHeight = "500px",
  onSelectionChange = () => { },
  onRowClick = () => { },
  bulkActions = [],
  onBulkAction = () => { },
  searchKeys = [],
  onReload = null, 
  handlers = {},
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [bulkActionValue, setBulkActionValue] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const columnHasRenderForSearch = (key) => {
    return columns.some(col => col.key === key && col.render);
  };

  const processedData = useMemo(() => {
    let filtered = data;

    if (debouncedSearch && searchable) {
      const searchLower = debouncedSearch.toLowerCase();
      const keysToSearch = searchKeys.length ? searchKeys :
        columns.map(col => col.key).filter(key => {
          const sample = data[0]?.[key];
          return typeof sample === 'string' || typeof sample === 'number';
        });

      filtered = data.filter(item =>
        keysToSearch.some(key => {
          const value = item[key];
          if (columnHasRenderForSearch(key) && typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return false;
          }
          return String(value || '').toLowerCase().includes(searchLower);
        })
      );
    }

    // Sorting
    if (sortKey && sortable) {
      const direction = sortDir === 'asc' ? 1 : -1;
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal === bVal) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * direction;
        }
        return String(aVal).localeCompare(String(bVal)) * direction;
      });
    }

    return filtered;
  }, [data, debouncedSearch, sortKey, sortDir, searchable, sortable, columns, searchKeys]);

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Handle selection
  const toggleSelect = (id) => {
    if (!selectable) return;
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  const toggleSelectAll = () => {
    if (!selectable) return;
    const newSelected = selected.size === processedData.length && processedData.length > 0
      ? new Set()
      : new Set(processedData.map(item => item.id || item._id));
    setSelected(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  // Handle bulk actions
  const executeBulkAction = () => {
    if (bulkActionValue && selected.size > 0) {
      onBulkAction(bulkActionValue, Array.from(selected));
      setSelected(new Set());
      setBulkActionValue('');
    }
  };

  return (
    <div className={`border border-black rounded-xl bg-background p-5 shadow-sm ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 gap-3">
        {/* Bulk Actions */}
        {selectable && bulkActions.length > 0 && (
          <div className="flex items-center gap-3">
            <select
              className="bg-[#f2cfa6] border border-black rounded px-3 py-1.5 text-[12px] font-bold outline-none"
              value={bulkActionValue}
              onChange={(e) => setBulkActionValue(e.target.value)}
            >
              <option value="">Bulk Action</option>
              {bulkActions.map((action) => (
                <option key={action.value} value={action.value}>
                  {action.label}
                </option>
              ))}
            </select>
            <button
              onClick={executeBulkAction}
              disabled={!bulkActionValue || selected.size === 0}
              className="px-4 py-1.5 bg-black text-white rounded font-bold text-[12px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              Apply
            </button>
          </div>
        )}

        {(!selectable || bulkActions.length === 0) && <div />}

        {/* Search and Reload */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {searchable && (
            <div className="flex items-center gap-2 max-w-sm text-sm border border-black rounded-lg px-4 py-1.5 bg-background focus-within:border-red-700 cursor-pointer transition-all">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none w-full placeholder:text-gray-400 text-sm font-medium"
              />
              {search !== debouncedSearch && (
                <LoaderCircle className="w-3 h-3 animate-spin text-orange-400" />
              )}
            </div>
          )}
          {onReload && (
            <button
              onClick={onReload}
              className="p-2 rounded-lg bg-[#f2cfa6] hover:bg-orange-300 border border-black transition-colors"
              aria-label="Reload data"
            >
              <RotateCw className={`w-4 h-4 text-black ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-auto rounded-lg border border-black bg-background"
        style={{ maxHeight }}
      >
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-[#f2cfa6] z-10 border-b border-black">
            <tr>
              {/* Selection column */}
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === processedData.length && processedData.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                </th>
              )}

              {/* Data columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false ? handleSort(column.key) : null}
                  className={`px-4 py-3 text-left font-bold text-xs uppercase tracking-wider ${sortable && column.sortable !== false
                      ? 'cursor-pointer select-none hover:bg-orange-200 transition-colors'
                      : ''
                    } ${column.headerClassName || ''}`}
                >
                  <div className="flex items-center gap-2" >
                    {column.header}
                    {sortable && column.sortable !== false && (
                      <div className="flex flex-col">
                        {sortKey === column.key ? (
                          sortDir === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <Filter className="w-3 h-3 text-black/30 group-hover:text-black" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {selectable && <td className="px-4 py-4"><Skeleton className="h-4 w-4" /></td>}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : processedData.length > 0 ? (
              processedData.map((row, index) => {
                const rowId = row.id || row._id || `row-${index}`;
                const isSelected = selected.has(rowId);
                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick(row, index)}
                    className={`border-b border-gray-100 hover:bg-orange-50/50 transition-colors ${isSelected ? 'bg-orange-50' : ''} ${onRowClick !== (() => { }) ? 'cursor-pointer' : ''}`}
                  >
                    {/* Selection column */}
                    {selectable && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(rowId)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 accent-black cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Data columns */}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-2 text-[12px] h-[10px] ${column.className || ''}`}
                      >
                        {column.render
                          ? column.render(row, handlers)
                          : row[column.key]
                        }
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="text-center py-20 text-gray-400 text-sm font-medium"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 opacity-20" />
                    {emptyMessage}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      {processedData.length > 0 && (
        <div className="mt-4 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest flex justify-between">
          <span>
            Total: {processedData.length} {processedData.length === 1 ? 'entry' : 'entries'}
          </span>
          {selectable && selected.size > 0 && (
            <span className="text-black bg-[#f2cfa6] px-2 rounded">
              {selected.size} selected
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Table;