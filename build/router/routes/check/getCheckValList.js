"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = exports.getCheckValListDetail = exports.getCheckValListCount = exports.getCheckValList = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
function getCheckValList({ status, limit = [0, 10], }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const table = (0, tables_1.getTable)("nlp_entity");
        const filter = [];
        const filterP = [];
        if (!status) {
            filter.push("check_status is null");
        }
        else if (status === "all") {
        }
        else {
            filter.push("check_status = ? ");
            filterP.push(status);
        }
        const filterQuery = filter.length ? ` where ${filter.join(" and ")} ` : "";
        const query = `SELECT type, value, COUNT(*) as count FROM ?? ${filterQuery} GROUP BY type, value ORDER BY COUNT(*) desc OFFSET ? limit ?`;
        const data = yield database_1.pgsql.query(query, [
            table,
            ...filterP,
            limit[0],
            limit[1] - limit[0],
        ]);
        return data.map((_a) => {
            var { count } = _a, items = tslib_1.__rest(_a, ["count"]);
            return Object.assign(items, { count: +count });
        });
    });
}
exports.getCheckValList = getCheckValList;
function getCheckValListCount({ status }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const table = (0, tables_1.getTable)("nlp_entity");
        const filter = [];
        const filterP = [];
        if (!status) {
            filter.push("check_status is null");
        }
        else if (status === "all") {
        }
        else {
            filter.push("check_status = ? ");
            filterP.push(status);
        }
        const filterQuery = filter.length ? ` where ${filter.join(" and ")} ` : "";
        const query = `SELECT  COUNT(DISTINCT type || value) as count FROM ?? ${filterQuery}`;
        const data = yield database_1.pgsql.query(query, [table, ...filterP]);
        return +data[0].count;
    });
}
exports.getCheckValListCount = getCheckValListCount;
function getCheckValListDetail({ type, value, limit = [0, 10], status, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (value) {
            const table = (0, tables_1.getTable)("nlp_entity");
            const filter = ["value = ?", "type = ?"];
            const filterP = [value, type];
            if (!status) {
                filter.push("check_status is null");
            }
            else if (status === "all") {
            }
            else {
                filter.push("check_status = ? ");
                filterP.push(status);
            }
            const filterQuery = filter.length ? ` where ${filter.join(" and ")} ` : "";
            const data = yield database_1.pgsql.query(`select id, rid, range from ?? ${filterQuery} order by id offset ? limit ?`, [table, ...filterP, limit[0], limit[1] - limit[0]]);
            return data;
        }
        return [];
    });
}
exports.getCheckValListDetail = getCheckValListDetail;
function getStatus({ value, ids, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const val = "-";
        if (ids === null || ids === void 0 ? void 0 : ids.length) {
            const data = yield database_1.pgsql.query(`SELECT id as key, check_status, check_user, check_date FROM ?? where id in (?)`, [(0, tables_1.getTable)("nlp_entity"), ids]);
            return data.map((_a) => {
                var { check_user, check_status } = _a, items = tslib_1.__rest(_a, ["check_user", "check_status"]);
                return Object.assign(items, {
                    check_status: check_status || val,
                    check_user: check_user || val,
                });
            });
        }
        else if (value === null || value === void 0 ? void 0 : value.length) {
            const split = "###";
            const keyField = `type || '${split}'  || value`;
            const values = value.map((x) => `${x.type}${split}${x.value}`);
            const [data, std] = yield Promise.all([
                database_1.pgsql.query(`SELECT ${keyField} as key, "array_agg"(DISTINCT check_status) as check_status, "array_agg"(DISTINCT check_user) as check_user, "max"( check_date) as check_date FROM ?? WHERE ${keyField} in (?) GROUP BY ${keyField}`, [(0, tables_1.getTable)("nlp_entity"), values]),
                database_1.pgsql.query(`select ${keyField} as key, std_value from ?? where ${keyField} in (?)`, [(0, tables_1.getTable)("nlp_entity_std"), values]),
            ]);
            const objStd = (0, n_1.arrObject)(std, "key", "std_value");
            data.forEach((x) => {
                Object.assign(x, {
                    std_value: objStd[x.key] || '',
                });
            });
            return data.map((_a) => {
                var { check_user, check_status } = _a, items = tslib_1.__rest(_a, ["check_user", "check_status"]);
                return Object.assign(items, {
                    check_status: check_status.map((x) => x || val).join(),
                    check_user: check_user.map((x) => x || val).join(),
                });
            });
        }
        return [];
    });
}
exports.getStatus = getStatus;
const index = {
    method: "POST",
    url: "/check/getCheckValList",
    handler({ body: { status, limit } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield getCheckValList({ status, limit });
        });
    },
};
exports.default = index;
