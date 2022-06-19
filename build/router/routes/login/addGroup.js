"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const n_1 = require("@m170/utils/n");
const packages_1 = require("../../../packages");
const table = (0, tables_1.getTable)("groups");
const index = {
    method: "POST",
    url: "/login/addGroup",
    handler({ body: { form }, headers: { __token: { user_id, username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            form.name = form.name.trim();
            if (!form.name) {
                return (0, packages_1.replyError)("1", "无效命名");
            }
            const isRepeat = yield (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const exist = yield database_1.pgsql.query(`select id from ?? where name = ? limit 1`, [table, form.name]);
                return Boolean(exist.length);
            }))();
            if (isRepeat) {
                return (0, packages_1.replyError)("1", "命名重复");
            }
            const now = new Date();
            const base = Object.assign(Object.assign({}, form), { user_id, create_date: now, id: (0, n_1.md5)(form.name + new Date().getTime()) });
            yield database_1.pgsql.insert({
                table,
                data: [base].map((_a) => {
                    var { roles } = _a, items = tslib_1.__rest(_a, ["roles"]);
                    return Object.assign(items, {
                        roles: JSON.stringify(roles),
                    });
                }),
            });
            return {
                item: Object.assign(base, {
                    username,
                    timestamp: now,
                }),
            };
        });
    },
};
exports.default = index;
