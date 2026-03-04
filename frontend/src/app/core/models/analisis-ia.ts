export interface VentaMensualDTO {
  mes: string;
  cantidadVendida: number;
}

export interface DetalleAnalisisIAResponseDTO {
  idProducto: number;
  nombreProducto: string;
  imagenProducto?: string;
  stockActual: number;
  sugerenciaCompra: number;
  justificacion: string;
  proyeccionProximoMes: number;
  nivelUrgencia: 'Alta' | 'Media' | 'Baja';
  ventasMensuales: VentaMensualDTO[];
}

export interface AnalisisIAResponseDTO {
  idAnalisis: number;
  fechaGeneracion: string;
  totalProductosAnalizados: number;
  periodoInicio: string;
  periodoFin: string;
  tokensUsados: number;
  detalles: DetalleAnalisisIAResponseDTO[];
}

export interface AnalisisIAResumenDTO {
  idAnalisis: number;
  fechaGeneracion: string;
  totalProductosAnalizados: number;
  tokensUsados: number;
}

export interface GenerarAnalisisResponse {
  mensaje: string;
  idAnalisis: number;
  fechaGeneracion: string;
  totalProductosAnalizados: number;
  tokensUsados: number;
}
