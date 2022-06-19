"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
function get(body) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const filter = [];
        const filterP = [];
        const table = (0, tables_1.getTable)("feedback_logs");
        if (body.type) {
            filter.push("type = ?");
            filterP.push(body.type);
        }
        if (body.username) {
            filter.push("username = ?");
            filterP.push(body.username);
        }
        if (body.date) {
            const { date } = body;
            if (date[0]) {
                filter.push(`timestamp > ?`);
                filterP.push(date[0]);
            }
            if (date[1]) {
                filter.push(`timestamp < ?`);
                filterP.push(date[1]);
            }
        }
        const filterQuery = filter.length ? ` where ${filter.join(" and ")} ` : "";
        const getCount = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (body.withCount) {
                const counts = yield database_1.pgsql.query(`select count(*) as count from ?? ${filterQuery}`, [table, ...filterP]);
                return +counts[0].count;
            }
            return 0;
        });
        const [data, count] = yield Promise.all([
            database_1.pgsql.query(`SELECT type, text, username FROM ?? ${filterQuery} order by timestamp desc`, [table, ...filterP]),
            getCount(),
        ]);
        return {
            data,
            count,
        };
    });
}
const index = {
    method: "POST",
    url: "/feedback/list",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body);
        });
    },
};
exports.default = index;
