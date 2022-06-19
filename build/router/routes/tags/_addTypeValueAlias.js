"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const packages_1 = require("../../../packages");
const tables_1 = require("../../../plugins/tables");
const _setTypeValueAlias_1 = require("./_setTypeValueAlias");
const table = (0, tables_1.getTable)("tag_value");
function get({ id, value }, username) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        value = value.map((x) => x.trim()).filter((x) => x);
        if (!value.length) {
            return (0, packages_1.replyError)("1", "值为空");
        }
        const cValue = yield (0, _setTypeValueAlias_1.noExistValue)(value, { id });
        if (cValue) {
            const { id, type, value } = cValue;
            const now = new Date();
            const value_e = now.getTime();
            const list = value.map((value) => {
                return {
                    id,
                    type,
                    value,
                    mainitem: "0",
                    rid: (0, tables_1.getTypeId)(type, value),
                    username,
                };
            });
            yield database_1.pgsql.insert({
                table,
                data: list,
            });
            return list.map(({ rid, value, username }) => {
                return {
                    rid,
                    value,
                    username,
                    timestamp: now,
                    root: false,
                };
            });
        }
        else {
            return (0, packages_1.replyError)("1", "值重复");
        }
    });
}
const index = {
    method: "POST",
    url: "/tags/_addTypeValueAlias",
    handler({ body, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body, username);
        });
    },
};
exports.default = index;
