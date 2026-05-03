"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.importProductsFromExcel = exports.updateProduct = exports.createProduct = exports.listProducts = void 0;
const XLSX = __importStar(require("xlsx"));
const productRepository_1 = require("../repository/productRepository");
const errorUtils_1 = require("../utils/errorUtils");
const parseProductImage = (imagen) => {
    if (!imagen || typeof imagen !== 'string') {
        return null;
    }
    const base64String = imagen.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');
    return buffer.length > 0 ? buffer : null;
};
const serializeProduct = (product) => (Object.assign(Object.assign({}, product), { imagen: product.imagen ? `data:image/jpeg;base64,${product.imagen.toString('base64')}` : null }));
const buildProduct = (productData) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return ({
        id: productData.id,
        ruc: (_a = productData.ruc) !== null && _a !== void 0 ? _a : '',
        codigo: (_b = productData.codigo) !== null && _b !== void 0 ? _b : '',
        codigo_alterno: (_c = productData.codigo_alterno) !== null && _c !== void 0 ? _c : null,
        descripcion: (_d = productData.descripcion) !== null && _d !== void 0 ? _d : '',
        categoria: (_e = productData.categoria) !== null && _e !== void 0 ? _e : null,
        peso: (_f = productData.peso) !== null && _f !== void 0 ? _f : null,
        ubicacion: (_g = productData.ubicacion) !== null && _g !== void 0 ? _g : null,
        precio_unitario: (_h = productData.precio_unitario) !== null && _h !== void 0 ? _h : null,
        precio_venta: (_j = productData.precio_venta) !== null && _j !== void 0 ? _j : null,
        imagen: parseProductImage(productData.imagen),
        estado: (_k = productData.estado) !== null && _k !== void 0 ? _k : 'activo'
    });
};
const allowedUpdateFields = [
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
const hasPatchValue = (value) => {
    return value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '');
};
const buildProductPatch = (productData) => {
    return allowedUpdateFields.reduce((patch, field) => {
        const value = productData[field];
        if (!hasPatchValue(value)) {
            return patch;
        }
        if (field === 'imagen') {
            patch.imagen = parseProductImage(value);
            return patch;
        }
        patch[field] = typeof value === 'string' ? value.trim() : value;
        return patch;
    }, {});
};
const validateProduct = (product) => {
    if (!product.ruc) {
        throw new errorUtils_1.AppError('El ruc del producto es obligatorio');
    }
    if (!product.codigo) {
        throw new errorUtils_1.AppError('El codigo del producto es obligatorio');
    }
    if (!product.descripcion) {
        throw new errorUtils_1.AppError('La descripcion del producto es obligatoria');
    }
};
const normalizeHeader = (value) => {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_');
};
const getCellValue = (row, keys) => {
    for (const key of keys) {
        const normalizedKey = normalizeHeader(key);
        if (row[normalizedKey] !== undefined && row[normalizedKey] !== null && row[normalizedKey] !== '') {
            return row[normalizedKey];
        }
    }
    return undefined;
};
const toStringValue = (value) => {
    return value === undefined || value === null ? '' : String(value).trim();
};
const toNullableString = (value) => {
    const stringValue = toStringValue(value);
    return stringValue || null;
};
const toNullableNumber = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const numberValue = Number(String(value).replace(',', '.'));
    return Number.isNaN(numberValue) ? null : numberValue;
};
const normalizeExcelRow = (row) => {
    return Object.entries(row).reduce((acc, [key, value]) => {
        acc[normalizeHeader(key)] = value;
        return acc;
    }, {});
};
const mapExcelRowToProduct = (row) => {
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
        estado: toStringValue(getCellValue(normalizedRow, ['estado', 'status'])) || 'activo'
    });
};
const listProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield (0, productRepository_1.getAllProducts)();
    return products.map(serializeProduct);
});
exports.listProducts = listProducts;
const createProduct = (productData) => __awaiter(void 0, void 0, void 0, function* () {
    const product = buildProduct(productData);
    validateProduct(product);
    const id = yield (0, productRepository_1.createProduct)(product);
    return serializeProduct(Object.assign(Object.assign({}, product), { id }));
});
exports.createProduct = createProduct;
const updateProduct = (productData) => __awaiter(void 0, void 0, void 0, function* () {
    if (!productData.id) {
        throw new errorUtils_1.AppError('El id del producto es obligatorio para actualizar');
    }
    const productPatch = buildProductPatch(productData);
    const affectedRows = yield (0, productRepository_1.updateProductFields)(productData.id, productPatch);
    if (affectedRows === 0) {
        throw new errorUtils_1.AppError('No se encontro el producto para actualizar', 404);
    }
    return serializeProduct(Object.assign(Object.assign({}, productPatch), { id: productData.id }));
});
exports.updateProduct = updateProduct;
const importProductsFromExcel = (fileBuffer) => __awaiter(void 0, void 0, void 0, function* () {
    let workbook;
    try {
        workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    }
    catch (error) {
        throw new errorUtils_1.AppError('No se pudo leer el archivo Excel');
    }
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
        throw new errorUtils_1.AppError('El archivo Excel no contiene hojas');
    }
    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
    const failedRows = [];
    let processedRows = 0;
    for (const [index, row] of rows.entries()) {
        try {
            const product = mapExcelRowToProduct(row);
            validateProduct(product);
            yield (0, productRepository_1.upsertProductByCodeAndRuc)(product);
            processedRows += 1;
        }
        catch (error) {
            failedRows.push({
                row: index + 2,
                reason: (0, errorUtils_1.getErrorMessage)(error)
            });
        }
    }
    return {
        totalRows: rows.length,
        processedRows,
        failedRows
    };
});
exports.importProductsFromExcel = importProductsFromExcel;
