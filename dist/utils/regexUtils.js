"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmail = void 0;
const isEmail = (email) => {
    const emailFormat = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    return email.trim() !== '' && emailFormat.test(email);
};
exports.isEmail = isEmail;
