"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/tags/tagControlSet",
    handler({ body: { enable, type }, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, tables_1.getTable)("tag_type_control");
            if (enable) {
                yield database_1.pgsql.insert({
                    table,
                    data: [
                        {
                            username,
                            type,
                        },
                    ],
                });
            }
            else {
                yield database_1.pgsql.query(`delete from ?? WHERE type = ?`, [table, type]);
            }
            return "";
        });
    },
};
exports.default = index;
