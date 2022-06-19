"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
function get({ rid }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield database_1.pgsql.query(`delete from ?? where rid in (?)`, [
            (0, tables_1.getTable)("tag_value"),
            rid,
        ]);
        return "";
    });
}
const index = {
    method: "POST",
    url: "/tags/_removeTypeValueAlias",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body);
        });
    },
};
exports.default = index;
