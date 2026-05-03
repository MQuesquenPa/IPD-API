import { Request, Response } from 'express';
import {
    listStockByProduct,
    listStockByWarehouse,
    registerStockEntry,
    registerStockExit
} from '../services/stockService';
import { sendError, sendSuccess } from '../utils/responseUtils';

export const getStockByProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const productoId = Number(req.params.productoId);
        const stock = await listStockByProduct(productoId);

        sendSuccess(res, 200, stock);
    } catch (error: any) {
        console.error('Error al obtener stock por producto:', error);
        sendError(res, error);
    }
};

export const getStockByWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
        const almacenId = Number(req.params.almacenId);
        const stock = await listStockByWarehouse(almacenId);

        sendSuccess(res, 200, stock);
    } catch (error: any) {
        console.error('Error al obtener stock por almacen:', error);
        sendError(res, error);
    }
};

export const saveStockEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const stock = await registerStockEntry(req.body);

        sendSuccess(res, 201, stock, 'Entrada de stock registrada exitosamente');
    } catch (error: any) {
        console.error('Error al registrar entrada de stock:', error);
        sendError(res, error);
    }
};

export const saveStockExit = async (req: Request, res: Response): Promise<void> => {
    try {
        const stock = await registerStockExit(req.body);

        sendSuccess(res, 201, stock, 'Salida de stock registrada exitosamente');
    } catch (error: any) {
        console.error('Error al registrar salida de stock:', error);
        sendError(res, error);
    }
};
