"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/search/customOptionsGet",
    handler({ headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const data = yield database_1.pgsql.query(`select data from ?? where username = ?`, [(0, tables_1.getTable)("custom_search"), username]);
            if (data.length) {
                return {
                    data: JSON.parse(data[0].data),
                };
            }
            else {
                return {
                    data: [],
                };
            }
        });
    },
};
exports.default = index;
