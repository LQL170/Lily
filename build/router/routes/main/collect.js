"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/main/collect",
    handler({ body: { status, res_id }, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, tables_1.getTable)("nlp_upload_collect");
            yield database_1.pgsql.query(`delete from ?? where res_id in (?) and username = ?`, [
                table,
                res_id,
                username,
            ]);
            if (status) {
                yield database_1.pgsql.insert({
                    table,
                    data: res_id.map((x) => ({
                        res_id: x,
                        username,
                    })),
                });
            }
            return {};
        });
    },
};
exports.default = index;
