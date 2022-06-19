"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/msg/types",
    handler({ body }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const data = yield database_1.pgsql.query(`select type, label, file_control from ??`, [(0, tables_1.getTable)("msg_model")]);
            return data.map((_a) => {
                var { file_control } = _a, items = tslib_1.__rest(_a, ["file_control"]);
                return Object.assign(Object.assign({}, items), { file_control: Boolean(file_control) });
            });
        });
    },
};
exports.default = index;
