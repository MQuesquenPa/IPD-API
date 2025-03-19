import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { createProduct } from '../services/productService';
import { getAllProducts } from '../repository/productRepository';


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

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const rows = await getAllProducts();

        if (!rows.length) {
            res.status(404).json({ status: 404, message: 'No se encontraron productos' });
            return
        }

        const products = rows.map(product => ({
            ...product,
            imagen: product.imagen ? `data:image/jpeg;base64,${product.imagen.toString('base64')}` : null
        }));


        res.status(200).json({ status: 200, data: products });
        return 
    } catch (error:any) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ status: 500, message: 'Error interno del servidor', detail: error.toString() });
    }
};