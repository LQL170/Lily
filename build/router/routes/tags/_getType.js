"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
function get(body) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsql.query(`SELECT role, type FROM ??`, [(0, tables_1.getTable)("tag_type")]);
        return data;
    });
}
const index = {
    method: "POST",
    url: "/tags/_getType",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body);
        });
    },
};
exports.default = index;
