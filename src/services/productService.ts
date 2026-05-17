import * as XLSX from 'xlsx';
import { Product } from '../models/productsModel';
import {
    createProduct as createProductRepository,
    getAllProducts,
    updateProductFields,
    upsertProductByCodeAndRuc
} from '../repository/productRepository';
import { AppError, getErrorMessage } from '../utils/errorUtils';
import { normalizeEntityStatus } from '../utils/statusUtils';

interface ImportProductsResult {
    totalRows: number;
    processedRows: number;
    failedRows: Array<{
        row: number;
        reason: string;
    }>;
}

const parseProductImage = (imagen: Product['imagen']): Buffer | null => {
    if (!imagen || typeof imagen !== 'string') {
        return null;
    }

    const base64String = imagen.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');

    return buffer.length > 0 ? buffer : null;
};

const serializeProduct = (product: Product): Product => ({
    ...product,
    imagen: product.imagen ? `data:image/jpeg;base64,${product.imagen.toString('base64')}` : null
});

const buildProduct = (productData: Partial<Product>): Product => ({
    id: productData.id,
    ruc: productData.ruc ?? '',
    codigo: productData.codigo ?? '',
    codigo_alterno: productData.codigo_alterno ?? null,
    descripcion: productData.descripcion ?? '',
    categoria: productData.categoria ?? null,
    peso: productData.peso ?? null,
    ubicacion: productData.ubicacion ?? null,
    precio_unitario: productData.precio_unitario ?? null,
    precio_venta: productData.precio_venta ?? null,
    imagen: parseProductImage(productData.imagen),
    estado: normalizeEntityStatus(productData.estado)
});

const allowedUpdateFields: Array<keyof Omit<Product, 'id'>> = [
    'ruc',
    'codigo',
    'codigo_alterno',
    'descripcion',
    'categoria',
    'peso',
    'ubicacion',
    'precio_unitario',
    'precio_venta',
    'imagen',
    'estado'
];

const hasPatchValue = (value: unknown): boolean => {
    return value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '');
};

const buildProductPatch = (productData: Partial<Product>): Partial<Omit<Product, 'id'>> => {
    return allowedUpdateFields.reduce<Partial<Omit<Product, 'id'>>>((patch, field) => {
        const value = productData[field];

        if (!hasPatchValue(value)) {
            return patch;
        }

        if (field === 'imagen') {
            patch.imagen = parseProductImage(value as Product['imagen']);
            return patch;
        }

        if (field === 'estado') {
            patch.estado = normalizeEntityStatus(value as string);
            return patch;
        }

        patch[field] = typeof value === 'string' ? value.trim() as never : value as never;
        return patch;
    }, {});
};

const validateProduct = (product: Product): void => {
    if (!product.ruc) {
        throw new AppError('El ruc del producto es obligatorio');
    }

    if (!product.codigo) {
        throw new AppError('El codigo del producto es obligatorio');
    }

    if (!product.descripcion) {
        throw new AppError('La descripcion del producto es obligatoria');
    }
};

const normalizeHeader = (value: string): string => {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_');
};

const getCellValue = (row: Record<string, any>, keys: string[]): any => {
    for (const key of keys) {
        const normalizedKey = normalizeHeader(key);
        if (row[normalizedKey] !== undefined && row[normalizedKey] !== null && row[normalizedKey] !== '') {
            return row[normalizedKey];
        }
    }

    return undefined;
};

const toStringValue = (value: any): string => {
    return value === undefined || value === null ? '' : String(value).trim();
};

const toNullableString = (value: any): string | null => {
    const stringValue = toStringValue(value);
    return stringValue || null;
};

const toNullableNumber = (value: any): number | null => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const numberValue = Number(String(value).replace(',', '.'));
    return Number.isNaN(numberValue) ? null : numberValue;
};

const normalizeExcelRow = (row: Record<string, any>): Record<string, any> => {
    return Object.entries(row).reduce<Record<string, any>>((acc, [key, value]) => {
        acc[normalizeHeader(key)] = value;
        return acc;
    }, {});
};

const mapExcelRowToProduct = (row: Record<string, any>): Product => {
    const normalizedRow = normalizeExcelRow(row);

    return buildProduct({
        ruc: toStringValue(getCellValue(normalizedRow, ['ruc'])),
        codigo: toStringValue(getCellValue(normalizedRow, ['codigo', 'cod'])),
        codigo_alterno: toNullableString(getCellValue(normalizedRow, ['codigo_alterno', 'codigo alterno', 'cod_alterno'])),
        descripcion: toStringValue(getCellValue(normalizedRow, ['descripcion', 'description', 'producto'])),
        categoria: toNullableString(getCellValue(normalizedRow, ['categoria', 'category'])),
        peso: toNullableNumber(getCellValue(normalizedRow, ['peso'])),
        ubicacion: toNullableString(getCellValue(normalizedRow, ['ubicacion', 'location'])),
        precio_unitario: toNullableNumber(getCellValue(normalizedRow, ['precio_unitario', 'precio unitario', 'p_unitario'])),
        precio_venta: toNullableNumber(getCellValue(normalizedRow, ['precio_venta', 'precio venta', 'p_venta'])),
        imagen: toNullableString(getCellValue(normalizedRow, ['imagen', 'image'])),
        estado: toStringValue(getCellValue(normalizedRow, ['estado', 'status'])) || 'A'
    });
};

export const listProducts = async (): Promise<Product[]> => {
    const products = await getAllProducts();
    return products.map(serializeProduct);
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
    const product = buildProduct(productData);
    validateProduct(product);

    const id = await createProductRepository(product);

    return serializeProduct({ ...product, id });
};

export const updateProduct = async (productData: Partial<Product>): Promise<Product> => {
    if (!productData.id) {
        throw new AppError('El id del producto es obligatorio para actualizar');
    }

    const productPatch = buildProductPatch(productData);
    const affectedRows = await updateProductFields(productData.id, productPatch);

    if (affectedRows === 0) {
        throw new AppError('No se encontro el producto para actualizar', 404);
    }

    return serializeProduct({
        ...productPatch,
        id: productData.id
    } as Product);
};

export const importProductsFromExcel = async (fileBuffer: Buffer): Promise<ImportProductsResult> => {
    let workbook: XLSX.WorkBook;

    try {
        workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    } catch (error) {
        throw new AppError('No se pudo leer el archivo Excel');
    }

    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
        throw new AppError('El archivo Excel no contiene hojas');
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null });
    const failedRows: ImportProductsResult['failedRows'] = [];
    let processedRows = 0;

    for (const [index, row] of rows.entries()) {
        try {
            const product = mapExcelRowToProduct(row);
            validateProduct(product);

            await upsertProductByCodeAndRuc(product);
            processedRows += 1;
        } catch (error: any) {
            failedRows.push({
                row: index + 2,
                reason: getErrorMessage(error)
            });
        }
    }

    return {
        totalRows: rows.length,
        processedRows,
        failedRows
    };
};
