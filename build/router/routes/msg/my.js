"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/msg/my",
    handler({ body: { limit, type }, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const filter = ["a.username = ?"];
            const filterP = [username];
            if (type) {
                filter.push(` a.type = ? `);
                filterP.push(type);
            }
            const data = yield database_1.pgsql.query(`SELECT a.type, a.rid, a.status, b.vals, b."timestamp" FROM ?? as a 
      LEFT JOIN ?? as b on a.id = b.id where ${filter.join(" and ")} order by b.timestamp desc offset ? limit ?`, [
                (0, tables_1.getTable)("msg_users"),
                (0, tables_1.getTable)("msg_data"),
                ...filterP,
                limit[0],
                limit[1] - limit[0],
            ]);
            if (data.length) {
                const types = yield database_1.pgsql.query(`select type, content from ?? where type in (?)`, [(0, tables_1.getTable)("msg_model"), (0, n_1.arrUnique)(data.map((x) => x.type))]);
                return {
                    data,
                    types,
                };
            }
            return {
                types: [],
                data: [],
            };
        });
    },
};
exports.default = index;
