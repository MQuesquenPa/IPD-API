import { Request, Response } from 'express';
import { createWarehouse, listWarehouses } from '../services/warehouseService';
import { sendError, sendSuccess } from '../utils/responseUtils';

export const getWarehouses = async (_req: Request, res: Response): Promise<void> => {
    try {
        const warehouses = await listWarehouses();

        sendSuccess(res, 200, warehouses);
    } catch (error: any) {
        console.error('Error al obtener almacenes:', error);
        sendError(res, error);
    }
};

export const saveWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
        const warehouse = await createWarehouse(req.body);

        sendSuccess(res, 201, warehouse, `El almacen ${warehouse.nombre} con codigo ${warehouse.codigo} se guardo exitosamente`);
    } catch (error: any) {
        console.error('Error al guardar almacen:', error);
        sendError(res, error);
    }
};
