"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleOrType = exports.isSuper = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const table = (0, tables_1.getTable)("roles");
function isSuper(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsql.query(`SELECT super FROM ?? WHERE id = ? and super = ? limit 1`, [(0, tables_1.getTable)("users"), id, 1]);
        return Boolean(data.length);
    });
}
exports.isSuper = isSuper;
function getRoleOrType({ user_id, username }, justType) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const filter = [];
        const filterP = [];
        const issuper = yield isSuper(user_id);
        if (!issuper) {
            filter.push("user_id = ?");
            filterP.push(user_id);
        }
        const filterQ = filter.length ? ` where ${filter.join(" and ")}` : "";
        if (justType) {
            const exist = yield database_1.pgsql.query(`select ?? from ?? ${filterQ}`, [
                ["id", "name", "user_id"],
                table,
                ...filterP,
            ]);
            return exist;
        }
        else {
            const exist = yield database_1.pgsql.query(`select ?? from ?? ${filterQ}`, [
                [
                    "id",
                    "user_id",
                    "name",
                    "desc",
                    "permission",
                    "create_date",
                    "timestamp",
                ],
                table,
                ...filterP,
            ]);
            if (issuper) {
                const ids = exist.map((x) => x.user_id);
                let userMapping = {};
                if (ids.length) {
                    const data = yield database_1.pgsql.query(`select id, username from ?? where id in (?)`, [
                        (0, tables_1.getTable)("users"),
                        ids,
                    ]);
                    userMapping = (0, n_1.arrObject)(data, "id", "username");
                }
                return exist.map((_a) => {
                    var { permission } = _a, items = tslib_1.__rest(_a, ["permission"]);
                    return Object.assign(items, {
                        permission: JSON.parse(permission),
                        username: userMapping[items.user_id],
                    });
                });
            }
            else {
                return exist.map((_a) => {
                    var { permission } = _a, items = tslib_1.__rest(_a, ["permission"]);
                    return Object.assign(items, {
                        permission: JSON.parse(permission),
                        username,
                    });
                });
            }
        }
    });
}
exports.getRoleOrType = getRoleOrType;
const index = {
    method: "POST",
    url: "/login/getRoleNames",
    handler({ headers: { __token: { user_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield getRoleOrType({ user_id, username }, true);
        });
    },
};
exports.default = index;
