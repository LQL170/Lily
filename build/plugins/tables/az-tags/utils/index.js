"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRid = exports.handleStr = void 0;
const n_1 = require("@m170/utils/n");
function handleStr(str) {
    return (str || "").trim();
}
exports.handleStr = handleStr;
function getRid(...items) {
    return (0, n_1.md5)(items.join("###"));
}
exports.getRid = getRid;
