"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const table = (0, tables_1.getTable)("fields");
function get({}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsql.query(`SELECT ?? from ??`, [
            ["field", "mapping", "timestamp", "username", "icon", "svg"],
            table,
        ]);
        return data.map((_a) => {
            var { mapping } = _a, items = tslib_1.__rest(_a, ["mapping"]);
            return Object.assign(Object.assign({}, items), { count: JSON.parse(mapping).tags.length, mapping: JSON.parse(mapping) });
        });
    });
}
const index = {
    method: "POST",
    url: "/tags/_getFieldTags",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body);
        });
    },
};
exports.default = index;
