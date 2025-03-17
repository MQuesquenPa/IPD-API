import { pool } from '../config/db';
import { Products } from '../models/productsModel';

export const saveProduct = async (product: Products): Promise<number> => {
    const [result] = await pool.execute(
        `INSERT INTO products (codigo, descripcion, solicitud, cantidad_kit, peso, rack, 
        stock_import, stock_ipd_cat, stock_bulldog, stock_fp, stock_ctp, stock_itr, stock_cat, 
        stock_total, p_unit_fob, p_fob_x_vender, p_fob_cat, precio_final, p_venta_ferreyros, imagen)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            product.codigo, product.descripcion, product.solicitud, product.cantidad_kit, product.peso,
            product.rack, product.stock_import, product.stock_ipd_cat, product.stock_bulldog,
            product.stock_fp, product.stock_ctp, product.stock_itr, product.stock_cat, product.stock_total,
            product.p_unit_fob, product.p_fob_x_vender, product.p_fob_cat, product.precio_final,
            product.p_venta_ferreyros, product.imagen
        ]
    );

    return (result as any).insertId;
};