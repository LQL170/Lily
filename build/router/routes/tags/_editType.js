"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const packages_1 = require("../../../packages");
const tables_1 = require("../../../plugins/tables");
const methods_1 = require("../../../plugins/tables/import/methods");
function get({ action, form: { role, type } }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const table = (0, tables_1.getTable)("tag_type");
        role = role.trim();
        type = type.trim();
        if (action === "remove") {
            yield database_1.pgsql.query(`delete from ?? where role = ? and type = ?`, [
                table,
                role,
                type,
            ]);
        }
        else if (action === "add") {
            const e = yield database_1.pgsql.query(`SELECT type from ?? where type = ? limit 1`, [
                table,
                type,
            ]);
            if (e.length) {
                return (0, packages_1.replyError)("1", "类型已经存在");
            }
            else {
                const e = yield database_1.pgsql.query(`SELECT max(prefix_number) as max from ?? `, [table, type]);
                const prefix_number = e[0].max + 1;
                const prefix = (0, methods_1.getPrefixByNum)(prefix_number);
                yield database_1.pgsql.insert({
                    table,
                    data: [
                        {
                            role,
                            type,
                            prefix,
                            prefix_number,
                        },
                    ],
                });
            }
        }
        return "";
    });
}
const index = {
    method: "POST",
    url: "/tags/_editType",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body);
        });
    },
};
exports.default = index;
