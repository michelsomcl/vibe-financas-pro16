
import { useCallback } from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from 'xlsx';
import { usePdfGeneration } from "@/hooks/usePdfGeneration";

interface ReportData {
  title: string;
  data: Array<{
    categoryName: string;
    total: number;
    count: number;
    items: any[];
  }>;
  grandTotal: number;
  period: string;
}

export const useReportExport = () => {
  const { generatePdf } = usePdfGeneration();

  const handlePrint = useCallback((printRef: React.RefObject<HTMLDivElement>) => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  }, []);

  const handlePrintPdf = useCallback(async (
    printRef: React.RefObject<HTMLDivElement>,
    reportData: ReportData,
    showDetailed: boolean
  ) => {
    if (printRef.current) {
      try {
        const fileName = `${reportData.title.replace(/\s+/g, '_')}_${showDetailed ? 'Detalhado_' : ''}${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        await generatePdf(printRef.current, fileName);
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
      }
    }
  }, [generatePdf]);

  const handleSave = useCallback((
    reportData: ReportData,
    showDetailed: boolean,
    activeReport: string
  ) => {
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
            item.value.toString()
          ]);
        });
        
        excelData.push([`Subtotal - ${category.categoryName}`, '', '', category.total.toString()]);
      });
    } else {
      // Formato resumido
      excelData.push(['Categoria', 'Quantidade', 'Total']);
      
      reportData.data.forEach(category => {
        excelData.push([
          category.categoryName,
          category.count.toString(),
          category.total.toString()
        ]);
      });
    }

    // Adicionar total geral
    excelData.push([
      'TOTAL GERAL',
      showDetailed ? '' : reportData.data.reduce((sum, cat) => sum + cat.count, 0).toString(),
      showDetailed ? '' : '',
      reportData.grandTotal.toString()
    ]);

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Aplicar formatação
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
  }, []);

  return {
    handlePrint,
    handlePrintPdf,
    handleSave
  };
};
