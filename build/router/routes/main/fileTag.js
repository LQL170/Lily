"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const fileUpload_1 = require("./fileUpload");
const index = {
    method: "POST",
    url: "/main/fileTag",
    handler({ body: { data, res_id }, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { expire } = data;
            yield Promise.all([
                (0, fileUpload_1.uploadTags)({
                    res_id,
                    info: data,
                    username,
                }),
                database_1.pgsql.query(`update ?? set ?? = ? where id in (?)`, [
                    (0, tables_1.getTable)("nlp_upload"),
                    "expire_timestamp",
                    expire,
                    res_id,
                ]),
            ]);
            return "";
        });
    },
};
exports.default = index;
