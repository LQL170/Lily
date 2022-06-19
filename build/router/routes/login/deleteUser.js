"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const sys_log_1 = require("../../../configs/sys-log");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/login/deleteUser",
    handler({ body: { user_id }, headers: { __token: { user_id: _user_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, tables_1.getTable)("users");
            const data = yield database_1.pgsql.query(`delete from ?? where id = ? RETURNING username`, [table, user_id]);
            (0, sys_log_1.logFunc)({
                key: "remove_user",
                user_id: _user_id,
                username,
                body: {
                    id: user_id,
                },
                vals: {
                    user: data[0].username || "",
                },
            });
            return {};
        });
    },
};
exports.default = index;
