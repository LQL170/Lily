"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const nlp_api_1 = require("../../../plugins/nlp-api");
const n_1 = require("@m170/utils/n");
const cache_1 = require("../../../cache");
function filterItems(params) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (params) {
            const common = params.filter((x) => x.role === "common");
            const field = params.filter((x) => x.role === "field");
            const commonFilter = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (common.length) {
                    const arr = (0, n_1.arrUnique)((0, n_1.arrConcatSet)(common.map(({ type, value }) => value.map((e) => `${type}${e}`))));
                    const data = yield database_1.pgsql.query(`select distinct res_id from ?? where type || value in (?)`, [(0, tables_1.getTable)("nlp_upload_tags"), arr]);
                    return data.map((x) => x.res_id);
                }
                return false;
            });
            const fieldFilter = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (field.length) {
                    yield cache_1.valueStd.update();
                    const arr = (0, n_1.arrUnique)((0, n_1.arrConcatSet)(field.map(({ type, value }) => (0, n_1.arrConcatSet)(value.map((z) => cache_1.valueStd.stdR(z).map((e) => `${type}${e}`.toLowerCase()))))));
                    const data = yield database_1.pgsql.query(`select distinct res_id from ?? where lower(type || value) in (?)`, [(0, tables_1.getTable)("nlp_entity"), arr]);
                    return data.map((x) => x.res_id);
                }
                return false;
            });
            const [a, b] = yield Promise.all([commonFilter(), fieldFilter()]);
            if (a && b) {
                const need = (0, n_1.arrObject)(a);
                return b.filter((x) => need[x]);
            }
            else if (!a && !b) {
                return false;
            }
            else {
                return a || b;
            }
        }
        return false;
    });
}
function nlpSearch(search) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const s = search === null || search === void 0 ? void 0 : search.trim();
        if (s) {
            return yield (0, nlp_api_1.searchM)(s);
        }
        return false;
    });
}
function getOrders(cardForm) {
    let base = `order by timestamp, name desc`;
    if (cardForm === null || cardForm === void 0 ? void 0 : cardForm.sort) {
        const { prop, order } = cardForm.sort;
        if (prop && order) {
            const map = {
                approval_date: "approval_timestamp || name",
                upload_date: "timestamp || name",
            };
            const orderText = order === "asc" ? "" : "desc";
            base = `order by ${map[prop]} ${orderText}`;
        }
    }
    return base;
}
exports.getOrders = getOrders;
function get({ fileStatus, withCount, range = [0, 10], field, isCollect, search, filter: filterForm, cardForm, }, username) {
    var _a, _b;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const filter = [];
        const filterP = [];
        const fileStatusHanle = typeof fileStatus === "string" ? [fileStatus] : fileStatus;
        {
            let statusFilter = [];
            let statusFilterP = [];
            if (fileStatusHanle.includes("expire")) {
                statusFilter.push("expire_timestamp < ?");
                statusFilterP.push(new Date());
            }
            const _else = fileStatusHanle.filter((x) => x !== "expire");
            if (_else.length) {
                statusFilter.push("file_status in (?)");
                statusFilterP.push(fileStatusHanle);
            }
            if (statusFilter.length) {
                filter.push(statusFilter.join(" or "));
                filterP.push(...statusFilterP);
            }
        }
        const filename = (_a = cardForm === null || cardForm === void 0 ? void 0 : cardForm.filename) === null || _a === void 0 ? void 0 : _a.trim();
        if (filename) {
            filter.push(`name ~* ?`);
            filterP.push(filename);
        }
        if (field && field !== "全部") {
            filter.push(" id in (select res_id from ?? where field = ?) ");
            filterP.push((0, tables_1.getTable)("nlp_upload_field"), field);
        }
        if (isCollect) {
            filter.push(" id in (select res_id from ?? where username = ?) ");
            filterP.push((0, tables_1.getTable)("nlp_upload_collect"), username);
        }
        const filterIds = yield (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const [listA, listB] = yield Promise.all([
                filterItems(filterForm),
                nlpSearch(search),
            ]);
            if (!listA && !listB) {
                return false;
            }
            let ids = [];
            if (listA) {
                ids = listA;
            }
            if (listB) {
                ids = listB;
            }
            return ids;
        }))();
        if (filterIds) {
            if (filterIds.length) {
                filter.push(" id in (?) ");
                filterP.push(filterIds);
            }
            else {
                return {
                    data: [],
                    count: 0,
                };
            }
        }
        const orders = getOrders(cardForm);
        const filterQ = filter.length ? ` where ${filter.join(" and ")} ` : "";
        const query = `select id from ?? ${filterQ} ${orders} offset ? limit ?`;
        const querCount = `select count(*) as count from ?? ${filterQ}`;
        const table = (0, tables_1.getTable)("nlp_upload");
        const [base, count] = yield Promise.all([
            database_1.pgsql.query(query, [
                table,
                ...filterP,
                range[0],
                range[1] - range[0],
            ]),
            withCount
                ? database_1.pgsql.query(querCount, [table, ...filterP])
                : [{ count: 0 }],
        ]);
        return {
            data: base.map((x) => x.id),
            count: +((_b = count[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
        };
    });
}
const index = {
    method: "POST",
    url: "/main/filesListIds",
    handler({ body, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body, username);
        });
    },
};
exports.default = index;
