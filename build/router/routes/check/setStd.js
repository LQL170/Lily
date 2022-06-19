"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
function _getId({ type, value }) {
    return (0, n_1.md5)(type + "###" + value);
}
const index = {
    method: "POST",
    url: "/check/setStd",
    handler({ body: { type, value, std_value }, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const id = _getId({ type, value });
            const table = (0, tables_1.getTable)("nlp_entity_std");
            const data = yield database_1.pgsql.query(`select id from ?? where id = ? limit 1`, [
                table,
                id,
            ]);
            if (data.length) {
                yield database_1.pgsql.query(`update ?? set ?? = ?, ?? = ?`, [
                    table,
                    "std_value",
                    std_value,
                    "username",
                    username,
                ]);
            }
            else {
                yield database_1.pgsql.insert({
                    table,
                    data: [
                        {
                            id,
                            username,
                            type,
                            value,
                            std_value,
                        },
                    ],
                });
            }
            return "";
        });
    },
};
exports.default = index;
