export interface Configuracion {
  ivaPorcentaje: number;
}

export interface Atributo {
  idAtributo: number;
  nombreAtributo: string;
  tipoDato: string;
  unidad?: string;
  activo: boolean;
}

export interface AtributoDto {
  nombreAtributo: string;
  tipoDato: string;
  unidad?: string;
  activo: boolean;
}
