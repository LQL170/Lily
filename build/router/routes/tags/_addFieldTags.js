"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const packages_1 = require("../../../packages");
const tables_1 = require("../../../plugins/tables");
const table = (0, tables_1.getTable)("fields");
function get({ form: { field, mapping, icon, svg } }, username) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        field = field.trim();
        if (!field) {
            return (0, packages_1.replyError)("1", "无效命名");
        }
        const exist = yield database_1.pgsql.query(`SELECT field from ?? where field = ? limit 1`, [table, field]);
        if (exist.length) {
            return (0, packages_1.replyError)("1", "命名重复");
        }
        const max = yield database_1.pgsql.query(`SELECT max(??) as count FROM "DEMO_fields"`, ["order"]);
        const item = {
            field,
            mapping: JSON.stringify(mapping),
            icon,
            svg,
            username,
            order: max[0].count + 1,
        };
        yield database_1.pgsql.insert({
            table,
            data: [item],
        });
        return "";
    });
}
const index = {
    method: "POST",
    url: "/tags/_addFieldTags",
    handler({ body, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body, username);
        });
    },
};
exports.default = index;
