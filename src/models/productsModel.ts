export interface Product {
    id?: number;
    ruc: string;
    codigo: string;
    codigo_alterno?: string | null;
    descripcion: string;
    categoria?: string | null;
    peso?: number | null;
    ubicacion?: string | null;
    precio_unitario?: number | null;
    precio_venta?: number | null;
    imagen?: string | Buffer | null;
    estado?: string;
}

export type Products = Product;
