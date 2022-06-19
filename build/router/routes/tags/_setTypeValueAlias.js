"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noExistValue = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const packages_1 = require("../../../packages");
const tables_1 = require("../../../plugins/tables");
const table = (0, tables_1.getTable)("tag_value");
function noExistValue(value, item) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { type, id } = yield (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if ("id" in item) {
                const type = yield database_1.pgsql.query(`select type from ?? where id = ? limit 1`, [table, item.id]);
                return {
                    type: type[0].type,
                    id: item.id,
                };
            }
            else {
                const type = yield database_1.pgsql.query(`select type, id from ?? where rid = ? limit 1`, [table, item.rid]);
                return type[0];
            }
        }))();
        if (type) {
            const exist = yield database_1.pgsql.query(`select id from ?? where type = ? and value in (?) limit 1`, [table, type, value]);
            if (!exist.length) {
                return {
                    id,
                    type,
                    value,
                };
            }
        }
        return false;
    });
}
exports.noExistValue = noExistValue;
function get({ rid, value }, { username }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        value = value.trim();
        if (!value) {
            return (0, packages_1.replyError)("1", "值为空");
        }
        const cValue = yield noExistValue([value], { rid });
        if (cValue) {
            yield Promise.all([
                database_1.pgsql.query(`update ?? set value  = ?, username = ? where rid = ?`, [
                    table,
                    value,
                    username,
                    rid,
                ]),
            ]);
        }
        else {
            return (0, packages_1.replyError)("1", "值重复");
        }
        return "";
    });
}
const index = {
    method: "POST",
    url: "/tags/_setTypeValueAlias",
    handler({ body, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body, { username });
        });
    },
};
exports.default = index;
