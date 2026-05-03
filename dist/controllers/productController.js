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
exports.importProducts = exports.updateProducts = exports.saveProducts = exports.getProducts = void 0;
const productService_1 = require("../services/productService");
const errorUtils_1 = require("../utils/errorUtils");
const responseUtils_1 = require("../utils/responseUtils");
const getProducts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield (0, productService_1.listProducts)();
        (0, responseUtils_1.sendSuccess)(res, 200, products);
    }
    catch (error) {
        console.error('Error al obtener productos:', error);
        (0, responseUtils_1.sendError)(res, error);
    }
});
exports.getProducts = getProducts;
const saveProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield (0, productService_1.createProduct)(req.body);
        (0, responseUtils_1.sendSuccess)(res, 201, product, `El producto ${product.descripcion} con codigo ${product.codigo} se guardo exitosamente`);
    }
    catch (error) {
        console.error('Error al guardar producto:', error);
        (0, responseUtils_1.sendError)(res, error);
    }
});
exports.saveProducts = saveProducts;
const updateProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id ? Number(req.params.id) : Number(req.body.id);
        const product = yield (0, productService_1.updateProduct)(Object.assign(Object.assign({}, req.body), { id }));
        (0, responseUtils_1.sendSuccess)(res, 200, product, 'Producto actualizado exitosamente');
    }
    catch (error) {
        console.error('Error al actualizar producto:', error);
        (0, responseUtils_1.sendError)(res, error);
    }
});
exports.updateProducts = updateProducts;
const importProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const file = req.file;
        if (!file) {
            (0, responseUtils_1.sendError)(res, new errorUtils_1.AppError('Debe enviar un archivo Excel en el campo file'));
            return;
        }
        const result = yield (0, productService_1.importProductsFromExcel)(file.buffer);
        (0, responseUtils_1.sendSuccess)(res, 200, result, 'Importacion de productos finalizada');
    }
    catch (error) {
        console.error('Error al importar productos:', error);
        (0, responseUtils_1.sendError)(res, error);
    }
});
exports.importProducts = importProducts;
