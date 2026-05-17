import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const getSchemaName = (schemaName: string): string => {
    if (!/^[a-zA-Z0-9_]+$/.test(schemaName)) {
        throw new Error(`Nombre de esquema invalido: ${schemaName}`);
    }

    return schemaName;
};

export const inventorySchema = getSchemaName(process.env.DB_INVENTORY_NAME || 'ipd_inventory');
export const inventoryTable = (tableName: string): string => {
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        throw new Error(`Nombre de tabla invalido: ${tableName}`);
    }

    return `\`${inventorySchema}\`.\`${tableName}\``;
};

export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'ipd_inventory',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true
});
