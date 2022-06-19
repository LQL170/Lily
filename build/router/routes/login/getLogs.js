"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const table = (0, tables_1.getTable)("user_logs");
const index = {
    method: "POST",
    url: "/login/getLogs",
    handler({ body: { range = [0, 10], date = ["", ""], withCount, key }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const filter = [];
            const filterP = [];
            if (date[0]) {
                filter.push(`timestamp > ?`);
                filterP.push(date[0]);
            }
            if (date[1]) {
                filter.push(`timestamp < ?`);
                filterP.push(date[1]);
            }
            if (key) {
                filter.push(`key = ?`);
                filterP.push(key);
            }
            const filterQuery = filter.length ? ` where ${filter.join(" and ")}` : "";
            const getCount = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (withCount) {
                    const counts = yield database_1.pgsql.query(`select count(*) as count from ?? ${filterQuery}`, [table, ...filterP]);
                    return +counts[0].count;
                }
                return 0;
            });
            const [data, count] = yield Promise.all([
                database_1.pgsql.query(`select ?? from ?? ${filterQuery} order by timestamp desc offset ? limit ?`, [
                    ["username", "key", "timestamp", "vals"],
                    table,
                    ...filterP,
                    range[0],
                    range[1] - range[0],
                ]),
                getCount(),
            ]);
            return {
                data,
                count,
            };
        });
    },
};
exports.default = index;
