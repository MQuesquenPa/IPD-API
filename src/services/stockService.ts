import { pool } from '../config/db';
import { StockMovementType, StockOperation, StockProduct } from '../models/stockModel';
import { getProductById } from '../repository/productRepository';
import {
    createStockMovement,
    ensureStockProductForUpdate,
    getStockByProduct,
    getStockByWarehouse,
    updateStockProduct
} from '../repository/stockRepository';
import { getWarehouseById } from '../repository/warehouseRepository';
import { AppError } from '../utils/errorUtils';
import { isActiveStatus } from '../utils/statusUtils';

interface NormalizedStockOperation extends StockOperation {
    cantidad: number;
}

const validateStockOperation = (operation: StockOperation): NormalizedStockOperation => {
    if (!operation.producto_id) {
        throw new AppError('El producto_id es obligatorio');
    }

    if (!operation.almacen_id) {
        throw new AppError('El almacen_id es obligatorio');
    }

    const cantidad = Number(operation.cantidad);

    if (Number.isNaN(cantidad) || cantidad <= 0) {
        throw new AppError('La cantidad debe ser mayor a cero');
    }

    return {
        ...operation,
        producto_id: Number(operation.producto_id),
        almacen_id: Number(operation.almacen_id),
        cantidad
    };
};

const validateStockEntities = async (operation: NormalizedStockOperation): Promise<void> => {
    const [product, warehouse] = await Promise.all([
        getProductById(operation.producto_id),
        getWarehouseById(operation.almacen_id)
    ]);

    if (!product) {
        throw new AppError('El producto no existe', 404);
    }

    if (!isActiveStatus(product.estado)) {
        throw new AppError('El producto no esta activo');
    }

    if (!warehouse) {
        throw new AppError('El almacen no existe', 404);
    }

    if (!isActiveStatus(warehouse.estado)) {
        throw new AppError('El almacen no esta activo');
    }
};

export const listStockByProduct = async (productoId: number): Promise<StockProduct[]> => {
    if (!productoId) {
        throw new AppError('El producto_id es obligatorio');
    }

    return getStockByProduct(productoId);
};

export const listStockByWarehouse = async (almacenId: number): Promise<StockProduct[]> => {
    if (!almacenId) {
        throw new AppError('El almacen_id es obligatorio');
    }

    return getStockByWarehouse(almacenId);
};

const registerStockMovement = async (
    operation: StockOperation,
    type: StockMovementType
): Promise<StockProduct> => {
    const normalizedOperation = validateStockOperation(operation);
    await validateStockEntities(normalizedOperation);

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const currentStock = await ensureStockProductForUpdate(
            normalizedOperation.producto_id,
            normalizedOperation.almacen_id,
            connection
        );

        const stockAnterior = Number(currentStock.cantidad);
        const stockNuevo = type === 'entrada'
            ? stockAnterior + normalizedOperation.cantidad
            : stockAnterior - normalizedOperation.cantidad;

        if (stockNuevo < 0) {
            throw new AppError('La salida no puede dejar stock negativo');
        }

        const stockProduct: StockProduct = {
            id: currentStock.id,
            producto_id: normalizedOperation.producto_id,
            almacen_id: normalizedOperation.almacen_id,
            cantidad: stockNuevo
        };

        await updateStockProduct(stockProduct, connection);

        await createStockMovement({
            producto_id: normalizedOperation.producto_id,
            almacen_id: normalizedOperation.almacen_id,
            tipo: type,
            cantidad: normalizedOperation.cantidad,
            stock_anterior: stockAnterior,
            stock_nuevo: stockNuevo,
            observacion: normalizedOperation.observacion ?? null
        }, connection);

        await connection.commit();

        return stockProduct;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export const registerStockEntry = async (operation: StockOperation): Promise<StockProduct> => {
    return registerStockMovement(operation, 'entrada');
};

export const registerStockExit = async (operation: StockOperation): Promise<StockProduct> => {
    return registerStockMovement(operation, 'salida');
};
