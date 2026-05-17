import { Warehouse } from '../models/warehouseModel';
import {
    createWarehouse as createWarehouseRepository,
    getAllWarehouses
} from '../repository/warehouseRepository';
import { AppError } from '../utils/errorUtils';
import { normalizeEntityStatus } from '../utils/statusUtils';

const buildWarehouse = (warehouseData: Partial<Warehouse>): Warehouse => ({
    id: warehouseData.id,
    ruc: warehouseData.ruc ?? '',
    codigo: warehouseData.codigo ?? '',
    nombre: warehouseData.nombre ?? '',
    estado: normalizeEntityStatus(warehouseData.estado)
});

const validateWarehouse = (warehouse: Warehouse): void => {
    if (!warehouse.ruc) {
        throw new AppError('El ruc del almacen es obligatorio');
    }

    if (!warehouse.codigo) {
        throw new AppError('El codigo del almacen es obligatorio');
    }

    if (!warehouse.nombre) {
        throw new AppError('El nombre del almacen es obligatorio');
    }
};

export const listWarehouses = async (): Promise<Warehouse[]> => {
    return getAllWarehouses();
};

export const createWarehouse = async (warehouseData: Partial<Warehouse>): Promise<Warehouse> => {
    const warehouse = buildWarehouse(warehouseData);
    validateWarehouse(warehouse);

    const id = await createWarehouseRepository(warehouse);

    return {
        ...warehouse,
        id
    };
};
