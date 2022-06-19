"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const packages_1 = require("../../../packages");
const tables_1 = require("../../../plugins/tables");
const table = (0, tables_1.getTable)("tag_value");
function get({ rid, old_rid }, { username }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (rid && old_rid && rid !== old_rid) {
            yield database_1.pgsql.transactions((query) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield Promise.all([
                    query(`update ?? set mainitem  = ?, username = ? where rid = ?`, [
                        table,
                        "1",
                        username,
                        rid,
                    ]),
                    query(`update ?? set mainitem  = ?, username = ? where rid = ?`, [
                        table,
                        "0",
                        username,
                        old_rid,
                    ]),
                ]);
            }));
        }
        else {
            return (0, packages_1.replyError)("1", "请求参数异常");
        }
        return "";
    });
}
const index = {
    method: "POST",
    url: "/tags/_stdTypeValueAlias",
    handler({ body, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield get(body, { username });
        });
    },
};
exports.default = index;
