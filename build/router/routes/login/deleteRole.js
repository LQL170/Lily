"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const sys_log_1 = require("../../../configs/sys-log");
const tables_1 = require("../../../plugins/tables");
function deleteRoleFromGroupMin({ id, role, remove, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const newRole = JSON.parse(role);
        const index = newRole.findIndex((x) => x === remove);
        if (index > -1) {
            newRole.splice(index, 1);
            yield database_1.pgsql.query(`update ?? set ?? = ? where id = ?`, [
                (0, tables_1.getTable)("groups"),
                "roles",
                JSON.stringify(newRole),
                id,
            ]);
        }
    });
}
function deleteRoleFromGroup(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const groups = yield database_1.pgsql.query(`select id, roles from ?? where roles like ?`, [
            (0, tables_1.getTable)("groups"),
            `%${id}%`,
        ]);
        yield Promise.all(groups.map((x) => deleteRoleFromGroupMin({
            id: x.id,
            role: x.roles,
            remove: id,
        })));
    });
}
const index = {
    method: "POST",
    url: "/login/deleteRole",
    handler({ body: { id }, headers: { __token: { user_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, tables_1.getTable)("roles");
            const [data] = yield Promise.all([
                database_1.pgsql.query(`delete from ?? where id = ? RETURNING name`, [table, id]),
                deleteRoleFromGroup(id),
            ]);
            (0, sys_log_1.logFunc)({
                key: "remove_role",
                user_id,
                username,
                body: { id },
                vals: {
                    role: data[0].name || "",
                },
            });
            return {};
        });
    },
};
exports.default = index;
