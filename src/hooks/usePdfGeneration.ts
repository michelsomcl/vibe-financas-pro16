
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
      
      // Margens menores para aproveitar melhor a página
      const margin = 5;
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      
      // Calcular dimensões mantendo proporção
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Usar toda a largura disponível
      const ratio = availableWidth / imgWidth;
      const finalWidth = availableWidth;
      const finalHeight = imgHeight * ratio;
      
      // Posicionar com margem mínima
      const x = margin;
      const y = margin;
      
      // Se a imagem for muito alta, dividir em páginas
      if (finalHeight > availableHeight) {
        let position = 0;
        const pageContentHeight = availableHeight;
        
        while (position < finalHeight) {
          if (position > 0) {
            pdf.addPage();
          }
          
          // Calcular a altura da imagem que cabe na página atual
          const remainingHeight = finalHeight - position;
          const currentPageHeight = Math.min(pageContentHeight, remainingHeight);
          
          // Calcular qual parte da imagem original mostrar
          const sourceY = (position / finalHeight) * imgHeight;
          const sourceHeight = (currentPageHeight / finalHeight) * imgHeight;
          
          // Criar um canvas temporário com apenas a parte da imagem para esta página
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = imgWidth;
          tempCanvas.height = sourceHeight;
          
          const img = new Image();
          img.onload = () => {
            tempCtx?.drawImage(img, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
            const tempImgData = tempCanvas.toDataURL('image/png');
            
            pdf.addImage(
              tempImgData,
              'PNG',
              x,
              y,
              finalWidth,
              currentPageHeight,
              undefined,
              'FAST'
            );
          };
          img.src = imgData;
          
          // Para a implementação síncrona, usar a abordagem anterior mas melhorada
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
          
          position += pageContentHeight;
        }
      } else {
        // Se cabe em uma página, centralizar verticalmente
        const verticalOffset = (availableHeight - finalHeight) / 2;
        pdf.addImage(
          imgData, 
          'PNG', 
          x, 
          y + verticalOffset, 
          finalWidth, 
          finalHeight, 
          undefined, 
          'FAST'
        );
      }
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar o PDF');
    }
  }, []);

  return { generatePdf };
};
