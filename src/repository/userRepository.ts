import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { User } from '../models/userModel';

export const verifyLogin = async (email:String) => {
    const [rows] = await pool.execute('SELECT * FROM user WHERE email = ?', [email]);
    return rows
}

export const getAllUsers = async () => {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT EMAIL, ROLE, STATUS FROM user');
    return rows;
};

export const updateLastLogin = async (email:String) => {
    const [rows] = await pool.execute('UPDATE user SET last_login = NOW() WHERE email = ?', [email]);
    return rows;
};


export const saveUser = async (req:User) => {
    const [rows] = await pool.execute(
        'INSERT INTO user (email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?)', 
        [req.email, req.password, req.role, req.status, req.created_at]
    );
    return rows;

};
