"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupOrType = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const getRoleNames_1 = require("./getRoleNames");
const n_1 = require("@m170/utils/n");
const table = (0, tables_1.getTable)("groups");
function getGroupOrType({ user_id, username }, justType) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const filter = [];
        const filterP = [];
        const issuper = yield (0, getRoleNames_1.isSuper)(user_id);
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
                ["id", "user_id", "name", "desc", "roles", "create_date", "timestamp"],
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
                    var { roles } = _a, items = tslib_1.__rest(_a, ["roles"]);
                    return Object.assign(items, {
                        roles: JSON.parse(roles),
                        username: userMapping[items.user_id],
                    });
                });
            }
            else {
                return exist.map((_a) => {
                    var { roles } = _a, items = tslib_1.__rest(_a, ["roles"]);
                    return Object.assign(items, {
                        roles: JSON.parse(roles),
                        username,
                    });
                });
            }
        }
    });
}
exports.getGroupOrType = getGroupOrType;
const index = {
    method: "POST",
    url: "/login/getGroup",
    handler({ headers: { __token: { user_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const data = yield getGroupOrType({ user_id, username });
            return data;
        });
    },
};
exports.default = index;
