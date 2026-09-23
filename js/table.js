const TABLE_STORAGE_KEY = "rms.selectedTable";

export const tableOptions = [
  "T-01", "T-02", "T-03", "T-04", "T-05", "T-06", "T-07", "T-08"
];

export function getSelectedTable() {
  return window.localStorage.getItem(TABLE_STORAGE_KEY);
}

export function saveSelectedTable(tableNumber) {
  window.localStorage.setItem(TABLE_STORAGE_KEY, tableNumber);
}

export function isValidTable(tableNumber) {
  return tableOptions.includes(tableNumber);
}
