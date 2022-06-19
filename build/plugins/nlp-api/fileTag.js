"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileTag = void 0;
const tslib_1 = require("tslib");
const packages_1 = require("../../packages");
const database_1 = require("../../configs/database");
const tables_1 = require("../tables");
const n_1 = require("@m170/utils/n");
const index_1 = require("../../configs/index");
const cache_1 = require("../../cache");
const config_1 = require("./config");
const utils_1 = require("./utils");
const table_text = (0, tables_1.getTable)("nlp_text");
const table_entity = (0, tables_1.getTable)("nlp_entity");
function concatText(texts, entitys) {
    const _texts = texts
        .map((x) => {
        return {
            self: x,
            order: x.order_index.split("_").map((e) => +e),
        };
    })
        .sort(({ order: a }, { order: b }) => {
        if (a[0] === b[0]) {
            return a[1] - b[1];
        }
        return a[0] - b[0];
    })
        .map((x) => x.self);
    const obj = {};
    entitys.forEach((x) => {
        if (!obj[x.rid]) {
            obj[x.rid] = [];
        }
        obj[x.rid].push(x);
    });
    let last = 0;
    let text = "";
    const ner = [];
    _texts.forEach(({ rid, content }) => {
        const entitys = (obj[rid] || [])
            .map(({ range, type, value }) => {
            const [min, max] = range.split(",");
            return {
                value_start: +min,
                value_end: +max,
                type,
                value,
                std_value: cache_1.valueStd.std(value),
            };
        })
            .sort((a, b) => a.value_start - b.value_start);
        entitys.forEach((_a) => {
            var { value_end, value_start } = _a, items = tslib_1.__rest(_a, ["value_end", "value_start"]);
            ner.push(Object.assign(Object.assign({}, items), { value_end: last + value_end + "", value_start: last + value_start + "" }));
        });
        text += content;
        last += content.length;
    });
    return {
        text,
        ner,
    };
}
function insertEntitys(res_id, data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!data.length) {
            return;
        }
        const table = (0, tables_1.getTable)("nlp_upload_tags");
        const table_field = (0, tables_1.getTable)("nlp_upload_tags_field");
        const min = (table, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = res.map(({ type, value }) => {
                return {
                    res_id,
                    type,
                    value,
                    username: "-",
                    id: (0, n_1.md5)(res_id + "###" + type + "###" + value),
                };
            });
            const _data = (0, n_1.arrUniqueBy)(list, "id");
            if (_data.length) {
                yield database_1.pgsql.query(`delete from ?? where res_id in (?) and username = ?`, [
                    table,
                    [res_id],
                    "-",
                ]);
                yield database_1.pgsql.insert({
                    table,
                    data: _data,
                });
            }
        });
        yield Promise.all([
            min(table, data.filter((x) => x.tag === "common")),
            min(table_field, data.filter((x) => x.tag === "field")),
        ]);
    });
}
function _getFileTag(id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const [info, texts, entitys] = yield Promise.all([
            database_1.pgsql.query(`select name, ext from ?? where id = ? limit 1`, [
                (0, tables_1.getTable)("nlp_upload"),
                id,
            ]),
            database_1.pgsql.query(`select rid, order_index, content from ?? where res_id = ?`, [
                table_text,
                id,
            ]),
            database_1.pgsql.query(`select rid, range, type, value from ?? where res_id = ?`, [
                table_entity,
                id,
            ]),
            cache_1.valueStd.update(),
        ]);
        if (info.length) {
            const res_id = id;
            const { name: title, ext } = info[0];
            const file_type = ext.slice(1);
            const form = Object.assign({ res_id,
                file_type,
                title,
                prefix: tables_1.prefix }, concatText(texts, entitys));
            const body = yield (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    console.log(config_1.nlpApi.fileTag, form.title);
                    const { data: body } = yield (0, packages_1.axios)({
                        url: config_1.nlpApi.fileTag,
                        method: "post",
                        data: form,
                        maxBodyLength: Infinity,
                    });
                    return body;
                }
                catch (error) {
                    index_1.logger.error(error.message);
                    return;
                }
            }))();
            if (body) {
                const list = [];
                Object.keys(body["concept"]).forEach((type) => {
                    body["concept"][type].forEach(({ label_value, label_std_value, tag }) => {
                        var _a;
                        list.push({
                            type,
                            value: (_a = cache_1.valueStd.std(label_value)) !== null && _a !== void 0 ? _a : cache_1.valueStd.std(label_std_value),
                            tag,
                        });
                    });
                });
                yield insertEntitys(id, list);
                yield (0, utils_1.newTaskUpdate)(id, { filetag: true });
            }
            else {
                yield (0, utils_1.newTaskUpdate)(id, { filetag: false });
            }
        }
        index_1.logger.info(id, "getFileTag done");
    });
}
exports.getFileTag = (0, index_1.reTryFunc)(_getFileTag, {
    count: 3,
    duration: 1000,
    label: "getFileTag",
});
