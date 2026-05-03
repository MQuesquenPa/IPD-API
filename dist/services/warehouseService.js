"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWarehouse = exports.listWarehouses = void 0;
const warehouseRepository_1 = require("../repository/warehouseRepository");
const errorUtils_1 = require("../utils/errorUtils");
const buildWarehouse = (warehouseData) => {
    var _a, _b, _c, _d;
    return ({
        id: warehouseData.id,
        ruc: (_a = warehouseData.ruc) !== null && _a !== void 0 ? _a : '',
        codigo: (_b = warehouseData.codigo) !== null && _b !== void 0 ? _b : '',
        nombre: (_c = warehouseData.nombre) !== null && _c !== void 0 ? _c : '',
        estado: (_d = warehouseData.estado) !== null && _d !== void 0 ? _d : 'activo'
    });
};
const validateWarehouse = (warehouse) => {
    if (!warehouse.ruc) {
        throw new errorUtils_1.AppError('El ruc del almacen es obligatorio');
    }
    if (!warehouse.codigo) {
        throw new errorUtils_1.AppError('El codigo del almacen es obligatorio');
    }
    if (!warehouse.nombre) {
        throw new errorUtils_1.AppError('El nombre del almacen es obligatorio');
    }
};
const listWarehouses = () => __awaiter(void 0, void 0, void 0, function* () {
    return (0, warehouseRepository_1.getAllWarehouses)();
});
exports.listWarehouses = listWarehouses;
const createWarehouse = (warehouseData) => __awaiter(void 0, void 0, void 0, function* () {
    const warehouse = buildWarehouse(warehouseData);
    validateWarehouse(warehouse);
    const id = yield (0, warehouseRepository_1.createWarehouse)(warehouse);
    return Object.assign(Object.assign({}, warehouse), { id });
});
exports.createWarehouse = createWarehouse;
