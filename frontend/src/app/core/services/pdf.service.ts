import { Injectable } from '@angular/core';
import { FacturaResponse } from '../models/factura.model';

@Injectable({ providedIn: 'root' })
export class PdfService {

  async generarFacturaPDF(factura: FacturaResponse): Promise<void> {
    const pdfMake = (await import('pdfmake/build/pdfmake')).default;
    const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
    (pdfMake as any).vfs = (pdfFonts as any)['vfs'];

    const docDefinition: any = this.obtenerDefinicionBase(factura);
    pdfMake.createPdf(docDefinition).open();
  }

  async obtenerFacturaBase64(factura: FacturaResponse): Promise<string> {
    const pdfMake = (await import('pdfmake/build/pdfmake')).default;
    const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
    (pdfMake as any).vfs = (pdfFonts as any)['vfs'];

    const docDefinition: any = this.obtenerDefinicionBase(factura);

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    return await (pdfDocGenerator as any).getBase64();
  }

  private obtenerDefinicionBase(factura: FacturaResponse): any {
    return {
      content: [
        // Encabezado
        {
          columns: [
            {
              text: 'TECNOMOVIL',
              style: 'companyName'
            },
            {
              text: [
                { text: `FACTURA #${factura.idFactura}\n`, style: 'invoiceTitle' },
                { text: `Fecha: ${new Date(factura.fecha).toLocaleDateString('es-EC')}\n`, style: 'invoiceSubtitle' }
              ],
              alignment: 'right'
            }
          ]
        },
        { text: '\n' },

        // Línea separadora
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#1d4ed8' }] },
        { text: '\n' },

        // Datos cliente y vendedor
        {
          columns: [
            {
              text: [
                { text: 'CLIENTE\n', style: 'sectionHeader' },
                { text: `Nombre: ${factura.clienteNombre}\n`, style: 'detail' }
              ]
            },
            {
              text: [
                { text: 'VENDEDOR\n', style: 'sectionHeader' },
                { text: factura.vendedorNombre, style: 'detail' }
              ],
              alignment: 'right'
            }
          ]
        },
        { text: '\n' },

        // Tabla de detalles
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Tipo', style: 'tableHeader' },
                { text: 'Cant.', style: 'tableHeader', alignment: 'center' },
                { text: 'P. Unit.', style: 'tableHeader', alignment: 'right' },
                { text: 'Subtotal', style: 'tableHeader', alignment: 'right' }
              ],
              ...factura.detalles.map((d: any) => [
                { text: d.descripcionItem || '-', style: 'tableCell' },
                { text: d.tipoItem, style: 'tableCell', alignment: 'center' },
                { text: d.cantidad.toString(), style: 'tableCell', alignment: 'center' },
                { text: `$${d.precioUnitario.toFixed(2)}`, style: 'tableCell', alignment: 'right' },
                { text: `$${(d.cantidad * d.precioUnitario).toFixed(2)}`, style: 'tableCell', alignment: 'right' }
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#1d4ed8' : rowIndex % 2 === 0 ? '#f0f4ff' : null
          }
        },
        { text: '\n' },

        // Totales
        {
          alignment: 'right',
          table: {
            widths: ['*', 100],
            body: [
              [{ text: 'Subtotal:', alignment: 'right', style: 'totalLabel' }, { text: `$${factura.subtotal.toFixed(2)}`, alignment: 'right', style: 'totalValue' }],
              [{ text: `IVA (${factura.ivaPorcentaje}%):`, alignment: 'right', style: 'totalLabel' }, { text: `$${factura.iva.toFixed(2)}`, alignment: 'right', style: 'totalValue' }],
              [{ text: 'TOTAL:', alignment: 'right', style: 'grandTotalLabel' }, { text: `$${factura.total.toFixed(2)}`, alignment: 'right', style: 'grandTotalValue' }]
            ]
          },
          layout: 'noBorders'
        },

        // Pie de página
        { text: '\n\n' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#d1d5db' }] },
        { text: '\nGracias por su preferencia - Tecnomovil', style: 'footer', alignment: 'center' }
      ],

      styles: {
        companyName: { fontSize: 22, bold: true, color: '#1d4ed8' },
        invoiceTitle: { fontSize: 16, bold: true, color: '#1d4ed8' },
        invoiceSubtitle: { fontSize: 10, color: '#6b7280' },
        sectionHeader: { fontSize: 10, bold: true, color: '#374151', margin: [0, 0, 0, 2] },
        detail: { fontSize: 10, color: '#374151' },
        tableHeader: { fontSize: 9, bold: true, color: '#ffffff', margin: [4, 4, 4, 4] },
        tableCell: { fontSize: 9, color: '#374151', margin: [4, 3, 4, 3] },
        totalLabel: { fontSize: 10, color: '#374151', margin: [0, 2, 0, 2] },
        totalValue: { fontSize: 10, color: '#374151', margin: [0, 2, 0, 2] },
        grandTotalLabel: { fontSize: 12, bold: true, color: '#1d4ed8', margin: [0, 2, 0, 2] },
        grandTotalValue: { fontSize: 12, bold: true, color: '#1d4ed8', margin: [0, 2, 0, 2] },
        footer: { fontSize: 9, color: '#9ca3af' }
      },

      pageMargins: [40, 40, 40, 60]
    };

  }
}
