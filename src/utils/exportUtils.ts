import * as XLSX from 'xlsx';

export function exportToCsv(data: Record<string, any>[], filename = 'sage50_report.csv') {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(data: Record<string, any>[], sheetName = 'Sage50_Report', filename = 'sage50_export.xlsx') {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

export function exportMultiSheetExcel(
  sheets: { name: string; data: Record<string, any>[] }[],
  filename = 'sage50_full_export.xlsx'
) {
  const workbook = XLSX.utils.book_new();
  sheets.forEach((s) => {
    if (s.data && s.data.length > 0) {
      const ws = XLSX.utils.json_to_sheet(s.data);
      XLSX.utils.book_append_sheet(workbook, ws, s.name.substring(0, 31));
    }
  });
  XLSX.writeFile(workbook, filename);
}

export function printCurrentReport(title: string) {
  window.print();
}
