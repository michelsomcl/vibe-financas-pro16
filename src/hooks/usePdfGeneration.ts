
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const usePdfGeneration = () => {
  const generatePdf = useCallback(async (element: HTMLElement, fileName: string) => {
    try {
      // Configurações para melhor qualidade
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        height: element.scrollHeight,
        width: element.scrollWidth
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Criar PDF em formato A4
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calcular dimensões mantendo proporção
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      // Centralizar imagem no PDF
      const x = (pdfWidth - finalWidth) / 2;
      const y = 10; // Margem superior
      
      // Se a imagem for muito alta, dividir em páginas
      if (finalHeight > pdfHeight - 20) {
        let position = 0;
        const pageHeight = pdfHeight - 20;
        
        while (position < finalHeight) {
          const remainingHeight = finalHeight - position;
          const currentHeight = Math.min(pageHeight, remainingHeight);
          
          if (position > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(
            imgData,
            'PNG',
            x,
            y - position,
            finalWidth,
            finalHeight,
            undefined,
            'FAST'
          );
          
          position += pageHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');
      }
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar o PDF');
    }
  }, []);

  return { generatePdf };
};
