"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const database_1 = require("../../../configs/database");
const methods_1 = require("../../../plugins/convert/methods");
const url_1 = require("../../../plugins/convert/methods/url");
const tables_1 = require("../../../plugins/tables");
const index = {
    method: "POST",
    url: "/main/filesListBk",
    handler({ body: { id } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const data = yield database_1.pgsql.query(`select id, name || ext as name, timestamp from ?? where ?? = ?`, [(0, tables_1.getTable)("nlp_upload_old"), "parent", id]);
            return {
                data: data.map((x) => Object.assign({ url: (0, url_1.getStaticUrl)(path_1.default.join(methods_1.dirOptions.source, id, x.name)) }, x)),
            };
        });
    },
};
exports.default = index;
