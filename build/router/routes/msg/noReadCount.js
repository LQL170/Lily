"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/msg/noReadCount",
    handler({ headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const filter = ["username = ?", "status is null"];
            const filterP = [username];
            const data = yield database_1.pgsql.query(`SELECT count(*) as count FROM ?? where ${filter.join(" and ")} `, [
                (0, tables_1.getTable)("msg_users"),
                ...filterP,
            ]);
            return {
                count: +data[0].count,
            };
        });
    },
};
exports.default = index;
