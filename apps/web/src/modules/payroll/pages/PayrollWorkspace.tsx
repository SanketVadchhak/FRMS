/* eslint-disable @typescript-eslint/no-explicit-any */
 
import React, { useState } from 'react';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { Users, Receipt, Banknote, ShieldAlert, ArrowDownUp, FileDown, Plus, Wallet, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

import { usePayrollLedger } from '../hooks/usePayrollLedger';
import { PAYROLL_WORKSPACE_COLUMNS } from '@/config/table-columns/payroll-workspace-columns';
import type { PayrollWorkspaceContext } from '@/config/table-columns/payroll-workspace-columns';
import type { PayrollLedgerSummary } from '@frms/shared';
import { exportPayrollToCSV, downloadPayslipPDF } from '../utils/export';

// Dialogs
import { GeneratePayrollDialog } from '../components/GeneratePayrollDialog';
import { RecordAdvanceDialog } from '../components/RecordAdvanceDialog';
import { RecordFineDialog } from '../components/RecordFineDialog';
import { RecordAdjustmentDialog } from '../components/RecordAdjustmentDialog';
import { PaySalaryDialog } from '../components/PaySalaryDialog';
import { EmployeeLedgerModal } from '../components/EmployeeLedgerModal';

export function PayrollWorkspace() {
  const [periodStart, setPeriodStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); 
    return d.toISOString().split('T')[0] as string;
  });
  
  const [periodEnd, setPeriodEnd] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0); 
    return d.toISOString().split('T')[0] as string;
  });

  const { ledger, isLoading, hasGeneratedPayrollForPeriod } = usePayrollLedger(periodStart, periodEnd);
  
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Dialog States
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [isFineOpen, setIsFineOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  
  const [paySalaryEmp, setPaySalaryEmp] = useState<PayrollLedgerSummary | null>(null);
  const [viewLedgerEmp, setViewLedgerEmp] = useState<PayrollLedgerSummary | null>(null);
  
  const [recordAdvanceEmpId, setRecordAdvanceEmpId] = useState<string | undefined>(undefined);
  const [recordFineEmpId, setRecordFineEmpId] = useState<string | undefined>(undefined);
  const [recordAdjEmpId, setRecordAdjEmpId] = useState<string | undefined>(undefined);

  const columnProps = useColumnPreferences('frms_payroll_workspace_columns', PAYROLL_WORKSPACE_COLUMNS);
  const { orderedVisibleColumns } = columnProps;

  const tableContext: PayrollWorkspaceContext = {
    onPaySalary: (emp: any) => setPaySalaryEmp(emp),
    onRecordAdvance: (emp: any) => { setRecordAdvanceEmpId(emp.employeeId); setIsAdvanceOpen(true); },
    onRecordFine: (emp: any) => { setRecordFineEmpId(emp.employeeId); setIsFineOpen(true); },
    onRecordAdjustment: (emp: any) => { setRecordAdjEmpId(emp.employeeId); setIsAdjustmentOpen(true); },
    onViewLedger: (emp: any) => setViewLedgerEmp(emp),
    onDownloadPayslip: (emp: any) => downloadPayslipPDF(emp, periodStart, periodEnd)
  };

  const handleExport = () => {
    exportPayrollToCSV(ledger, periodStart, periodEnd);
  };

  // Calculate overall totals
  const totalEmployees = ledger.length;
  const totalGross = ledger.reduce((sum: number, r: any) => sum + r.basicSalary + r.payrollBonus + r.payrollAdditions, 0);
  const totalDeductions = ledger.reduce((sum: number, r: any) => sum + r.payrollDeductions, 0);
  const totalPaid = ledger.reduce((sum: number, r: any) => sum + r.salaryPaid, 0);
  const netRemaining = ledger.reduce((sum: number, r: any) => sum + r.closingBalance, 0);

  return (
    <div className="flex flex-col min-h-full lg:h-[calc(100vh-80px)] bg-background relative overflow-hidden lg:overflow-visible">
      <div className="px-6 pt-6 pb-2 border-b flex-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payroll Workspace</h1>
            <p className="text-sm text-muted-foreground">Employee-centric ledger and payroll management.</p>
          </div>
          <div className="flex items-center self-start lg:self-auto overflow-x-auto w-full lg:w-auto pb-1 hide-scrollbar">
            <div className="flex items-center space-x-2 bg-muted/50 p-1 rounded-md border shrink-0">
              <span className="text-xs font-medium text-muted-foreground px-2 hidden sm:inline">Period:</span>
              <input 
                type="date"
                value={periodStart}
                onChange={e => setPeriodStart(e.target.value)}
                className="text-sm bg-transparent border-none focus:ring-0 p-1 w-[120px] sm:w-32"
              />
              <span className="text-muted-foreground">-</span>
              <input 
                type="date"
                value={periodEnd}
                onChange={e => setPeriodEnd(e.target.value)}
                className="text-sm bg-transparent border-none focus:ring-0 p-1 w-[120px] sm:w-32"
              />
            </div>
          </div>
        </div>
        
        {/* Action Bar */}
        <div className="flex overflow-x-auto items-center gap-2 pb-4 hide-scrollbar">
          <button onClick={() => setIsGenerateOpen(true)} className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
            <Receipt className="w-4 h-4 mr-2" /> Generate Payroll
          </button>
          <button onClick={() => { setRecordAdvanceEmpId(undefined); setIsAdvanceOpen(true); }} className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            <Plus className="w-4 h-4 mr-2" /> Record Advance
          </button>
          <button onClick={() => { setRecordFineEmpId(undefined); setIsFineOpen(true); }} className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            <ShieldAlert className="w-4 h-4 mr-2" /> Record Fine
          </button>
          <button onClick={() => { setRecordAdjEmpId(undefined); setIsAdjustmentOpen(true); }} className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            <ArrowDownUp className="w-4 h-4 mr-2" /> Record Adjustment
          </button>
          <div className="flex-1 hidden md:block"></div>
          <button onClick={handleExport} className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
            <FileDown className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-3 md:p-4 flex items-center gap-3 col-span-2 lg:col-span-1">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-medium text-muted-foreground truncate">Total Employees</h3>
              <div className="text-lg font-bold mt-0.5 truncate">{isLoading ? '...' : totalEmployees.toString()}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Employees</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <Banknote className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-medium text-muted-foreground truncate">Total Gross Salary</h3>
              <div className="text-lg font-bold mt-0.5 truncate">{isLoading ? '...' : formatCurrency(totalGross)}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Basic + Bonus + Additions</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-3 md:p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <ArrowDown className="h-5 w-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-medium text-muted-foreground truncate">Total Deductions</h3>
              <div className="text-lg font-bold mt-0.5 truncate">{isLoading ? '...' : formatCurrency(totalDeductions)}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Fines + Deductions</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-3 md:p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-medium text-muted-foreground truncate">Salary Paid</h3>
              <div className="text-lg font-bold mt-0.5 truncate">{isLoading ? '...' : formatCurrency(totalPaid)}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Advances + Salary</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-3 md:p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-medium text-muted-foreground truncate">Outstanding Balance</h3>
              <div className="text-lg font-bold mt-0.5 truncate">{isLoading ? '...' : formatCurrency(netRemaining)}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Gross - Deductions - Paid</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card border rounded-xl shadow-sm flex flex-col min-h-[400px]">
          {!hasGeneratedPayrollForPeriod && ledger.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Receipt className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No payroll has been generated for this period.</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                You can generate the payroll to lock the current production and payment data into permanent records.
              </p>
              <button onClick={() => setIsGenerateOpen(true)} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6">
                <Receipt className="w-4 h-4 mr-2" /> Generate Payroll Now
              </button>
            </div>
          ) : (
            <div className="w-full overflow-x-auto relative rounded-t-xl hide-scrollbar flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/40 sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-muted/20">
                  <tr>
                    {orderedVisibleColumns.map(colId => {
                      const col = PAYROLL_WORKSPACE_COLUMNS.find(c => c.id === colId);
                      if (!col) return null;
                                  const isRight = ['totalHours', 'hourlyRate', 'salary', 'productionBonus', 'additions', 'deductions', 'netSalary', 'amountPaid', 'balanceRemaining'].includes(colId);
                      return (
                        <th 
                          key={colId}
                          className={`px-4 py-3 font-medium whitespace-nowrap tracking-wider ${isRight ? 'text-right' : ''}`}
                        >
                          {col.label}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan={orderedVisibleColumns.length} className="px-4 py-8 text-center text-muted-foreground">
                        No employees found.
                      </td>
                    </tr>
                  ) : (
                    ledger.map((row: any) => (
                      <React.Fragment key={row.employeeId}>
                        <tr 
                          className={`group transition-colors hover:bg-muted/40 cursor-pointer ${expandedRow === row.employeeId ? 'bg-muted/20' : ''}`}
                          onClick={() => setExpandedRow(prev => prev === row.employeeId ? null : row.employeeId)}
                        >
                          {orderedVisibleColumns.map(colId => {
                            const col = PAYROLL_WORKSPACE_COLUMNS.find(c => c.id === colId);
                            if (!col) return null;
                                  const isRight = ['totalHours', 'salary', 'productionBonus', 'additions', 'deductions', 'netSalary', 'amountPaid', 'balanceRemaining'].includes(colId);
                            const isCenter = ['status', 'actions'].includes(colId);
                            
                            return (
                              <td 
                                key={colId} 
                                className={`px-4 py-3 text-sm border-b border-border/30 ${isRight ? 'text-right tabular-nums' : isCenter ? 'text-center' : ''}`}
                              >
                                {col.render?.(row, tableContext) ?? '—'}
                              </td>
                            );
                          })}
                        </tr>
                        {expandedRow === row.employeeId && (
                          <tr>
                            <td colSpan={orderedVisibleColumns.length} className="p-0 border-b border-border/30">
                              <div className="p-6 bg-muted/20 border-b shadow-inner grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-200">
                                {/* Current Period */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold border-b pb-2">Current Period</h4>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Working Hours:</span>
                                    <span>{row.totalHours} hrs</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Production Qty:</span>
                                    <span>{row.productionQty} pcs</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Prod. Bonus:</span>
                                    <span className="text-primary">{formatCurrency(row.productionBonus)}</span>
                                  </div>
                                </div>

                                {/* Payroll */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold border-b pb-2">Payroll</h4>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Basic Salary:</span>
                                    <span>{formatCurrency(row.basicSalary)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Bonus:</span>
                                    <span className="text-primary">+{formatCurrency(row.payrollBonus)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Additions:</span>
                                    <span className="text-primary">+{formatCurrency(row.payrollAdditions)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Deductions:</span>
                                    <span className="text-destructive">-{formatCurrency(row.payrollDeductions)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                                    <span>Net Salary:</span>
                                    <span>{formatCurrency(row.netSalary)}</span>
                                  </div>
                                </div>

                                {/* Payments */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold border-b pb-2">Payments & Ledger</h4>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Opening Balance:</span>
                                    <span>{formatCurrency(row.openingBalance)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Advances Taken:</span>
                                    <span>{formatCurrency(row.advancesTaken)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Salary Paid:</span>
                                    <span className="text-green-600">{formatCurrency(row.salaryPaid)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm font-bold border-t pt-2">
                                    <span>Outstanding Balance:</span>
                                    <span className={row.closingBalance > 0 ? "text-destructive" : ""}>{formatCurrency(row.closingBalance)}</span>
                                  </div>
                                </div>

                                {/* History */}
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold border-b pb-2">History & Actions</h4>
                                  <button onClick={() => setViewLedgerEmp(row)} className="text-sm text-primary hover:underline text-left block w-full">View Permanent Ledger</button>
                                  <button onClick={() => downloadPayslipPDF(row, periodStart, periodEnd)} className="text-sm text-primary hover:underline text-left block w-full">Download Payslip</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <GeneratePayrollDialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen} defaultPeriodStart={periodStart} defaultPeriodEnd={periodEnd} />
      <RecordAdvanceDialog open={isAdvanceOpen} onOpenChange={setIsAdvanceOpen} defaultEmployeeId={recordAdvanceEmpId} />
      <RecordFineDialog open={isFineOpen} onOpenChange={setIsFineOpen} defaultEmployeeId={recordFineEmpId} />
      <RecordAdjustmentDialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen} defaultEmployeeId={recordAdjEmpId} />
      <PaySalaryDialog 
        open={!!paySalaryEmp} 
        onOpenChange={(o) => !o && setPaySalaryEmp(null)} 
        defaultEmployeeId={paySalaryEmp?.employeeId}
        defaultAmount={paySalaryEmp?.closingBalance}
      />
      <EmployeeLedgerModal
        open={!!viewLedgerEmp}
        onOpenChange={(o) => !o && setViewLedgerEmp(null)}
        employee={viewLedgerEmp}
      />
    </div>
  );
}
