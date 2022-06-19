"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/main/fields",
    handler({ body: { icon } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const arr = icon ? ["field", "icon", "svg"] : ["field"];
            const data = yield database_1.pgsql.query(`SELECT ?? FROM ?? ORDER BY "order"`, [
                arr,
                (0, tables_1.getTable)("fields"),
            ]);
            return data;
        });
    },
};
exports.default = index;
