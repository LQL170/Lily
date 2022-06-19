"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const packages_1 = require("../../../packages");
const tables_1 = require("../../../plugins/tables");
const updateRole_1 = require("../login/updateRole");
const table = (0, tables_1.getTable)("fields");
function get({ field, form }, username) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        field = field.trim();
        if (!field) {
            return (0, packages_1.replyError)("1", "无效命名");
        }
        const { updateParams, updateStr } = (0, updateRole_1.getUpdateSql)(form, [
            "icon",
            "svg",
            "mapping",
        ]);
        if (updateStr) {
            yield database_1.pgsql.query(`update ?? set ${updateStr} where field = ?`, [
                table,
                ...updateParams,
                field,
            ]);
        }
        return "";
    });
}
const index = {
    method: "POST",
    url: "/tags/_updateFieldTags",
    handler({ body, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body, username);
        });
    },
};
exports.default = index;
