"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptPassword = void 0;
const n_1 = require("@m170/utils/n");
function encryptPassword(username, password) {
    return (0, n_1.sha256)(`${username}${password}`);
}
exports.encryptPassword = encryptPassword;
