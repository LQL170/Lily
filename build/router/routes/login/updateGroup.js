"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const updateRole_1 = require("./updateRole");
const index = {
    method: "POST",
    url: "/login/updateGroup",
    handler({ body: { id, form }, headers: { __token: { user_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, tables_1.getTable)("groups");
            const { updateParams, updateStr } = (0, updateRole_1.getUpdateSql)(form, [
                "desc",
                "name",
                "roles",
            ]);
            if (updateStr) {
                yield Promise.all([
                    database_1.pgsql.query(`update ?? set ${updateStr} where id = ? `, [
                        table,
                        ...updateParams,
                        id,
                    ]),
                ]);
                if (form.roles) {
                    yield (0, updateRole_1.updateRoleBy)({
                        group_id: [id],
                    });
                }
            }
            return Object.assign(Object.assign({}, form), { timestamp: new Date() });
        });
    },
};
exports.default = index;
