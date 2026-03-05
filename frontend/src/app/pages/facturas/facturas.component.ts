import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacturaService } from '../../core/services/factura.service';
import { Factura, FacturaListItem, FacturaResponse } from '../../core/models/factura.model';
import { ClienteService } from '../../core/services/cliente.service';
import { ProductoService } from '../../core/services/producto.service';
import { ReparacionService } from '../../core/services/reparacion.service';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { PdfService } from '../../core/services/pdf.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { EmailService } from '../../core/services/email.service';
import { Cliente } from '../../core/models/cliente.model';
import { Producto } from '../../core/models/producto.model';
import { Reparacion } from '../../core/models/reparacion.model';

interface ItemFactura {
  tipoItem: string;
  idProducto?: number;

  idReparacion?: number;
  descripcionItem: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

@Component({
  selector: 'app-facturas',
  standalone: false,
  templateUrl: './facturas.component.html'
})
export class FacturasComponent implements OnInit {
  facturas: FacturaListItem[] = [];
  searchTerm = '';
  loading = true;
  totalItems = 0;

  // Paginación
  currentPage = 1;
  pageSize = 10;

  // Vista crear factura
  showNuevaFactura = false;
  clientes: Cliente[] = [];
  productos: Producto[] = [];
  reparacionesDisponibles: Reparacion[] = [];
  ivaPorcentaje = 0;

  selectedCliente: number = 0;
  items: ItemFactura[] = [];

  // Agregar item
  showAddItem = false;
  tipoItem = 'Producto';
  selectedProducto: number = 0;
  selectedReparacion: number = 0;
  itemDescripcion = '';
  itemCantidad = 1;
  itemPrecio = 0;

  // Detalle factura
  showDetalle = false;
  facturaDetalle: FacturaResponse | null = null;
  enviandoCorreo = false;

  constructor(
    private facturaService: FacturaService,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private reparacionService: ReparacionService,
    private configuracionService: ConfiguracionService,
    private pdfService: PdfService,
    private toast: ToastService,
    private router: Router,
    private emailService: EmailService
  ) {}

  ngOnInit(): void {
    this.loadFacturas();
  }

  loadFacturas(): void {
    this.loading = true;
    this.facturaService.getAll(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (data) => {
        this.facturas = data.items;
        this.totalItems = data.totalItems;
        this.currentPage = data.page;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error al cargar facturas', 'error');
        this.facturas = [];
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadFacturas();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadFacturas();
  }

  openNuevaFactura(): void {
    this.showNuevaFactura = true;
    this.selectedCliente = 0;
    this.items = [];
    this.loadDatosFactura();
  }

  loadDatosFactura(): void {
    this.clienteService.getAll().subscribe(data => this.clientes = data.filter(c => c.activo));
    this.productoService.getAll().subscribe(data => this.productos = data.filter(p => p.activo && p.stockActual > 0));
    this.reparacionService.getAll().subscribe(data =>
      this.reparacionesDisponibles = data.filter(r => r.estado === 'Reparado')
    );
    this.configuracionService.get().subscribe({
      next: (config) => this.ivaPorcentaje = config.ivaPorcentaje,
      error: () => this.ivaPorcentaje = 15
    });
  }

  openAddItem(): void {
    this.showAddItem = true;
    this.tipoItem = 'Producto';
    this.selectedProducto = 0;
    this.selectedReparacion = 0;
    this.itemDescripcion = '';
    this.itemCantidad = 1;
    this.itemPrecio = 0;
  }

  onTipoItemChange(): void {
    this.selectedProducto = 0;
    this.selectedReparacion = 0;
    this.itemDescripcion = '';
    this.itemPrecio = 0;
    this.itemCantidad = 1;
  }

  onProductoSelect(): void {
    const prod = this.productos.find(p => p.idProducto == this.selectedProducto);
    if (prod) {
      this.itemDescripcion = prod.nombreProducto;
      this.itemPrecio = prod.precioVenta;
    }
  }

  onReparacionSelect(): void {
    const rep = this.reparacionesDisponibles.find(r => r.idReparacion == this.selectedReparacion);
    if (rep) {
      this.itemDescripcion = `Reparación #${rep.idReparacion} - ${rep.modeloEquipo}`;
      this.itemPrecio = rep.costoManoObra || 0;
      this.itemCantidad = 1;
    }
  }

  addItem(): void {
    if (!this.itemDescripcion || this.itemPrecio <= 0) {
      this.toast.show('Complete los datos del item', 'error');
      return;
    }

    // Validar duplicados
    if (this.tipoItem === 'Producto' && this.selectedProducto) {
      const yaExiste = this.items.some(i => i.idProducto === this.selectedProducto);
      if (yaExiste) {
        this.toast.show('Este producto ya fue añadido a la factura', 'warning');
        return;
      }
      // Validar stock
      const prod = this.productos.find(p => p.idProducto == this.selectedProducto);
      if (prod && this.itemCantidad > prod.stockActual) {
        this.toast.show(`Stock insuficiente. Disponible: ${prod.stockActual}`, 'error');
        return;
      }
    }

    if (this.tipoItem === 'Reparacion' && this.selectedReparacion) {
      const yaExiste = this.items.some(i => i.idReparacion === this.selectedReparacion);
      if (yaExiste) {
        this.toast.show('Esta reparación ya fue añadida a la factura', 'warning');
        return;
      }
    }

    const item: ItemFactura = {
      tipoItem: this.tipoItem,
      descripcionItem: this.itemDescripcion,
      cantidad: this.itemCantidad,
      precioUnitario: this.itemPrecio,
      subtotal: this.itemCantidad * this.itemPrecio
    };
    if (this.tipoItem === 'Producto' && this.selectedProducto) {
      item.idProducto = this.selectedProducto;
    }
    if (this.tipoItem === 'Reparacion' && this.selectedReparacion) {
      item.idReparacion = this.selectedReparacion;
    }
    this.items.push(item);
    this.showAddItem = false;
  }


  removeItem(index: number): void {
    this.items.splice(index, 1);
  }

  get subtotal(): number {
    return this.items.reduce((sum, i) => sum + i.subtotal, 0);
  }

  get ivaTotal(): number {
    return this.subtotal * (this.ivaPorcentaje / 100);
  }

  get total(): number {
    return this.subtotal + this.ivaTotal;
  }

  guardarFactura(): void {
    if (!this.selectedCliente || this.items.length === 0) {
      this.toast.show('Seleccione un cliente y agregue al menos un item', 'error');
      return;
    }

    const reparacionIds = this.items
      .filter(i => i.tipoItem === 'Reparacion' && i.idReparacion)
      .map(i => i.idReparacion!);

    const dto = {
      idCliente: this.selectedCliente,
      detalles: this.items.map(i => ({
        idProducto: i.idProducto || undefined,

        idReparacion: i.idReparacion || undefined,
        descripcionItem: i.descripcionItem,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        tipoItem: i.tipoItem
      })),
      reparacionIds: reparacionIds.length > 0 ? reparacionIds : undefined
    };

    this.facturaService.create(dto).subscribe({
      next: (factura) => {
        this.toast.show('Factura creada exitosamente', 'success');
        this.showNuevaFactura = false;
        this.loadFacturas();
      },
      error: (err) => {
        this.toast.show(err.error?.message || 'Error al crear factura', 'error');
      }
    });
  }

  cancelarNueva(): void {
    this.showNuevaFactura = false;
  }

  openDetalle(factura: { idFactura: number }): void {
    this.facturaService.getById(factura.idFactura).subscribe({
      next: (data) => {
        this.facturaDetalle = data;
        this.showDetalle = true;
      },
      error: () => this.toast.show('Error al cargar detalle', 'error')
    });
  }

  closeDetalle(): void {
    this.showDetalle = false;
    this.facturaDetalle = null;
  }

  generarPDF(factura: FacturaResponse): void {
    this.pdfService.generarFacturaPDF(factura);
  }

  async enviarFacturaCorreo(factura: FacturaResponse): Promise<void> {
    if (!factura.clienteEmail) {
      this.toast.show('El cliente no tiene un correo registrado', 'warning');
      return;
    }

    this.enviandoCorreo = true;
    try {
      const pdfBase64 = await this.pdfService.obtenerFacturaBase64(factura);

      this.emailService.enviar({
        destinatario: factura.clienteEmail,
        nombreDestinatario: factura.clienteNombre,
        asunto: `Factura #${factura.idFactura} -  Tecnomovil`,
        cuerpo: `<h2 style="color:#1d4ed8">Hola, ${factura.clienteNombre}</h2>
                 <p>Adjunto a este correo encontrarás tu factura <strong>#${factura.idFactura}</strong>.</p>
                 <p>Gracias por preferir a <strong>Tecnomovil</strong>.</p>`,
        esTextoPlano: false,
        adjuntos: [
          {
            nombre: `factura-${factura.idFactura}.pdf`,
            base64: pdfBase64,
            contentType: 'application/pdf'
          }
        ]
      }).subscribe({
        next: () => {
          this.toast.show('Factura enviada al correo del cliente', 'success');
          this.enviandoCorreo = false;
        },
        error: () => {
          this.toast.show('Error al enviar el correo', 'error');
          this.enviandoCorreo = false;
        }
      });
    } catch (e) {
      this.toast.show('Error al generar el PDF adjunto', 'error');
      this.enviandoCorreo = false;
    }
  }
}
