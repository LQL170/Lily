"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddId = exports.oneTable = void 0;
const n_1 = require("@m170/utils/n");
const tables_1 = require("../../../plugins/tables");
exports.oneTable = {
    add: (0, tables_1.getTable)("nlp_entity_add"),
    remark: (0, tables_1.getTable)("nlp_entity_remark"),
    nlp: (0, tables_1.getTable)("nlp_entity"),
};
function getAddId(x) {
    return (0, n_1.md5)(x.rid + x.type + x.value + x.value_start);
}
exports.getAddId = getAddId;
