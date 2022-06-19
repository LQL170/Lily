"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
function get({ id }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsql.query(`select ?? from ?? where id = ?`, [
            ["rid", "value", "mainitem", "username", "timestamp"],
            (0, tables_1.getTable)("tag_value"),
            id,
        ]);
        return data.map((_a) => {
            var { mainitem } = _a, items = tslib_1.__rest(_a, ["mainitem"]);
            return Object.assign(items, {
                root: Boolean(+mainitem),
            });
        });
    });
}
const index = {
    method: "POST",
    url: "/tags/_getTypeValueAlias",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body);
        });
    },
};
exports.default = index;
