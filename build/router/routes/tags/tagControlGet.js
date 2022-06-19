"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
function method() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const table = (0, tables_1.getTable)("tag_type_control");
        const data = yield database_1.pgsql.query(`SELECT distinct type FROM ?? `, [table]);
        return data.map((x) => x.type);
    });
}
const index = {
    method: "POST",
    url: "/tags/tagControlGet",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield method();
        });
    },
};
exports.default = index;
