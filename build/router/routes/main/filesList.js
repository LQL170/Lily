"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../../configs/database");
const tables_1 = require("../../../plugins/tables");
const url_1 = require("../../../plugins/convert/methods/url");
const utils_1 = require("../../../plugins/convert/methods/utils");
const filesListIds_1 = require("./filesListIds");
function handle(list, key) {
    const base = {};
    list.forEach((x) => {
        const id = x[key];
        if (!base[id]) {
            base[id] = [];
        }
        base[id].push(x);
    });
    return base;
}
function getTexts(res_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsql.query(`select rid, res_id, order_index, content as text from ?? where ?? in (?)`, [(0, tables_1.getTable)("nlp_text"), "res_id", res_id]);
        const main = {};
        data.forEach((x) => {
            if (!main[x.res_id]) {
                main[x.res_id] = {};
            }
            const [page, order] = x.order_index.split("_");
            if (!main[x.res_id][page]) {
                main[x.res_id][page] = [];
            }
            main[x.res_id][page].push({
                rid: x.rid,
                order: +order,
                text: x.text,
            });
        });
        return main;
    });
}
function getEntitys(res_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsql.query(`SELECT id, rid, type, value, range FROM ?? WHERE res_id in (?)`, [(0, tables_1.getTable)("nlp_entity"), res_id]);
        const base = handle(data.map((_a) => {
            var { range } = _a, items = tslib_1.__rest(_a, ["range"]);
            return Object.assign(items, {
                range: range.split(",").map((x) => +x),
            });
        }), "rid");
        const obj = {};
        (0, n_1.getKeys)(base).forEach((x) => {
            obj[x] = base[x].map((_a) => {
                var { rid } = _a, items = tslib_1.__rest(_a, ["rid"]);
                return items;
            });
        });
        return obj;
    });
}
function getIdPagesCount(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const base = (id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const dir = n_1.path.join(utils_1.dirOptions["source-pdf-split"], id);
            if (yield n_1.fse.pathExists(dir)) {
                const list = yield n_1.fse.readdir(n_1.path.join(utils_1.dirOptions["source-pdf-split"], id));
                return list.length;
            }
            return 0;
        });
        const list = yield Promise.all(id.map((x) => base(x)));
        const obj = {};
        id.forEach((x, index) => {
            obj[x] = list[index];
        });
        return obj;
    });
}
function getTags(res_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let [tag1, tag2, types] = yield Promise.all([
            database_1.pgsql.query(`select ?? from ?? where res_id in (?)`, [
                ["res_id", "type", "value", "id"],
                (0, tables_1.getTable)("nlp_upload_tags"),
                res_id,
            ]),
            database_1.pgsql.query(`select ?? from ?? where res_id in (?)`, [
                ["res_id", "type", "value", "id"],
                (0, tables_1.getTable)("nlp_upload_tags_field"),
                res_id,
            ]),
            database_1.pgsql.query(`select distinct type from ?? `, [
                (0, tables_1.getTable)("tag_type_control"),
            ]),
        ]);
        if (types.length) {
            const need = (0, n_1.arrObject)(types, "type", true);
            tag1 = tag1.filter((x) => need[x.type]);
            tag2 = tag2.filter((x) => need[x.type]);
        }
        const tagsObj = (() => {
            const obj = {};
            tag1.forEach((_a) => {
                var { res_id } = _a, items = tslib_1.__rest(_a, ["res_id"]);
                if (!obj[res_id]) {
                    obj[res_id] = [];
                }
                obj[res_id].push(Object.assign(Object.assign({}, items), { role: "common" }));
            });
            tag2.forEach((_a) => {
                var { res_id } = _a, items = tslib_1.__rest(_a, ["res_id"]);
                if (!obj[res_id]) {
                    obj[res_id] = [];
                }
                obj[res_id].push(Object.assign(Object.assign({}, items), { role: "field" }));
            });
            return obj;
        })();
        return tagsObj;
    });
}
function getfieldsM(res_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fieldsM = yield database_1.pgsql.query(`select ?? from ?? where res_id in (?)`, [
            ["res_id", "field"],
            (0, tables_1.getTable)("nlp_upload_field"),
            res_id,
        ]);
        const fieldsObj = (() => {
            const obj = {};
            fieldsM.forEach(({ res_id, field }) => {
                if (!obj[res_id]) {
                    obj[res_id] = [];
                }
                obj[res_id].push(field);
            });
            return obj;
        })();
        return fieldsObj;
    });
}
function getCollect(res_id, username) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsql.query(`select res_id from ?? where res_id in (?) and username = ?`, [(0, tables_1.getTable)("nlp_upload_collect"), res_id, username]);
        return data.map((x) => x.res_id);
    });
}
function getVersion(res_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsql.query(`select distinct ?? from ?? where ?? in (?)`, [
            "parent",
            (0, tables_1.getTable)("nlp_upload_old"),
            "parent",
            res_id,
        ]);
        return data.map((x) => x.parent);
    });
}
function get({ id, withDetail, noPage, cardForm }, username) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const orders = (0, filesListIds_1.getOrders)(cardForm);
        const [base, tagsObj, fieldsObj, collect, versions] = yield Promise.all([
            database_1.pgsql.query(`select ??, timestamp as date from ?? where id in (?) ${orders}`, [
                [
                    "id",
                    "name",
                    "ext",
                    "status_filetag",
                    "status_entity",
                    "status_handle",
                    "file_status",
                    "user_upload",
                    "timestamp",
                    "expire_timestamp",
                    "user_approval",
                    "approval_timestamp",
                ],
                (0, tables_1.getTable)("nlp_upload"),
                id,
            ]),
            getTags(id),
            getfieldsM(id),
            getCollect(id, username),
            getVersion(id),
        ]);
        const res_id = base.map((x) => x.id);
        let texts = {};
        let entitys = {};
        const getDetail = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withDetail) {
                const items = yield Promise.all([getTexts(res_id), getEntitys(res_id)]);
                texts = items[0];
                entitys = items[1];
            }
        });
        const [pageCounts] = yield Promise.all([
            getIdPagesCount(res_id),
            getDetail(),
        ]);
        function getStatus(val) {
            if (val === 0) {
                return "failed";
            }
            else if (val === 1) {
                return "completed";
            }
            return "pending";
        }
        const minStat = (_a) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var { status_entity, status_filetag, status_handle } = _a, items = tslib_1.__rest(_a, ["status_entity", "status_filetag", "status_handle"]);
            const pages = (() => {
                if (noPage) {
                    return [];
                }
                else {
                    const text = texts[items.id] || {};
                    const count = pageCounts[items.id];
                    const pages = Array(count)
                        .fill(0)
                        .map((_x, index) => index);
                    return pages.map((x) => {
                        return {
                            page: +x,
                            max: (0, url_1.getStaticUrl)(n_1.path.join(utils_1.dirOptions["source-pdf-split-img"], items.id, `${x}.png`)),
                            min: (0, url_1.getStaticUrl)(n_1.path.join(utils_1.dirOptions["source-pdf-split-img-min"], items.id, `${x}.jpg`)),
                            detail: (text[x] || [])
                                .sort((a, b) => (a.order > b.order ? 1 : -1))
                                .map(({ rid, text }) => {
                                return {
                                    rid,
                                    text,
                                    entitys: entitys[rid] || [],
                                };
                            }),
                        };
                    });
                }
            })();
            const url = n_1.path.join(utils_1.dirOptions.source, items.id, `${items.name}${items.ext}`);
            const size = yield (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    const { size } = yield n_1.fse.stat(url);
                    return size;
                }
                catch (error) {
                    return 0;
                }
            }))();
            return Object.assign(items, {
                pages,
                url: (0, url_1.getStaticUrl)(url),
                size: (0, n_1.byteConversion)(size),
                tags: tagsObj[items.id] || [],
                fields: fieldsObj[items.id] || [],
                isCollect: collect.includes(items.id),
                versions: versions.includes(items.id),
                status_entity: getStatus(status_entity),
                status_handle: getStatus(status_handle),
                status_filetag: getStatus(status_filetag),
            });
        });
        const main = yield Promise.all(base.map((x) => minStat(x)));
        return main;
    });
}
const index = {
    method: "POST",
    url: "/main/filesList",
    handler({ body, headers: { __token: { username }, }, }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!body.id.length) {
                return [];
            }
            return yield get(body, username);
        });
    },
};
exports.default = index;
