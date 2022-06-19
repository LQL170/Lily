"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTags = void 0;
const tslib_1 = require("tslib");
const convert_1 = require("../../../plugins/convert");
const stream_1 = require("stream");
const util_1 = require("util");
const utils_1 = require("../../../plugins/convert/methods/utils");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const filesRemove_1 = require("./filesRemove");
const fileUploadVerify_1 = require("./fileUploadVerify");
const sys_log_1 = require("../../../configs/sys-log");
const cache_1 = require("../../../cache");
const path_1 = require("path");
const pump = (0, util_1.promisify)(stream_1.pipeline);
function uploadTags({ info, res_id, username, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const minA = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, tables_1.getTable)("nlp_upload_tags");
            const tags = (() => {
                const list = [];
                info.tags.forEach(({ name, data }) => {
                    data.forEach((x) => {
                        res_id.forEach((res_id) => {
                            list.push({
                                res_id,
                                id: (0, n_1.md5)(res_id + name + x),
                                type: name,
                                value: x,
                                username,
                            });
                        });
                    });
                });
                return list;
            })();
            if (!tags.length) {
                return;
            }
            yield database_1.pgsql.query(`delete from ?? where res_id in (?)`, [table, res_id]);
            yield database_1.pgsql.insert({ table, data: tags });
        });
        const minB = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, tables_1.getTable)("nlp_upload_field");
            const list = [];
            info.fields.forEach((field) => {
                res_id.forEach((res_id) => {
                    list.push({
                        res_id,
                        field,
                        username,
                    });
                });
            });
            yield database_1.pgsql.query(`delete from ?? where res_id in (?)`, [table, res_id]);
            yield database_1.pgsql.insert({ table, data: list });
        });
        yield Promise.all([minA(), minB()]);
    });
}
exports.uploadTags = uploadTags;
function newRecordInsert(task, { user_upload, file_status, info }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { expire: expire_timestamp } = info;
        yield database_1.pgsql.insert({
            table: (0, tables_1.getTable)("nlp_upload"),
            data: task.map(({ id, name, ext, cExt }) => {
                return {
                    id,
                    name,
                    ext,
                    c_ext: cExt,
                    user_upload,
                    expire_timestamp,
                    file_status,
                };
            }),
        });
    });
}
function handleDefault({ files, info, username, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!files.length) {
            return;
        }
        const min = ({ file, filename }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { id, ext, name, cExt } = yield (0, utils_1.getId)(filename);
            const source = n_1.path.join(utils_1.dirOptions.source, id, filename);
            yield n_1.fse.move(file, source);
            const task = { id, ext, name, cExt, source };
            return task;
        });
        const tasks = yield Promise.all(files.map((x) => min(x)));
        yield Promise.all([
            newRecordInsert(tasks, {
                user_upload: username,
                file_status: "upload",
                info,
            }),
            uploadTags({
                res_id: tasks.map((x) => x.id),
                info,
                username,
            }),
        ]);
        tasks.forEach((task) => {
            convert_1.convertTask.add(task);
        });
    });
}
function handleNew({ files, info, username, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!files.length) {
            return;
        }
        const mapping = [];
        const min = ({ file, filename, source_id }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let { id, ext, name, cExt } = yield (0, utils_1.getId)(filename);
            const old_id = id;
            id = source_id;
            const source = n_1.path.join(utils_1.dirOptions.source, id, filename);
            yield (0, filesRemove_1.moveMin)(id, old_id);
            yield n_1.fse.move(file, source);
            const task = { id, ext, name, cExt, source };
            mapping.push({
                source_id,
                old_id,
            });
            return task;
        });
        const tasks = yield Promise.all(files.map((x) => min(x)));
        const newUpdate = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!mapping.length) {
                return;
            }
            const data = yield database_1.pgsql.query(`select ?? from ?? where id in (?)`, [
                [
                    "id",
                    "name",
                    "ext",
                    "c_ext",
                    "user_upload",
                    "timestamp",
                    "expire_timestamp",
                    "status_handle",
                    "status_entity",
                    "status_filetag",
                ],
                (0, tables_1.getTable)("nlp_upload"),
                mapping.map((x) => x.source_id),
            ]);
            if (!data.length) {
                return;
            }
            const update = {
                user_upload: username,
                timestamp: new Date(),
                status_handle: null,
                status_entity: null,
                status_filetag: null,
            };
            const updateS = [];
            const updateP = [];
            (0, n_1.getKeys)(update).forEach((x) => {
                updateS.push("?? = ?");
                updateP.push(x, update[x]);
            });
            const map = (0, n_1.arrObject)(mapping, "source_id", "old_id");
            yield database_1.pgsql.transactions((query) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const oldData = data.map((_a) => {
                    var { id } = _a, items = tslib_1.__rest(_a, ["id"]);
                    return Object.assign({ parent: id }, items, { id: map[id] });
                });
                const keys = (0, n_1.getKeys)(oldData[0]);
                yield Promise.all([
                    query(`update ?? set ${updateS.join()} where id in (?)`, [
                        (0, tables_1.getTable)("nlp_upload"),
                        ...updateP,
                        mapping.map((x) => x.source_id),
                    ]),
                    query(`insert into ??(??) values ?`, [
                        (0, tables_1.getTable)("nlp_upload_old"),
                        keys,
                        oldData.map((e) => keys.map((x) => e[x])),
                    ]),
                ]);
            }));
        });
        yield newUpdate();
        tasks.forEach((task) => {
            convert_1.convertTask.add(task);
        });
    });
}
function handle({ files, info, username, tempDir, }) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const isExist = (0, n_1.arrObject)(yield (0, fileUploadVerify_1.getExistFiles)({ files: files.map((x) => x.filename) }), "name", "id");
        const isNew = (0, n_1.arrObject)((_a = info.newVersion) !== null && _a !== void 0 ? _a : []);
        const except = [];
        const insert = [];
        const update = [];
        files.forEach((x) => {
            if (isNew[x.filename] && isExist[x.filename]) {
                update.push(x);
            }
            else if (isNew[x.filename] && !isExist[x.filename]) {
                except.push(x);
            }
            else if (isExist[x.filename] && !isNew[x.filename]) {
                except.push(x);
            }
            else {
                insert.push(x);
            }
        });
        yield Promise.all([
            handleDefault({
                files: insert,
                info,
                username,
            }),
            handleNew({
                files: update.map((x) => (Object.assign(Object.assign({}, x), { source_id: isExist[x.filename] }))),
                info,
                username,
            }),
        ]);
        n_1.fse.remove(tempDir);
        return {
            insert: insert.map((x) => x.filename),
            except: except.map((x) => x.filename),
            update: update.map((x) => x.filename),
        };
    });
}
function initFilesInfo() {
    let infoReady = false;
    const info = {
        expire: null,
        fields: [],
        tags: [],
        newVersion: [],
    };
    function infoGet(e) {
        if (!infoReady) {
            Object.assign(info, JSON.parse(e));
            infoReady = true;
        }
    }
    return {
        info,
        infoGet,
    };
}
const index = {
    method: "POST",
    url: "/main/fileUpload",
    handler(req) {
        var e_1, _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const parts = req.parts();
            const { username, user_id } = req.headers.__token;
            const { info, infoGet } = initFilesInfo();
            const tempDir = yield cache_1.tempDirCache.get("upload");
            const min = (part) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const { filename } = part;
                const file = (0, path_1.join)(tempDir, filename);
                yield pump(part.file, n_1.fse.createWriteStream(file));
                return {
                    file,
                    filename,
                };
            });
            const minArr = [];
            try {
                for (var parts_1 = tslib_1.__asyncValues(parts), parts_1_1; parts_1_1 = yield parts_1.next(), !parts_1_1.done;) {
                    const part = parts_1_1.value;
                    if (part.file) {
                        minArr.push(min(part));
                    }
                    else if (part.fieldname === "info") {
                        infoGet(part.value);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (parts_1_1 && !parts_1_1.done && (_a = parts_1.return)) yield _a.call(parts_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            const files = yield Promise.all(minArr);
            const { insert, except } = yield handle({ files, info, tempDir, username });
            (0, sys_log_1.logFunc)({
                key: "file_upload",
                username,
                user_id,
                body: {},
                vals: {
                    fileCount: insert.length + "",
                    fileName: insert.slice(0, 3).join("; "),
                },
            });
            return except;
        });
    },
};
exports.default = index;
