import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaginationState, SortingState, TableFilters } from './types';

interface TableState {
  // Pagination
  pagination: PaginationState;
  // Sorting
  sorting: SortingState[];
  // Filtering
  filters: TableFilters;
  // Column visibility and order
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  // Row selection
  rowSelection: Record<string, boolean>;

  // Actions - Pagination
  setPagination: (pagination: PaginationState) => void;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  resetPagination: () => void;

  // Actions - Sorting
  setSorting: (sorting: SortingState[]) => void;
  addSort: (id: string, desc?: boolean) => void;
  removeSort: (id: string) => void;
  resetSorting: () => void;

  // Actions - Filtering
  setFilters: (filters: Partial<TableFilters>) => void;
  setSearchQuery: (query: string) => void;
  setFilter: (key: string, value: any) => void;
  removeFilter: (key: string) => void;
  resetFilters: () => void;

  // Actions - Columns
  setColumnOrder: (order: string[]) => void;
  setColumnVisibility: (visibility: Record<string, boolean>) => void;
  toggleColumnVisibility: (columnId: string) => void;

  // Actions - Row Selection
  setRowSelection: (selection: Record<string, boolean>) => void;
  toggleRowSelection: (rowId: string) => void;
  selectAll: (rowIds: string[]) => void;
  clearSelection: () => void;

  // Reset all
  reset: () => void;
}

const initialPagination: PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};

const initialSorting: SortingState[] = [];

const initialFilters: TableFilters = {
  searchQuery: '',
};

const initialColumnOrder: string[] = [];

const initialColumnVisibility: Record<string, boolean> = {};

export const useTableStore = create<TableState>()(
  persist(
    (set, get) => ({
      // Initial state
      pagination: initialPagination,
      sorting: initialSorting,
      filters: initialFilters,
      columnOrder: initialColumnOrder,
      columnVisibility: initialColumnVisibility,
      rowSelection: {},

      // Pagination actions
      setPagination: (pagination) => {
        set({ pagination });
      },

      setPageIndex: (pageIndex: number) => {
        set((state) => ({
          pagination: { ...state.pagination, pageIndex },
        }));
      },

      setPageSize: (pageSize: number) => {
        set((state) => ({
          pagination: { ...state.pagination, pageSize, pageIndex: 0 },
        }));
      },

      resetPagination: () => {
        set({ pagination: initialPagination });
      },

      // Sorting actions
      setSorting: (sorting) => {
        set({ sorting });
      },

      addSort: (id: string, desc = false) => {
        set((state) => {
          const existing = state.sorting.find((s) => s.id === id);
          if (existing) {
            return {
              sorting: state.sorting.map((s) =>
                s.id === id ? { ...s, desc } : s
              ),
            };
          }
          return { sorting: [...state.sorting, { id, desc }] };
        });
      },

      removeSort: (id: string) => {
        set((state) => ({
          sorting: state.sorting.filter((s) => s.id !== id),
        }));
      },

      resetSorting: () => {
        set({ sorting: initialSorting });
      },

      // Filtering actions
      setFilters: (filters) => {
        set((state) => ({ filters: { ...state.filters, ...filters } }));
      },

      setSearchQuery: (query: string) => {
        set((state) => ({
          filters: { ...state.filters, searchQuery: query },
          pagination: { ...state.pagination, pageIndex: 0 },
        }));
      },

      setFilter: (key: string, value: any) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }));
      },

      removeFilter: (key: string) => {
        set((state) => {
          const newFilters = { ...state.filters };
          delete newFilters[key];
          return { filters: newFilters };
        });
      },

      resetFilters: () => {
        set({ filters: initialFilters });
      },

      // Column actions
      setColumnOrder: (order) => {
        set({ columnOrder: order });
      },

      setColumnVisibility: (visibility) => {
        set({ columnVisibility: visibility });
      },

      toggleColumnVisibility: (columnId: string) => {
        set((state) => ({
          columnVisibility: {
            ...state.columnVisibility,
            [columnId]: !state.columnVisibility[columnId],
          },
        }));
      },

      // Row selection actions
      setRowSelection: (selection) => {
        set({ rowSelection: selection });
      },

      toggleRowSelection: (rowId: string) => {
        set((state) => ({
          rowSelection: {
            ...state.rowSelection,
            [rowId]: !state.rowSelection[rowId],
          },
        }));
      },

      selectAll: (rowIds: string[]) => {
        const allSelected = rowIds.reduce(
          (acc, id) => ({ ...acc, [id]: true }),
          {}
        );
        set({ rowSelection: allSelected });
      },

      clearSelection: () => {
        set({ rowSelection: {} });
      },

      // Reset all
      reset: () => {
        set({
          pagination: initialPagination,
          sorting: initialSorting,
          filters: initialFilters,
          columnOrder: initialColumnOrder,
          columnVisibility: initialColumnVisibility,
          rowSelection: {},
        });
      },
    }),
    {
      name: 'table-storage',
      partialize: (state) => ({
        pagination: state.pagination,
        sorting: state.sorting,
        filters: state.filters,
        columnOrder: state.columnOrder,
        columnVisibility: state.columnVisibility,
      }),
    }
  )
);
