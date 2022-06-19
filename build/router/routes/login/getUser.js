"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const table = (0, tables_1.getTable)("users");
const index = {
    method: "POST",
    url: "/login/getUser",
    handler({ headers: { __token: { user_id }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let query = `select ?? from ?? `;
            const params = [
                [
                    "id",
                    "username",
                    "mail",
                    "groups",
                    "create_date",
                    "timestamp",
                    "available",
                    "parents",
                ],
                table,
            ];
            query += ` where parents like ? and ( super != 1 or super is null)`;
            params.push(`%${user_id}%`);
            const exist = yield database_1.pgsql.query(query, params);
            return {
                items: exist.map((_a) => {
                    var { groups, parents } = _a, items = tslib_1.__rest(_a, ["groups", "parents"]);
                    return Object.assign(items, {
                        groups: JSON.parse(groups),
                        parents: JSON.parse(parents),
                    });
                }),
            };
        });
    },
};
exports.default = index;
