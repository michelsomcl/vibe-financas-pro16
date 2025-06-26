
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/tableUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useFinance } from "@/contexts/FinanceContext";

interface ReportTableProps {
  reportData: {
    title: string;
    data: Array<{
      categoryName: string;
      total: number;
      count: number;
      items: any[];
    }>;
    grandTotal: number;
    period: string;
  };
  showDetailed?: boolean;
}

export default function ReportTable({ reportData, showDetailed = false }: ReportTableProps) {
  const { clientsSuppliers } = useFinance();

  const getClientSupplierName = (item: any) => {
    // Para transações, usar client_supplier_id
    if (item.client_supplier_id) {
      const clientSupplier = clientsSuppliers.find(cs => cs.id === item.client_supplier_id);
      return clientSupplier?.name || 'N/A';
    }
    // Para contas, usar clientId ou supplierId
    const clientSupplier = clientsSuppliers.find(cs => 
      cs.id === item.clientId || cs.id === item.supplierId
    );
    return clientSupplier?.name || 'N/A';
  };

  const getFormattedDate = (item: any, activeReport: string) => {
    let dateToUse = null;
    
    if (activeReport === 'paid-expenses' || activeReport === 'received-revenues') {
      // Para transações (despesas pagas/receitas recebidas)
      if (item.payment_date) {
        dateToUse = item.payment_date;
      } else if (item.paidDate) {
        dateToUse = item.paidDate;
      } else if (item.receivedDate) {
        dateToUse = item.receivedDate;
      } else if (item.due_date) {
        dateToUse = item.due_date;
      } else if (item.dueDate) {
        dateToUse = item.dueDate;
      }
    } else {
      // Para contas a pagar/receber
      if (item.due_date) {
        dateToUse = item.due_date;
      } else if (item.dueDate) {
        dateToUse = item.dueDate;
      }
    }
    
    // Se não encontrou nenhuma data válida, retornar uma string padrão
    if (!dateToUse) {
      return '-';
    }

    try {
      return formatDate(dateToUse);
    } catch (error) {
      console.error('Erro ao formatar data:', error, 'Item:', item);
      return '-';
    }
  };

  // Função para ordenar itens por data de vencimento
  const sortItemsByDueDate = (items: any[]) => {
    return [...items].sort((a, b) => {
      const getDateForSort = (item: any) => {
        if (item.due_date) return new Date(item.due_date);
        if (item.dueDate) return new Date(item.dueDate);
        if (item.payment_date) return new Date(item.payment_date);
        return new Date(0); // fallback para data muito antiga
      };
      
      const dateA = getDateForSort(a);
      const dateB = getDateForSort(b);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Determinar o tipo de relatório baseado no título
  const getReportType = () => {
    if (reportData.title.includes('Paga')) return 'paid-expenses';
    if (reportData.title.includes('Recebida')) return 'received-revenues';
    if (reportData.title.includes('Pagar')) return 'unpaid-expenses';
    if (reportData.title.includes('Receber')) return 'unreceived-revenues';
    return 'other';
  };

  return (
    <div className="p-6">
      <div className="header text-center mb-6">
        <h2 className="text-2xl font-bold text-tertiary mb-2">
          {reportData.title} {showDetailed && '- Detalhado'}
        </h2>
        <p className="text-gray-600">Período: {reportData.period}</p>
        <p className="text-sm text-gray-500">
          Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>

      {reportData.data.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum dado encontrado para o período selecionado</p>
        </div>
      ) : (
        <>
          {showDetailed ? (
            // Relatório Detalhado
            <div className="space-y-6">
              {reportData.data.map((category, categoryIndex) => (
                <div key={categoryIndex} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-tertiary mb-4">
                    {category.categoryName}
                  </h3>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente/Fornecedor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Observações</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortItemsByDueDate(category.items).map((item, itemIndex) => (
                        <TableRow key={itemIndex}>
                          <TableCell>{getClientSupplierName(item)}</TableCell>
                          <TableCell>{getFormattedDate(item, getReportType())}</TableCell>
                          <TableCell className="max-w-xs truncate">{item.observations || '-'}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={3}>Subtotal - {category.categoryName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(category.total)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ))}
              
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="bg-primary text-white p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">TOTAL GERAL</span>
                    <span className="text-xl font-bold">{formatCurrency(reportData.grandTotal)}</span>
                  </div>
                  <div className="text-sm opacity-90">
                    {reportData.data.reduce((sum, cat) => sum + cat.count, 0)} item(s) no total
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Relatório Resumido
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Categoria</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.data.map((category, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{category.categoryName}</TableCell>
                      <TableCell className="text-center">{category.count}</TableCell>
                      <TableCell className="text-right">{formatCurrency(category.total)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="total bg-gray-50 font-bold">
                    <TableCell>TOTAL GERAL</TableCell>
                    <TableCell className="text-center">
                      {reportData.data.reduce((sum, cat) => sum + cat.count, 0)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(reportData.grandTotal)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Resumo por Categoria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportData.data.map((category, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium text-tertiary">{category.categoryName}</h4>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(category.total)}</p>
                      <p className="text-sm text-gray-500">{category.count} item(s)</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
