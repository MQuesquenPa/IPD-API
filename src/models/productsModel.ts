export interface Products {
    id?: number;
    codigo: string;
    descripcion?: string;
    solicitud?: string;
    cantidad_kit?: number;
    peso?: number;
    rack?: string;
    stock_import?: number;
    stock_ipd_cat?: number;
    stock_bulldog?: number;
    stock_fp?: number;
    stock_ctp?: number;
    stock_itr?: number;
    stock_cat?: number;
    stock_total?: number;
    p_unit_fob?: number;
    p_fob_x_vender?: number;
    p_fob_cat?: number;
    precio_final?: number;
    p_venta_ferreyros?: number;
    imagen?: string | Buffer | null;
    lugar?: string;
}