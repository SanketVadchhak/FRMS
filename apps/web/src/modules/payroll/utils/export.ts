import type { PayrollLedgerSummary } from '@frms/shared';
import { formatCurrency } from '@/utils/format';

export function exportPayrollToCSV(ledger: PayrollLedgerSummary[], periodStart: string, periodEnd: string) {
  const headers = [
    'Employee Code',
    'Employee Name',
    'Total Hours',
    'Production Qty',
    'Basic Salary',
    'Production Bonus',
    'Additions',
    'Deductions',
    'Advances Paid',
    'Fines',
    'Net Salary',
    'Amount Paid',
    'Closing Balance',
    'Status'
  ];

  const rows = ledger.map(emp => [
    emp.employeeId.slice(0, 8), // Assuming employee ID slice as code for now
    `"${emp.employeeName}"`,
    emp.totalHours,
    emp.productionQty,
    emp.basicSalary,
    emp.payrollBonus,
    emp.payrollAdditions,
    emp.payrollDeductions,
    emp.advancesTaken,
    emp.finesIncurred,
    emp.netSalary,
    emp.salaryPaid,
    emp.closingBalance,
    emp.paymentStatus
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Payroll_Register_${periodStart}_to_${periodEnd}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadPayslipPDF(emp: PayrollLedgerSummary, periodStart: string, periodEnd: string) {
  // For V1, we generate a printable HTML document in a new window and invoke print()
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payslip - ${emp.employeeName}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: bold; margin: 0; }
        .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { font-size: 16px; font-weight: 600; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border-bottom: 1px solid #ddd; padding: 12px 8px; text-align: left; }
        th { font-size: 13px; color: #666; text-transform: uppercase; }
        .right { text-align: right; }
        .total-row { font-weight: bold; background: #f9f9f9; }
        .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="padding: 8px 16px; cursor: pointer;">Print Payslip</button>
      </div>

      <div class="header">
        <div>
          <h1 class="title">Factory Resource Management</h1>
          <div class="subtitle">Official Payslip</div>
        </div>
        <div style="text-align: right;">
          <h2 style="margin:0; font-size: 18px;">${emp.employeeName}</h2>
          <div class="subtitle">Period: ${new Date(periodStart).toLocaleDateString()} to ${new Date(periodEnd).toLocaleDateString()}</div>
        </div>
      </div>

      <div class="grid">
        <div class="box">
          <div class="label">Total Hours</div>
          <div class="value">${emp.totalHours} hrs</div>
        </div>
        <div class="box">
          <div class="label">Production Quantity</div>
          <div class="value">${emp.productionQty} pcs</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Earnings</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary</td>
            <td class="right">${formatCurrency(emp.basicSalary)}</td>
          </tr>
          <tr>
            <td>Production Bonus</td>
            <td class="right">${formatCurrency(emp.payrollBonus)}</td>
          </tr>
          ${emp.payrollAdditions > 0 ? `
          <tr>
            <td>Other Additions</td>
            <td class="right">${formatCurrency(emp.payrollAdditions)}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td>Gross Earnings</td>
            <td class="right">${formatCurrency(emp.basicSalary + emp.payrollBonus + emp.payrollAdditions)}</td>
          </tr>
        </tbody>
      </table>

      <table>
        <thead>
          <tr>
            <th>Deductions</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Advances Taken</td>
            <td class="right">${formatCurrency(emp.advancesTaken)}</td>
          </tr>
          <tr>
            <td>Fines Incurred</td>
            <td class="right">${formatCurrency(emp.finesIncurred)}</td>
          </tr>
          ${emp.payrollDeductions - emp.advancesTaken - emp.finesIncurred > 0 ? `
          <tr>
            <td>Other Deductions</td>
            <td class="right">${formatCurrency(emp.payrollDeductions - emp.advancesTaken - emp.finesIncurred)}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td>Total Deductions</td>
            <td class="right">${formatCurrency(emp.payrollDeductions)}</td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; align-items: center; background: #333; color: white; padding: 20px; border-radius: 8px;">
        <div style="font-size: 18px;">Net Salary Payable</div>
        <div style="font-size: 24px; font-weight: bold;">${formatCurrency(emp.netSalary)}</div>
      </div>

      <div class="footer">
        This is a computer generated document. No signature is required.
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Auto print after images/styles load
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
