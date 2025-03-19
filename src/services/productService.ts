import { Products } from '../models/productsModel';
import { saveProduct } from '../repository/productRepository';

export const createProduct = async (productData: Partial<Products>): Promise<Products> => {

    const base64String = typeof productData.imagen === "string" 
    ? productData.imagen.replace(/^data:image\/\w+;base64,/, "") 
    : "";   
    
    const buffer = Buffer.from(base64String, 'base64');

    const product: Products = {
        codigo: productData.codigo ?? '',
        descripcion: productData.descripcion ?? '',
        solicitud: productData.solicitud ?? '',
        cantidad_kit: productData.cantidad_kit ?? 0,
        peso: productData.peso ?? 0,
        rack: productData.rack ?? '',
        stock_import: productData.stock_import ?? 0,
        stock_ipd_cat: productData.stock_ipd_cat ?? 0,
        stock_bulldog: productData.stock_bulldog ?? 0,
        stock_fp: productData.stock_fp ?? 0,
        stock_ctp: productData.stock_ctp ?? 0,
        stock_itr: productData.stock_itr ?? 0,
        stock_cat: productData.stock_cat ?? 0,
        stock_total: productData.stock_total ?? 0,
        p_unit_fob: productData.p_unit_fob ?? 0,
        p_fob_x_vender: productData.p_fob_x_vender ?? 0,
        p_fob_cat: productData.p_fob_cat ?? 0,
        precio_final: productData.precio_final ?? 0,
        p_venta_ferreyros: productData.p_venta_ferreyros ?? 0,
        imagen: buffer.length > 0 ? buffer : null,
        lugar: productData.lugar ? productData.lugar : ''
    };

    const id = await saveProduct(product);
    
    return { ...product, id, imagen: product.imagen ? `data:image/jpeg;base64,${product.imagen.toString('base64')}` : null};
};
