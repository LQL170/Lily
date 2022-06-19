"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExistFiles = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
function getExistFiles(item) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if ("files" in item) {
            const data = yield database_1.pgsql.query(`SELECT id, name||ext as name FROM ?? where name || ext in (?)`, [(0, tables_1.getTable)("nlp_upload"), item.files]);
            return data;
        }
        else {
            const data = yield database_1.pgsql.query(`SELECT id, name||ext as name FROM ?? where id in (?)`, [(0, tables_1.getTable)("nlp_upload"), item.ids]);
            return data;
        }
    });
}
exports.getExistFiles = getExistFiles;
const index = {
    method: "POST",
    url: "/main/fileUploadVerify",
    handler({ body: { list } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                data: (yield getExistFiles({ files: list })).map((x) => x.name),
            };
        });
    },
};
exports.default = index;
