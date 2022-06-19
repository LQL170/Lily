"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNlpResult = void 0;
const tslib_1 = require("tslib");
const packages_1 = require("../../packages");
const form_data_1 = tslib_1.__importDefault(require("form-data"));
const database_1 = require("../../configs/database");
const configs_1 = require("../../configs");
const tables_1 = require("../tables");
const n_1 = require("@m170/utils/n");
const config_1 = require("./config");
const utils_1 = require("./utils");
const table_text = (0, tables_1.getTable)("nlp_text");
const table_entity = (0, tables_1.getTable)("nlp_entity");
function insertTexts(data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!data.length) {
            return;
        }
        yield database_1.pgsql.query(`delete from ?? where res_id in (?)`, [
            table_text,
            (0, n_1.arrUnique)(data.map((x) => x.file_id)),
        ]);
        yield database_1.pgsql.insert({
            table: table_text,
            data: data.map(({ file_id, rid, order_index, content }) => {
                return {
                    res_id: file_id,
                    rid,
                    order_index,
                    content,
                };
            }),
        });
    });
}
function insertEntitys(data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!data.length) {
            return;
        }
        yield database_1.pgsql.query(`delete from ?? where res_id in (?)`, [
            table_entity,
            (0, n_1.arrUnique)(data.map((x) => x.res_id)),
        ]);
        yield database_1.pgsql.insert({
            table: table_entity,
            data: data.map(({ id, res_id, rid, type, value, value_start, value_end }) => {
                return {
                    id,
                    res_id,
                    rid,
                    type,
                    value,
                    range: `${value_start},${value_end}`,
                };
            }),
        });
    });
}
function insertImgs(res_id, list) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const table = (0, tables_1.getTable)("nlp_upload_split");
        yield database_1.pgsql.query(`delete from ?? where res_id in (?)`, [table, [res_id]]);
        const data = [];
        list.forEach((x, index) => {
            x.forEach(({ img_id, rids }) => {
                data.push({
                    res_id,
                    img_id,
                    rids: rids.join(),
                    order: "" + index,
                });
            });
        });
        yield database_1.pgsql.insert({
            table,
            data,
        });
    });
}
function _getNlpResult({ id, url }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = new form_data_1.default();
        const form = {
            id,
            file_name: packages_1.path.parse(url).base,
            file_path: url,
            db_name: "",
            buffer: packages_1.fse.createReadStream(url),
        };
        (0, packages_1.getKeys)(form).forEach((x) => {
            data.append(x, form[x]);
        });
        const body = yield (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { data: body } = yield (0, packages_1.axios)({
                    url: config_1.nlpApi.entity,
                    method: "post",
                    data,
                    headers: data.getHeaders(),
                    maxBodyLength: Infinity,
                });
                configs_1.logger.info("nlp-api entitys done");
                return body;
            }
            catch (error) {
                configs_1.logger.error(error.message);
                const body = {
                    code: 500,
                    message: error.message,
                };
                return body;
            }
        }))();
        if (body.code === 200) {
            const { entities, sentences } = body;
            yield Promise.all([
                insertEntitys(entities),
                insertTexts(sentences),
                insertImgs(id, body.images),
            ]);
            yield (0, utils_1.newTaskUpdate)(id, { entity: true });
            configs_1.logger.info("getNlpResult success：", body.message, url);
            return true;
        }
        else {
            yield (0, utils_1.newTaskUpdate)(id, { entity: false });
            configs_1.logger.error("getNlpResult error：", body.message, url);
            return false;
        }
    });
}
const queue = (0, configs_1.initQueueTask)(_getNlpResult, {
    worker: 5,
});
exports.getNlpResult = (0, configs_1.reTryFunc)(queue, {
    count: 3,
    duration: 1000,
    label: "getNlpResult",
    isError(data) {
        return !data;
    },
});
