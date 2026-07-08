/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { useEmployees } from '@/modules/masters/employees/hooks/useEmployees';
import { usePayrolls } from './usePayroll';
import { usePayments } from './usePayments';
import { useProductionEntries } from '@/modules/production/hooks/useProduction';
import type { PayrollLedgerSummary, PayrollTransaction } from '@frms/shared';
import { PaymentEffect, PaymentType, ProductionStatus } from '@frms/shared';

export function usePayrollLedger(periodStart: string | null, periodEnd: string | null) {
  const { data: rawEmployees, isLoading: loadingEmp } = useEmployees();
  const { data: rawPayrolls, isLoading: loadingPayrolls } = usePayrolls();
  const { data: rawPayments, isLoading: loadingPayments } = usePayments();
  const { data: rawProductions, isLoading: loadingProd } = useProductionEntries();

  const employees = rawEmployees || [];
  const payrolls = rawPayrolls || [];
  const payments = rawPayments || [];
  const productions = rawProductions || [];

  const isLoading = loadingEmp || loadingPayrolls || loadingPayments || loadingProd;

  const ledger = useMemo(() => {
    if (!employees.length || !periodStart || !periodEnd) return [];

    const startMs = new Date(periodStart).getTime();
    const endMs = new Date(periodEnd).getTime();

    // Filter production to current period
    const periodProductions = productions.filter((p: any) => {
      const ms = new Date(p.date).getTime();
      return ms >= startMs && ms <= endMs && p.status === ProductionStatus.APPROVED;
    });

    // Map by employee
    return employees.map((emp: any): PayrollLedgerSummary => {
      
      // Calculate All-Time Transactions for the Ledger
      const empPayrolls = payrolls.filter((p: any) => p.employeeId === emp.id);
      const empPayments = payments.filter((p: any) => p.employeeId === emp.id);
      
      const rawTransactions: Omit<PayrollTransaction, 'runningBalance'>[] = [];
      
      // Add Payroll Generations
      empPayrolls.forEach((hp: any) => {
        const pStart = hp.periodStart ? hp.periodStart.split('T')[0] : hp.payrollPeriodStart;
        const pEnd = hp.periodEnd ? hp.periodEnd.split('T')[0] : hp.payrollPeriodEnd;
        rawTransactions.push({
          id: hp.id,
          date: pEnd, // Use end of period as transaction date
          description: `Payroll Generated (${pStart} to ${pEnd})`,
          amount: Number(hp.grossWage || hp.grossPay || 0), // Handle both Prisma model and API schema naming
          type: 'CREDIT'
        });
      });
      
      // Add Payments (Advances, Fines, Salaries, etc)
      empPayments.forEach((pay: any) => {
        let desc = pay.type.replace('_', ' ');
        if (pay.reason) desc += ` - ${pay.reason}`;
        
        // ADDITION payments (e.g. Festival Bonus) are CREDIT
        // DEDUCTION payments (e.g. Advance, Fine, Salary Paid) are DEBIT
        rawTransactions.push({
          id: pay.id,
          date: pay.date,
          description: desc,
          amount: pay.amount,
          type: (pay.effect === PaymentEffect.ADDITION && pay.type !== PaymentType.SALARY) ? 'CREDIT' : 'DEBIT'
        });
      });
      
      // Sort chronologically
      rawTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Compute running balance
      let runningBalance = 0;
      const transactions: PayrollTransaction[] = rawTransactions.map(tx => {
        if (tx.type === 'CREDIT') {
          runningBalance += tx.amount;
        } else {
          runningBalance -= tx.amount;
        }
        return {
          ...tx,
          runningBalance
        };
      });

      // Calculate Opening Balance (Run balance up to just before periodStart)
      const historicalTxs = transactions.filter(t => new Date(t.date).getTime() < startMs);
      const openingBalance = historicalTxs.length > 0 ? historicalTxs[historicalTxs.length - 1]?.runningBalance || 0 : 0;
      
      // Current Period
      const currentProd = periodProductions.filter((p: any) => p.employeeId === emp.id);
      
      // Calculate Live Production metrics
      let computedTotalHours = 0;
      let productionQty = 0;
      let productionBonus = 0;
      
      currentProd.forEach((prod: any) => {
        computedTotalHours += Number(prod.hoursWorked) || 0;
        
        prod.details.forEach((d: any) => {
          productionQty += Number(d.totalStitches) || 0;
        });
        productionBonus += Number(prod.bonus) || 0;
      });
      
      // Check if there is an already GENERATED payroll for this period
      const generatedPayroll = empPayrolls.find((p: any) => {
        // The API returns Prisma records which have periodStart/periodEnd as ISO strings
        const pStart = p.periodStart ? p.periodStart.split('T')[0] : p.payrollPeriodStart;
        const pEnd = p.periodEnd ? p.periodEnd.split('T')[0] : p.payrollPeriodEnd;
        return pStart === periodStart && pEnd === periodEnd;
      });
      
      let basicSalary = 0;
      let payrollBonus = 0;
      let hourlyRate = 0;
      let totalHours = 0;
      
      if (generatedPayroll) {
        // Fallback to current employee rate and computed hours if not present on the generated payroll record (schema lacks these fields)
        hourlyRate = Number(generatedPayroll.hourlyRate) || Number(emp.hourlyRate) || 0;
        basicSalary = Number(generatedPayroll.basicWage) || 0;
        payrollBonus = Number(generatedPayroll.bonus) || 0;
        totalHours = Number(generatedPayroll.totalHours) || computedTotalHours; 
      } else {
        hourlyRate = Number(emp.hourlyRate) || 0;
        totalHours = computedTotalHours;
        basicSalary = totalHours * hourlyRate;
        payrollBonus = productionBonus;
      }
      
      // Current Period Payments
      const currentPayments = empPayments.filter((p: any) => new Date(p.date).getTime() >= startMs && new Date(p.date).getTime() <= endMs);
      
      let payrollAdditions = 0;
      let payrollDeductions = 0;
      let advancesTaken = 0;
      let finesIncurred = 0;
      let salaryPaid = 0;
      
      currentPayments.forEach((pay: any) => {
        const amt = Number(pay.amount) || 0;
        if (pay.type === PaymentType.SALARY) {
          salaryPaid += amt;
        } else if (pay.type === PaymentType.ADVANCE || pay.type === PaymentType.LOAN) {
          advancesTaken += amt;
          salaryPaid += amt; // Treat advances as prepaid salary
        } else if (pay.type === PaymentType.FINE) {
          finesIncurred += amt;
          payrollDeductions += amt;
        } else if (pay.effect === PaymentEffect.ADDITION) {
          payrollAdditions += amt;
        } else if (pay.effect === PaymentEffect.DEDUCTION) {
          payrollDeductions += amt;
        }
      });
      
      const grossSalary = basicSalary + payrollBonus + payrollAdditions;
      const netSalary = grossSalary - payrollDeductions;
      
      // The user explicitly requested: Balance Remaining = Net Salary - Amount Paid
      const closingBalance = netSalary - salaryPaid;
      
      let paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' = 'UNPAID';
      if (closingBalance <= 0) {
        paymentStatus = 'PAID';
      } else if (salaryPaid > 0) {
        paymentStatus = 'PARTIALLY_PAID';
      }
      
      return {
        employeeId: emp.id!,
        employeeName: emp.name,
        department: 'Production',
        totalHours: Number(totalHours.toFixed(2)),
        productionQty,
        productionBonus,
        hourlyRate,
        basicSalary,
        payrollBonus,
        payrollAdditions,
        payrollDeductions,
        netSalary,
        openingBalance,
        advancesTaken,
        finesIncurred,
        salaryPaid,
        closingBalance,
        paymentStatus,
        hasGeneratedPayroll: !!generatedPayroll,
        transactions
      };
    });
  }, [employees, periodStart, periodEnd, productions, payrolls, payments]);

  // Overall check if ANY payroll is generated for the selected period
  const hasGeneratedPayrollForPeriod = useMemo(() => {
    return ledger.some(l => l.hasGeneratedPayroll);
  }, [ledger]);

  return {
    ledger,
    isLoading,
    hasGeneratedPayrollForPeriod
  };
}
