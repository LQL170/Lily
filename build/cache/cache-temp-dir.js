"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tempDirCache = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const tables_1 = require("../plugins/tables");
const database_1 = require("../configs/database");
const static_1 = require("../configs/static");
const utils_1 = require("../configs/utils");
const utils_2 = require("../configs/utils");
function removeDirs() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const maxDuration = 1000 * 60 * 60 * 24 * 3;
        const dirs = yield n_1.fse.readdir(static_1.tempDir);
        const now = (0, utils_2.getNow)();
        const times = dirs.map((x) => {
            const n = +x.slice(0, 13);
            const c = isNaN(n) ? 0 : n;
            return now - c > maxDuration;
        });
        const needRemove = dirs.filter((_x, index) => times[index]);
        yield Promise.all(needRemove.map((x) => n_1.fse.remove(n_1.path.join(static_1.tempDir, x))));
    });
}
function removeDbFiles() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const table = (0, tables_1.getTable)("nlp_upload");
        const needRemove = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const needIds = yield database_1.pgsql.query(`select id from ?? union select id from ??`, [table, (0, tables_1.getTable)("nlp_upload_old")]);
            const ids = needIds.map((x) => x.id);
            const arr = [];
            (0, n_1.getKeys)(static_1.dirOptions).forEach((x) => {
                if (x === "source-pdf") {
                    arr.push((() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        const dirs = (yield n_1.fse.readdir(static_1.dirOptions[x])).map((x) => {
                            return {
                                file: x,
                                id: n_1.path.parse(x).name,
                            };
                        });
                        const needRemove = dirs
                            .filter((x) => !ids.includes(x.id))
                            .map((e) => e.file);
                        yield Promise.all(needRemove.map((e) => n_1.fse.remove(n_1.path.join(static_1.dirOptions[x], e))));
                    }))());
                }
                else {
                    arr.push((() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                        const dirs = yield n_1.fse.readdir(static_1.dirOptions[x]);
                        const needRemove = dirs.filter((x) => !ids.includes(x));
                        yield Promise.all(needRemove.map((e) => n_1.fse.remove(n_1.path.join(static_1.dirOptions[x], e))));
                    }))());
                }
            });
            yield Promise.all(arr);
        });
        yield Promise.all([
            needRemove(),
            database_1.pgsql.query(`delete from ?? where res_id not in (select id from ??)`, [
                (0, tables_1.getTable)("nlp_text"),
                table,
            ]),
            database_1.pgsql.query(`delete from ?? where res_id not in (select id from ??)`, [
                (0, tables_1.getTable)("nlp_entity"),
                table,
            ]),
        ]);
    });
}
const label = "清除过期临时文件夹";
exports.tempDirCache = (0, utils_1.initCacheData)(() => {
    removeDirs();
    return true;
}, {
    duration: 1000 * 60 * 60 * 24,
    label,
    initial: true,
    callback: {
        clearAll() {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield n_1.fse.emptyDir(static_1.tempDir);
            });
        },
        get(prefix = "default") {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.update();
                const name = `${(0, utils_2.getNow)()}_${prefix}_${Math.random()}`;
                const dir = n_1.path.join(static_1.tempDir, name);
                yield n_1.fse.ensureDir(dir);
                return dir;
            });
        },
        remove(dir) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield n_1.fse.remove(dir);
            });
        },
    },
});
