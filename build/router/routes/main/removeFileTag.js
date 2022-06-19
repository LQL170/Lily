"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/main/removeFileTag",
    handler({ body: { id } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                database_1.pgsql.query(`delete from ?? where id in (?)`, [
                    (0, tables_1.getTable)("nlp_upload_tags"),
                    id,
                ]),
                database_1.pgsql.query(`delete from ?? where id in (?)`, [
                    (0, tables_1.getTable)("nlp_upload_tags_field"),
                    id,
                ]),
            ]);
            return "";
        });
    },
};
exports.default = index;
