
import { useMemo } from 'react';
import { useFinance } from "@/contexts/FinanceContext";

interface UseReportDataProps {
  activeReport: 'unpaid-expenses' | 'paid-expenses' | 'unreceived-revenues' | 'received-revenues';
  dateRange: { from?: Date; to?: Date };
}

export const useReportData = ({ activeReport, dateRange }: UseReportDataProps) => {
  const { payableAccounts, receivableAccounts, transactions, categories } = useFinance();

  const expenseCategories = categories.filter(cat => cat.type === 'despesa');
  const revenueCategories = categories.filter(cat => cat.type === 'receita');

  const reportData = useMemo(() => {
    let data: any[] = [];
    let categoriesData: any[] = [];
    let title = '';

    switch (activeReport) {
      case 'unpaid-expenses':
        data = payableAccounts.filter(p => !p.isPaid);
        categoriesData = expenseCategories;
        title = 'Despesas a Pagar por Categoria';
        break;
      case 'paid-expenses':
        // Incluir despesas pagas das contas a pagar E lançamentos manuais de despesa
        const paidExpenses = payableAccounts.filter(p => p.isPaid);
        const manualExpenses = transactions.filter(t => t.type === 'despesa' && t.source_type === 'manual');
        data = [...paidExpenses, ...manualExpenses];
        categoriesData = expenseCategories;
        title = 'Despesas Pagas por Categoria';
        break;
      case 'unreceived-revenues':
        data = receivableAccounts.filter(r => !r.isReceived);
        categoriesData = revenueCategories;
        title = 'Receitas a Receber por Categoria';
        break;
      case 'received-revenues':
        // Incluir receitas recebidas das contas a receber E lançamentos manuais de receita
        const receivedRevenues = receivableAccounts.filter(r => r.isReceived);
        const manualRevenues = transactions.filter(t => t.type === 'receita' && t.source_type === 'manual');
        data = [...receivedRevenues, ...manualRevenues];
        categoriesData = revenueCategories;
        title = 'Receitas Recebidas por Categoria';
        break;
    }

    // Filtrar por data se especificado
    if (dateRange.from || dateRange.to) {
      data = data.filter(item => {
        let dateToCheck: Date;
        
        if (activeReport === 'paid-expenses') {
          if (item.paidDate) {
            dateToCheck = new Date(item.paidDate);
          } else if (item.payment_date) {
            dateToCheck = new Date(item.payment_date);
          } else {
            dateToCheck = new Date(item.dueDate);
          }
        } else if (activeReport === 'received-revenues') {
          if (item.receivedDate) {
            dateToCheck = new Date(item.receivedDate);
          } else if (item.payment_date) {
            dateToCheck = new Date(item.payment_date);
          } else {
            dateToCheck = new Date(item.dueDate);
          }
        } else {
          dateToCheck = new Date(item.dueDate);
        }

        if (dateRange.from && dateToCheck < dateRange.from) return false;
        if (dateRange.to && dateToCheck > dateRange.to) return false;
        return true;
      });
    }

    // Agrupar por categoria
    const groupedData = categoriesData.map(category => {
      const categoryItems = data.filter(item => {
        // Para lançamentos manuais, usar category_id
        if (item.category_id) {
          return item.category_id === category.id;
        }
        // Para contas a pagar/receber, usar categoryId
        return item.categoryId === category.id;
      });
      
      const total = categoryItems.reduce((sum, item) => sum + item.value, 0);
      
      return {
        categoryName: category.name,
        total,
        count: categoryItems.length,
        items: categoryItems
      };
    }).filter(group => group.count > 0);

    const grandTotal = groupedData.reduce((sum, group) => sum + group.total, 0);

    return {
      title,
      data: groupedData,
      grandTotal,
      period: dateRange.from && dateRange.to 
        ? `${dateRange.from.toLocaleDateString('pt-BR')} - ${dateRange.to.toLocaleDateString('pt-BR')}`
        : 'Total Acumulado'
    };
  }, [activeReport, payableAccounts, receivableAccounts, transactions, expenseCategories, revenueCategories, dateRange]);

  return reportData;
};
