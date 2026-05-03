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
exports.saveStockExit = exports.saveStockEntry = exports.getStockByWarehouse = exports.getStockByProduct = void 0;
const stockService_1 = require("../services/stockService");
const responseUtils_1 = require("../utils/responseUtils");
const getStockByProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productoId = Number(req.params.productoId);
        const stock = yield (0, stockService_1.listStockByProduct)(productoId);
        (0, responseUtils_1.sendSuccess)(res, 200, stock);
    }
    catch (error) {
        console.error('Error al obtener stock por producto:', error);
        (0, responseUtils_1.sendError)(res, error);
    }
});
exports.getStockByProduct = getStockByProduct;
const getStockByWarehouse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const almacenId = Number(req.params.almacenId);
        const stock = yield (0, stockService_1.listStockByWarehouse)(almacenId);
        (0, responseUtils_1.sendSuccess)(res, 200, stock);
    }
    catch (error) {
        console.error('Error al obtener stock por almacen:', error);
        (0, responseUtils_1.sendError)(res, error);
    }
});
exports.getStockByWarehouse = getStockByWarehouse;
const saveStockEntry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stock = yield (0, stockService_1.registerStockEntry)(req.body);
        (0, responseUtils_1.sendSuccess)(res, 201, stock, 'Entrada de stock registrada exitosamente');
    }
    catch (error) {
        console.error('Error al registrar entrada de stock:', error);
        (0, responseUtils_1.sendError)(res, error);
    }
});
exports.saveStockEntry = saveStockEntry;
const saveStockExit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stock = yield (0, stockService_1.registerStockExit)(req.body);
        (0, responseUtils_1.sendSuccess)(res, 201, stock, 'Salida de stock registrada exitosamente');
    }
    catch (error) {
        console.error('Error al registrar salida de stock:', error);
        (0, responseUtils_1.sendError)(res, error);
    }
});
exports.saveStockExit = saveStockExit;
