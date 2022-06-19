"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/msg/read",
    handler({ body: { rid, all }, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, tables_1.getTable)("msg_users");
            const now = new Date();
            if (rid) {
                yield database_1.pgsql.query(`update ?? set ?? = ? where rid = ? and status is null`, [
                    table,
                    "status",
                    now,
                    rid,
                ]);
            }
            else if (all) {
                yield database_1.pgsql.query(`update ?? set ?? = ? where username = ? and status is null`, [
                    table,
                    "status",
                    now,
                    username,
                ]);
            }
            return [];
        });
    },
};
exports.default = index;
