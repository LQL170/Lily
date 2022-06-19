"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveMin = exports.removeMin = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const methods_1 = require("../../../plugins/convert/methods");
const keys = [
    "source",
    "source-pdf",
    "source-pdf-split",
    "source-pdf-split-img",
    "source-pdf-split-img-min",
];
const min = (key, id, target) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (key === "source-pdf") {
        const base = n_1.path.join(methods_1.dirOptions[key], id + ".pdf");
        if (yield n_1.fse.pathExists(base)) {
            if (target) {
                yield n_1.fse.move(base, n_1.path.join(methods_1.dirOptions[key], target + ".pdf"));
            }
            else {
                yield n_1.fse.remove(base);
            }
        }
    }
    else {
        const base = n_1.path.join(methods_1.dirOptions[key], id);
        if (yield n_1.fse.pathExists(base)) {
            if (target) {
                yield n_1.fse.move(base, n_1.path.join(methods_1.dirOptions[key], target));
            }
            else {
                yield n_1.fse.remove(base);
            }
        }
    }
});
function removeMin(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield Promise.all(keys.map((x) => min(x, id)));
    });
}
exports.removeMin = removeMin;
function moveMin(id, target) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield Promise.all(keys.map((x) => min(x, id, target)));
    });
}
exports.moveMin = moveMin;
function remove(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield Promise.all(id.map((x) => removeMin(x)));
    });
}
const index = {
    method: "POST",
    url: "/main/filesRemove",
    handler({ body: { id } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                database_1.pgsql.query(`delete from ?? where id in (?)`, [
                    (0, tables_1.getTable)("nlp_upload"),
                    id,
                ]),
                database_1.pgsql.query(`delete from ?? where id in (?)`, [
                    (0, tables_1.getTable)("nlp_upload_old"),
                    id,
                ]),
                database_1.pgsql.query(`delete from ?? where res_id in (?)`, [
                    (0, tables_1.getTable)("nlp_text"),
                    id,
                ]),
                database_1.pgsql.query(`delete from ?? where res_id in (?)`, [
                    (0, tables_1.getTable)("nlp_entity"),
                    id,
                ]),
                remove(id),
            ]);
            return "";
        });
    },
};
exports.default = index;
