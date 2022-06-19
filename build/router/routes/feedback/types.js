"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/feedback/types",
    handler() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const data = yield database_1.pgsql.query(`SELECT type FROM ??`, [(0, tables_1.getTable)("feedback_type")]);
            return data.map((x) => x.type);
        });
    },
};
exports.default = index;
