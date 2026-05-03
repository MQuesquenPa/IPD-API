export type StockMovementType = 'entrada' | 'salida';

export interface StockProduct {
    id?: number;
    producto_id: number;
    almacen_id: number;
    cantidad: number;
}

export interface StockMovement {
    id?: number;
    producto_id: number;
    almacen_id: number;
    tipo: StockMovementType;
    cantidad: number;
    stock_anterior: number;
    stock_nuevo: number;
    observacion?: string | null;
    created_at?: Date;
}

export interface StockOperation {
    producto_id: number;
    almacen_id: number;
    cantidad: number;
    observacion?: string | null;
}
