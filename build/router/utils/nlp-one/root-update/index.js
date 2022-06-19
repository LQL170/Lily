"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoot = void 0;
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const database_1 = require("../../../../configs/database");
const type_1 = require("../type");
const getData_1 = require("./getData");
function getUpdateAdd() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fields = ["type", "value", "timestamp", "id"];
        const list = yield database_1.pgsql.query(`select ?? from ??`, [fields, type_1.oneTable.add]);
        list.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
        return list.map((_a) => {
            var { timestamp } = _a, items = tslib_1.__rest(_a, ["timestamp"]);
            return items;
        });
    });
}
function getUpdateRemark() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fields = [
            "id",
            "type",
            "value",
            "range",
            "remark_type",
            "remark_value",
            "remark_range",
            "timestamp",
        ];
        const [list] = yield Promise.all([
            database_1.pgsql.query(`select ?? from ??`, [fields, type_1.oneTable.remark]),
        ]);
        return list;
    });
}
function insert(table, data) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const item = data[0];
        if (item) {
            yield database_1.pgsql.query(`delete from ?? where id in (?)`, [
                table,
                data.map((x) => x.id),
            ]);
            yield database_1.pgsql.insert({
                table,
                data,
            });
        }
    });
}
function remarkM(res_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield getUpdateRemark();
        if (!data.length) {
            return [];
        }
        const existData = yield (0, getData_1.getExistData)(res_id);
        data.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
        const { remark, obj } = (() => {
            const obj = {};
            const repeatTypeValue = {};
            data.forEach(({ type, value, remark_type, remark_value, id }) => {
                if (type !== remark_type || value !== remark_value) {
                    const key = remark_type + "###" + remark_value;
                    if (!repeatTypeValue[key]) {
                        repeatTypeValue[key] = {
                            id,
                            type: remark_type,
                            value: remark_value,
                        };
                    }
                    if (!obj[value]) {
                        obj[value] = [];
                    }
                    obj[value].push({
                        type: remark_type,
                        value: remark_value,
                    });
                }
            });
            Object.keys(obj).forEach((x) => {
                obj[x] = (0, n_1.arrUniqueBy)(obj[x]);
            });
            return {
                remark: Object.values(repeatTypeValue),
                obj,
            };
        })();
        const { texts, entitys } = existData;
        const textsObj = (0, n_1.arrObject)(texts, "rid", "content");
        const updateList = [];
        Object.keys(obj).forEach((value) => {
            const lVal = value.toLowerCase();
            const target = obj[value];
            const current = entitys.filter((x) => x.value.toLowerCase() === lVal);
            const { others, list } = (() => {
                const needRid = (0, n_1.arrObject)(current, "rid", true);
                const currentId = (0, n_1.arrObject)(current, "id", true);
                return {
                    others: entitys.filter((x) => needRid[x.rid] && !currentId[x.id]),
                    list: current.map(({ rid, id }) => ({
                        rid,
                        text: textsObj[rid],
                        id,
                    })),
                };
            })();
            const notRepeat = (0, getData_1.getIsRepeat)(others);
            const matched = (0, n_1.keyMatch)(target.map((x) => ({ meta: x.type, list: [x.value] })), list, ["text"]);
            matched.forEach((x, index) => {
                const { rid, text, id } = list[index];
                const _current = current.filter((x) => x.rid === rid);
                const needRepeat = (0, getData_1.getIsRepeat)(_current);
                x.forEach(({ meta, range }) => {
                    if (needRepeat(range, rid) && !notRepeat(range, rid)) {
                        const value = text.slice(...range);
                        const source = entitys.find((x) => x.id === id);
                        if (source) {
                            updateList.push({
                                source_id: source.id,
                                target: {
                                    type: meta,
                                    value,
                                    range: range.join(),
                                },
                            });
                        }
                    }
                });
            });
        });
        if (updateList.length) {
            const step = 1e2;
            const max = Math.ceil(updateList.length / step);
            const keys = (0, n_1.getKeys)(updateList[0].target);
            const updateStr = [];
            keys.forEach(() => {
                updateStr.push(`?? = ?`);
            });
            const updateQuery = updateStr.join();
            for (let i = 0; i < max; i++) {
                const list = updateList.slice(i * step, (i + 1) * step);
                yield Promise.all(list.map(({ source_id, target }) => {
                    const updateArr = [];
                    keys.forEach((key) => {
                        updateArr.push(key, target[key]);
                    });
                    return database_1.pgsql.query(`update ?? set ${updateQuery} where id = ?`, [
                        type_1.oneTable.nlp,
                        ...updateArr,
                        source_id,
                    ]);
                }));
            }
        }
        console.log("remark", updateList.length);
        return remark;
    });
}
function addM(remark, res_id) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const add = yield getUpdateAdd();
        if (!add.length) {
            return [];
        }
        const existData = yield (0, getData_1.getExistData)(res_id);
        const data = add.concat(remark);
        const keys = (() => {
            const temp = {};
            data.forEach(({ type, value }) => {
                if (!temp[type]) {
                    temp[type] = [];
                }
                temp[type].push(value);
            });
            return Object.keys(temp).map((x) => {
                return {
                    meta: x,
                    list: temp[x],
                };
            });
        })();
        const texts = existData.texts.map((x) => ({ text: x.content }));
        const matched = (0, n_1.keyMatch)(keys, texts, ["text"]);
        let addList = [];
        matched.forEach((x, index) => {
            if (x.length) {
                const item = existData.texts[index];
                x.forEach(({ range: [min, max], meta: type }) => {
                    if (!existData.isRepeat([min, max], item.rid)) {
                        const value = item.content.slice(min, max);
                        addList.push({
                            type,
                            value,
                            range: `${min},${max}`,
                            res_id: item.res_id,
                            rid: item.rid,
                            id: (0, type_1.getAddId)({ rid: item.rid, type, value, value_start: min }),
                        });
                    }
                });
            }
        });
        yield insert(type_1.oneTable.nlp, addList);
        console.log("add", addList.length);
        return add.map((x) => x.id);
    });
}
function updateRoot(id = "") {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const remark = yield remarkM(id);
        const add = yield addM(remark, id);
    });
}
exports.updateRoot = updateRoot;
