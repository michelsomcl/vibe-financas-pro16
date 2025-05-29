
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatCurrency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

export default function ReportTable({ reportData }: ReportTableProps) {
  return (
    <div className="p-6">
      <div className="header text-center mb-6">
        <h2 className="text-2xl font-bold text-tertiary mb-2">{reportData.title}</h2>
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
    </div>
  );
}
