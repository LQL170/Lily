"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const sys_log_1 = require("../../../configs/sys-log");
const tables_1 = require("../../../plugins/tables");
const updateRole_1 = require("./updateRole");
const index = {
    method: "POST",
    url: "/login/updateUser",
    handler({ body: { id, form }, headers: { __token: { user_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, tables_1.getTable)("users");
            const { updateParams, updateStr } = (0, updateRole_1.getUpdateSql)(form, [
                "mail",
                "available",
                "password",
                "groups",
            ]);
            const updateA = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (form.available !== undefined && !form.available) {
                    yield database_1.pgsql.query(`update ?? set ?? = ? where parents like ?`, [
                        table,
                        "available",
                        0,
                        `%${id}%`,
                    ]);
                }
            });
            let nowName = "";
            if (updateStr) {
                const [update] = yield Promise.all([
                    database_1.pgsql.query(`update ?? set ${updateStr} where id = ? RETURNING username`, [table, ...updateParams, id]),
                    updateA(),
                ]);
                nowName = update[0].username || "";
                if (form.groups) {
                    yield (0, updateRole_1.updateRoleBy)({
                        user_id: [id],
                    });
                }
            }
            (0, sys_log_1.logFunc)({
                key: "update_user",
                user_id,
                username,
                body: {
                    id,
                    form,
                },
                vals: {
                    user: nowName,
                },
            });
            delete form.password;
            return Object.assign(Object.assign({}, form), { timestamp: new Date() });
        });
    },
};
exports.default = index;
