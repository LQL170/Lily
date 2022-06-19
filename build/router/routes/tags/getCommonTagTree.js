"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
function get() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const query = `SELECT a.id, a.status, a.type, b.tree_id, a.value FROM ?? as a INNER JOIN ?? as b on a.id = b.id where a.type in (SELECT type FROM ?? WHERE ?? = ?) and a.mainitem = '1' `;
        const data = yield database_1.pgsql.query(query, [
            (0, tables_1.getTable)("tag_value"),
            (0, tables_1.getTable)("tag_value_tree"),
            (0, tables_1.getTable)("tag_type"),
            "role",
            "common",
        ]);
        return {
            nodes: data.map((_a) => {
                var { status } = _a, e = tslib_1.__rest(_a, ["status"]);
                return Object.assign(e, {
                    is_delete: status === "delete",
                });
            }),
        };
    });
}
const index = {
    method: "POST",
    url: "/tags/getCommonTagTree",
    handler() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get();
        });
    },
};
exports.default = index;
