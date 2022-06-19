"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
function method({ id }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const table = (0, tables_1.getTable)("tag_value");
        yield Promise.all([
            database_1.pgsql.query(`update ?? set status = ? where id = ? and mainitem = ?`, [
                table,
                null,
                id,
                "1",
            ]),
        ]);
        return "";
    });
}
const index = {
    method: "POST",
    url: "/tags/_cancelRemoveTypeValue",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield method(body);
        });
    },
};
exports.default = index;
