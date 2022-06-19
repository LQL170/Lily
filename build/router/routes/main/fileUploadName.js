"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/main/fileUploadName",
    handler({ body: { name } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const base = yield database_1.pgsql.query(`select ?? from ?? where name in (?)`, [
                ["name"],
                (0, tables_1.getTable)("nlp_upload"),
                name,
            ]);
            return base.map((x) => x.name);
        });
    },
};
exports.default = index;
