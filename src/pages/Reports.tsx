import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileDown, Printer, FileText, FileExcel } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { formatCurrency } from "@/utils/formatCurrency";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportTable from "@/components/reports/ReportTable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from 'xlsx';
import { usePdfGeneration } from "@/hooks/usePdfGeneration";

export default function Reports() {
  const { payableAccounts, receivableAccounts, categories, loading } = useFinance();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [activeReport, setActiveReport] = useState<'unpaid-expenses' | 'paid-expenses' | 'unreceived-revenues' | 'received-revenues'>('unpaid-expenses');
  const [showDetailed, setShowDetailed] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { generatePdf } = usePdfGeneration();

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
        data = payableAccounts.filter(p => p.isPaid);
        categoriesData = expenseCategories;
        title = 'Despesas Pagas por Categoria';
        break;
      case 'unreceived-revenues':
        data = receivableAccounts.filter(r => !r.isReceived);
        categoriesData = revenueCategories;
        title = 'Receitas a Receber por Categoria';
        break;
      case 'received-revenues':
        data = receivableAccounts.filter(r => r.isReceived);
        categoriesData = revenueCategories;
        title = 'Receitas Recebidas por Categoria';
        break;
    }

    // Filtrar por data se especificado
    if (dateRange.from || dateRange.to) {
      data = data.filter(item => {
        let dateToCheck: Date;
        
        if (activeReport === 'paid-expenses' && item.paidDate) {
          dateToCheck = new Date(item.paidDate);
        } else if (activeReport === 'received-revenues' && item.receivedDate) {
          dateToCheck = new Date(item.receivedDate);
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
      const categoryItems = data.filter(item => item.categoryId === category.id);
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
        ? `${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`
        : 'Total Acumulado'
    };
  }, [activeReport, payableAccounts, receivableAccounts, expenseCategories, revenueCategories, dateRange]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const handlePrintPdf = async () => {
    if (printRef.current) {
      try {
        const fileName = `${reportData.title.replace(/\s+/g, '_')}_${showDetailed ? 'Detalhado_' : ''}${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        await generatePdf(printRef.current, fileName);
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        // Aqui você poderia adicionar uma notificação de erro para o usuário
      }
    }
  };

  const handleSave = () => {
    // Preparar dados para Excel
    const excelData = [
      [reportData.title + (showDetailed ? ' - Detalhado' : '')],
      [`Período: ${reportData.period}`],
      [`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`],
      [] // linha vazia
    ];

    if (showDetailed) {
      // Formato detalhado
      reportData.data.forEach(category => {
        excelData.push([]);
        excelData.push([`CATEGORIA: ${category.categoryName}`]);
        excelData.push(['Cliente/Fornecedor', 'Data', 'Observações', 'Valor']);
        
        category.items.forEach(item => {
          const clientSupplierName = item.client?.name || item.supplier?.name || 'N/A';
          let dateToShow = '';
          
          if (activeReport === 'paid-expenses' && item.paidDate) {
            dateToShow = format(new Date(item.paidDate), 'dd/MM/yyyy');
          } else if (activeReport === 'received-revenues' && item.receivedDate) {
            dateToShow = format(new Date(item.receivedDate), 'dd/MM/yyyy');
          } else {
            dateToShow = format(new Date(item.dueDate), 'dd/MM/yyyy');
          }
          
          excelData.push([
            clientSupplierName,
            dateToShow,
            item.observations || '',
            item.value
          ]);
        });
        
        excelData.push([`Subtotal - ${category.categoryName}`, '', '', category.total]);
      });
    } else {
      // Formato resumido
      excelData.push(['Categoria', 'Quantidade', 'Total']);
      
      reportData.data.forEach(category => {
        excelData.push([
          category.categoryName,
          category.count,
          category.total
        ]);
      });
    }

    // Adicionar total geral
    excelData.push([
      'TOTAL GERAL',
      showDetailed ? '' : reportData.data.reduce((sum, cat) => sum + cat.count, 0),
      showDetailed ? '' : '',
      reportData.grandTotal
    ]);

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Aplicar formatação
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    // Definir larguras das colunas
    if (showDetailed) {
      ws['!cols'] = [
        { width: 30 }, // Cliente/Fornecedor
        { width: 15 }, // Data
        { width: 40 }, // Observações
        { width: 20 }  // Valor
      ];
    } else {
      ws['!cols'] = [
        { width: 30 }, // Categoria
        { width: 15 }, // Quantidade
        { width: 20 }  // Total
      ];
    }

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

    // Salvar arquivo
    const fileName = `${reportData.title.replace(/\s+/g, '_')}_${showDetailed ? 'Detalhado_' : ''}${format(new Date(), 'yyyy-MM-dd')}.xls`;
    XLSX.writeFile(wb, fileName);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-tertiary">Relatórios</h1>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-tertiary">Relatórios</h1>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button 
            onClick={handlePrintPdf} 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={showDetailed}
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Button onClick={handleSave} variant="outline" className="flex items-center gap-2">
            <FileExcel className="h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      <ReportFilters
        activeReport={activeReport}
        onReportChange={setActiveReport}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        showDetailed={showDetailed}
        onShowDetailedChange={setShowDetailed}
      />

      <Card>
        <CardContent className="p-0">
          <div ref={printRef}>
            <ReportTable reportData={reportData} showDetailed={showDetailed} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
