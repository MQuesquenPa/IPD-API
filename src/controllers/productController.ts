import { Request, Response } from 'express';
import {
    createProduct,
    importProductsFromExcel,
    listProducts,
    updateProduct
} from '../services/productService';
import { AppError } from '../utils/errorUtils';
import { sendError, sendSuccess } from '../utils/responseUtils';

export const getProducts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const products = await listProducts();

        sendSuccess(res, 200, products);
    } catch (error: any) {
        console.error('Error al obtener productos:', error);
        sendError(res, error);
    }
};

export const saveProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await createProduct(req.body);

        sendSuccess(res, 201, product, `El producto ${product.descripcion} con codigo ${product.codigo} se guardo exitosamente`);
    } catch (error: any) {
        console.error('Error al guardar producto:', error);
        sendError(res, error);
    }
};

export const updateProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id ? Number(req.params.id) : Number(req.body.id);
        const product = await updateProduct({
            ...req.body,
            id
        });

        sendSuccess(res, 200, product, 'Producto actualizado exitosamente');
    } catch (error: any) {
        console.error('Error al actualizar producto:', error);
        sendError(res, error);
    }
};

export const importProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = (req as any).file;

        if (!file) {
            sendError(res, new AppError('Debe enviar un archivo Excel en el campo file'));
            return;
        }

        const result = await importProductsFromExcel(file.buffer);

        sendSuccess(res, 200, result, 'Importacion de productos finalizada');
    } catch (error: any) {
        console.error('Error al importar productos:', error);
        sendError(res, error);
    }
};
