"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const table = (0, tables_1.getTable)("groups");
function removeGroupMin({ id, groups, remove, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const newRole = JSON.parse(groups);
        const index = newRole.findIndex((x) => x === remove);
        if (index > -1) {
            newRole.splice(index, 1);
            yield database_1.pgsql.query(`update ?? set ?? = ? where id = ?`, [
                (0, tables_1.getTable)("users"),
                "groups",
                JSON.stringify(newRole),
                id,
            ]);
        }
    });
}
function removeGroup(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const groups = yield database_1.pgsql.query(`select id, groups from ?? where groups like ?`, [
            (0, tables_1.getTable)("users"),
            `%${id}%`,
        ]);
        yield Promise.all(groups.map((x) => removeGroupMin({
            id: x.id,
            groups: x.groups,
            remove: id,
        })));
    });
}
const index = {
    method: "POST",
    url: "/login/deleteGroup",
    handler({ body: { id }, headers: { __token: { user_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                database_1.pgsql.query(`delete from ?? where id = ?`, [table, id]),
                removeGroup(id),
            ]);
            return {};
        });
    },
};
exports.default = index;
