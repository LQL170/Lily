"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/search/customOptionsSet",
    handler({ body: { data }, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, tables_1.getTable)("custom_search");
            const exist = yield database_1.pgsql.query(`select username from ?? where username = ? limit 1`, [table, username]);
            if (exist.length) {
                yield database_1.pgsql.query(`update ?? set ?? = ? where username = ?`, [
                    table,
                    "data",
                    JSON.stringify(data),
                    username,
                ]);
            }
            else {
                yield database_1.pgsql.insert({
                    table,
                    data: [
                        {
                            username,
                            data: JSON.stringify(data),
                        },
                    ],
                });
            }
            return [];
        });
    },
};
exports.default = index;
