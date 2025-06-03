
import { useDashboardData } from "./useDashboardData";
import { isAfter } from "date-fns";

interface DashboardFilters {
  dateRange?: { from?: Date; to?: Date };
  categoryIds?: string[];
}

export const useDashboardCalculations = (filters?: DashboardFilters) => {
  const {
    currentMonthPayables,
    currentMonthReceivables,
    currentMonthTransactions,
    monthStart,
    monthEnd,
    payableAccounts,
    receivableAccounts,
    hasDateFilter
  } = useDashboardData(filters);

  // Calcular totais das contas pagas no período (usando data de pagamento)
  const paidExpenses = payableAccounts
    .filter(p => p.isPaid && p.paidDate)
    .filter(p => {
      const paidDate = new Date(p.paidDate);
      return paidDate >= monthStart && paidDate <= monthEnd;
    })
    .reduce((sum, p) => sum + p.value, 0);

  const receivedRevenues = receivableAccounts
    .filter(r => r.isReceived && r.receivedDate)
    .filter(r => {
      const receivedDate = new Date(r.receivedDate);
      return receivedDate >= monthStart && receivedDate <= monthEnd;
    })
    .reduce((sum, r) => sum + r.value, 0);

  // Calcular totais das contas não pagas com vencimento no período
  // Se não há filtro de data, incluir TODOS os lançamentos futuros (parcelados/recorrentes)
  const unpaidExpenses = payableAccounts
    .filter(p => !p.isPaid)
    .filter(p => {
      if (!hasDateFilter) {
        // Sem filtro de data: incluir todos os lançamentos não pagos
        return true;
      } else {
        // Com filtro de data: usar o período especificado
        const dueDate = new Date(p.dueDate);
        return dueDate >= monthStart && dueDate <= monthEnd;
      }
    })
    .reduce((sum, p) => sum + p.value, 0);

  const unreceiveredRevenues = receivableAccounts
    .filter(r => !r.isReceived)
    .filter(r => {
      if (!hasDateFilter) {
        // Sem filtro de data: incluir todos os lançamentos não recebidos
        return true;
      } else {
        // Com filtro de data: usar o período especificado
        const dueDate = new Date(r.dueDate);
        return dueDate >= monthStart && dueDate <= monthEnd;
      }
    })
    .reduce((sum, r) => sum + r.value, 0);

  // Calcular apenas lançamentos manuais (não vindos de contas a pagar/receber)
  const manualExpenses = currentMonthTransactions
    .filter(t => t.type === 'despesa' && t.sourceType === 'manual')
    .reduce((sum, t) => sum + t.value, 0);

  const manualRevenues = currentMonthTransactions
    .filter(t => t.type === 'receita' && t.sourceType === 'manual')
    .reduce((sum, t) => sum + t.value, 0);

  // Totais finais (sem duplicação)
  const totalPaidExpenses = paidExpenses + manualExpenses;
  const totalReceivedRevenues = receivedRevenues + manualRevenues;

  const balancePaid = totalReceivedRevenues - totalPaidExpenses;
  const balanceUnpaid = unreceiveredRevenues - unpaidExpenses;

  // Contas vencidas (sempre considerar data atual, independente dos filtros)
  const today = new Date();
  const overduePayables = payableAccounts
    .filter(p => !p.isPaid && isAfter(today, new Date(p.dueDate)))
    .reduce((sum, p) => sum + p.value, 0);
    
  const overdueReceivables = receivableAccounts
    .filter(r => !r.isReceived && isAfter(today, new Date(r.dueDate)))
    .reduce((sum, r) => sum + r.value, 0);

  return {
    totalPaidExpenses,
    unpaidExpenses,
    totalReceivedRevenues,
    unreceiveredRevenues,
    balancePaid,
    balanceUnpaid,
    overduePayables,
    overdueReceivables
  };
};
