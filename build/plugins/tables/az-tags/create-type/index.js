"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTypeTables = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../../../../configs/database");
const n_1 = require("@m170/utils/n");
const data_1 = require("../data");
const create_1 = require("../create");
const static_1 = require("./static");
const { rid } = create_1.baseCols, baseColsMin = tslib_1.__rest(create_1.baseCols, ["rid"]);
const graphCols = {
    source: {
        type: "varchar(32)",
        comment: "source 节点",
        noNull: true,
    },
    target: {
        type: "varchar(32)",
        comment: "target 节点",
        noNull: true,
    },
    graph: {
        type: "varchar(255)",
        noNull: true,
        comment: "节点间的关系，默认仅一种，parent-child 父子（source-target）关系",
    },
};
function getCommon() {
    return static_1.commonTypes.map(({ name, values }) => {
        return {
            id: (0, n_1.md5)(name),
            name,
            data: (0, static_1.getIdByTree)(values),
        };
    });
}
const tableConf = {
    common_type: {
        prefix: "dict_",
        comment: "通用标签类型",
        data: () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            return getCommon().map(({ id, name }) => ({ id, name }));
        }),
        cols: Object.assign({ id: {
                type: "varchar(32)",
                primary: true,
                index: "UNIQUE",
                comment: "通用标签类型唯一 ID",
            }, name: {
                type: "varchar(255)",
            } }, baseColsMin),
    },
    common_value: {
        prefix: "dict_",
        comment: "通用标签类型值",
        data: () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const list = [];
            const data = getCommon();
            data.forEach((x) => {
                list.push(...x.data.nodes.map((e) => Object.assign({
                    type_id: x.id,
                }, e)));
            });
            return list;
        }),
        cols: Object.assign({ type_id: {
                type: "varchar(32)",
                index: true,
                comment: "通用标签类型唯一 ID",
            }, id: {
                type: "varchar(32)",
                index: "UNIQUE",
                primary: true,
                comment: "通用标签值唯一 ID",
            }, value: {
                type: "varchar(255)",
                comment: "节点",
                noNull: true,
            } }, baseColsMin),
    },
    common_value_graph: {
        prefix: "dict_",
        comment: "通用标签类型值关系映射",
        data: () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const list = [];
            const data = getCommon();
            data.forEach((x) => {
                list.push(...x.data.graphs);
            });
            return list;
        }),
        cols: Object.assign(Object.assign({}, graphCols), create_1.baseCols),
    },
    field_type: {
        prefix: "dict_",
        comment: "领域标签类型",
        data: () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const data = {
                biomarker: { name: "biomarker" },
                mesh: { name: "疾病" },
                drug: { name: "药品" },
                company: { name: "公司" },
                check: { name: "检查" },
                cureline: { name: "治疗线" },
                patienttype: { name: "患者分型" },
                symptom: { name: "症状" },
            };
            return (0, n_1.getKeys)(data).map((mark) => ({
                id: (0, n_1.md5)(mark),
                name: data[mark].name,
                mark,
            }));
        }),
        cols: Object.assign({ id: {
                type: "varchar(32)",
                primary: true,
                index: "UNIQUE",
                comment: "通用标签类型唯一 ID",
            }, name: {
                type: "varchar(255)",
            }, mark: {
                type: "varchar(32)",
            } }, baseColsMin),
    },
    field_type_mapping: {
        prefix: "dict_",
        comment: "所有标签类型和领域的对应关系",
        data: () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const fieldTags = (yield tableConf["field_type"].data()).map((x) => x.id);
            const commonTags = (yield tableConf["common_type"].data()).map((x) => x.id);
            const list = [];
            const isBool = () => Math.random() > 0.3;
            data_1.fields.forEach((field) => {
                fieldTags.forEach((id) => {
                    if (isBool()) {
                        list.push({
                            field,
                            id,
                            type: "field",
                            rid: (0, n_1.md5)(field + id),
                        });
                    }
                });
                commonTags.forEach((id) => {
                    if (isBool()) {
                        list.push({
                            field,
                            id,
                            type: "common",
                            rid: (0, n_1.md5)(field + id),
                        });
                    }
                });
            });
            return list;
        }),
        cols: Object.assign({ field: {
                type: "varchar(255)",
                index: true,
            }, id: {
                type: "varchar(32)",
                comment: "通用标签类型 / 领域标签 唯一 ID",
            }, type: {
                type: "varchar(255)",
            } }, create_1.baseCols),
    },
};
function tableMin(name) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { prefix, cols, data: get, comment } = tableConf[name];
        const table = `${prefix}${name}`;
        yield database_1.pgsql.createTable({
            table,
            cols,
            comment,
            drop: true,
            trigger: {
                status: ["INSERT", "UPDATE"],
                func: data_1.rootConfig.trigger,
            },
        });
        yield database_1.pgsql.insert({ table, data: yield get() });
    });
}
function createTypeTables() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield Promise.all((0, n_1.getKeys)(tableConf).map((x) => tableMin(x)));
    });
}
exports.createTypeTables = createTypeTables;
