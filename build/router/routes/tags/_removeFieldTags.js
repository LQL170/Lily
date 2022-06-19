"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const table = (0, tables_1.getTable)("fields");
function method({ field }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield database_1.pgsql.query(`delete from ?? where field = ? `, [table, field]);
        return "";
    });
}
const index = {
    method: "POST",
    url: "/tags/_removeFieldTags",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield method(body);
        });
    },
};
exports.default = index;
