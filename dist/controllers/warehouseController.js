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
exports.saveWarehouse = exports.getWarehouses = void 0;
const warehouseService_1 = require("../services/warehouseService");
const responseUtils_1 = require("../utils/responseUtils");
const getWarehouses = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const warehouses = yield (0, warehouseService_1.listWarehouses)();
        (0, responseUtils_1.sendSuccess)(res, 200, warehouses);
    }
    catch (error) {
        console.error('Error al obtener almacenes:', error);
        (0, responseUtils_1.sendError)(res, error);
    }
});
exports.getWarehouses = getWarehouses;
const saveWarehouse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const warehouse = yield (0, warehouseService_1.createWarehouse)(req.body);
        (0, responseUtils_1.sendSuccess)(res, 201, warehouse, `El almacen ${warehouse.nombre} con codigo ${warehouse.codigo} se guardo exitosamente`);
    }
    catch (error) {
        console.error('Error al guardar almacen:', error);
        (0, responseUtils_1.sendError)(res, error);
    }
});
exports.saveWarehouse = saveWarehouse;
