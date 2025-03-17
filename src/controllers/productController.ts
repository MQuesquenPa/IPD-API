import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { createProduct } from '../services/productService';


export const saveProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ status: 400, errors: errors.array() });
            return;
        }

        const product = await createProduct(req.body);


        if (!product) throw new Error

        res.status(201).json({ 
            status: 201, 
            message: `El producto ${product.descripcion} con codigo ${product.codigo} se guardó exitosamente`, 
            data: product 
        });
    } catch (error: any) {
        res.status(500).json({ status: 500, message: 'Error interno del servidor', detail: error.message });
    }
};