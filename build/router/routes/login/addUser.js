"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const packages_1 = require("../../../packages");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const n_1 = require("@m170/utils/n");
const sys_log_1 = require("../../../configs/sys-log");
function getParents(user_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsql.query(`SELECT parents FROM ?? WHERE id = ? limit 1`, [(0, tables_1.getTable)("users"), user_id]);
        const list = JSON.parse(data[0].parents);
        list.push(user_id);
        return list;
    });
}
const table = (0, tables_1.getTable)("users");
const index = {
    method: "POST",
    url: "/login/addUser",
    handler({ body: { form }, headers: { __token: { user_id: parent_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            form.username = form.username.trim();
            if (!form.username) {
                return (0, packages_1.replyError)("1", "无效命名");
            }
            const exist = yield database_1.pgsql.query(`select username from ?? where username = ? limit 1`, [table, form.username]);
            if (exist.length) {
                return (0, packages_1.replyError)("1", "已有同名用户");
            }
            else {
                const now = new Date();
                const parents = yield getParents(parent_id);
                const base = Object.assign(Object.assign({}, form), { id: (0, n_1.md5)(form.username), parents, create_date: now });
                const data = [base].map((_a) => {
                    var { groups, parents } = _a, items = tslib_1.__rest(_a, ["groups", "parents"]);
                    return Object.assign(items, {
                        groups: JSON.stringify(groups),
                        parents: JSON.stringify(parents),
                    });
                });
                yield database_1.pgsql.insert({
                    table,
                    data,
                });
                (0, sys_log_1.logFunc)({
                    key: "add_user",
                    user_id: parent_id,
                    username,
                    body: form,
                    vals: {
                        user: form.username,
                    },
                });
                const { password } = base, item = tslib_1.__rest(base, ["password"]);
                return {
                    item: Object.assign(item, {
                        timestamp: now,
                    }),
                };
            }
        });
    },
};
exports.default = index;
