"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertData = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../../../../configs/database");
const data_1 = require("../data");
const n_1 = require("@m170/utils/n");
const utils_1 = require("../utils");
function getMesh() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsqlMaster.query(`SELECT "treeID" as id, "treeNum" as path, value, translated, "mainItem" as mainitem FROM "mesh_node_filter" WHERE "treeNum" like 'C04%'`);
        const main = [];
        const ids = {};
        const tree = {};
        const md5M = {};
        data.forEach(({ value, translated, mainitem, id, path }) => {
            tree[path] = id;
            value = (0, utils_1.handleStr)(value);
            translated = (0, utils_1.handleStr)(translated);
            let temp = [
                {
                    value: translated,
                    mainitem: false,
                },
                {
                    value: value,
                    mainitem: false,
                },
            ];
            temp = temp.filter((x) => x.value);
            if (mainitem && temp.length) {
                temp[0].mainitem = true;
            }
            if (!ids[id]) {
                ids[id] = [];
            }
            ids[id].push(...temp);
        });
        Object.keys(ids).forEach((id) => {
            var _a, _b;
            const list = (0, n_1.arrUniqueBy)(ids[id], "value");
            const item = ((_a = list.find((x) => x.mainitem)) === null || _a === void 0 ? void 0 : _a.value) || ((_b = list[0]) === null || _b === void 0 ? void 0 : _b.value);
            list.forEach(({ value }) => {
                if (!md5M[id]) {
                    md5M[id] = (0, n_1.md5)(id);
                }
                main.push({
                    id: md5M[id],
                    value,
                    mainitem: value === item ? "1" : "0",
                    rid: (0, utils_1.getRid)(id, value),
                });
            });
        });
        const graphs = {};
        const keys = Object.keys(tree);
        const keysArr = keys
            .map((x) => x.split("."))
            .sort((a, b) => b.length - a.length);
        keysArr.forEach((x) => {
            for (let i = x.length; i > 1; i--) {
                const parent = x.slice(0, i - 1).join(".");
                const child = x.slice(0, i).join(".");
                if (tree[parent] && tree[child]) {
                    const id = tree[parent] + "###" + tree[child];
                    if (!graphs[id]) {
                        const graph = "parent-child";
                        const source = md5M[tree[parent]];
                        const target = md5M[tree[child]];
                        graphs[id] = {
                            source,
                            target,
                            graph,
                            rid: (0, utils_1.getRid)(source, target, graph),
                        };
                    }
                }
            }
        });
        return {
            nodes: main,
            graphs: Object.values(graphs),
        };
    });
}
function getDrug() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return {
            nodes: [],
            graphs: [],
        };
    });
}
function getCompany() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsqlMaster.query(`SELECT std_value, type, value FROM "drug_mesh_company"`);
        const list = [];
        const obj = {};
        data.forEach(({ std_value, type, value }) => {
            value = (0, utils_1.handleStr)(value);
            std_value = (0, utils_1.handleStr)(std_value);
            if (!obj[std_value]) {
                obj[std_value] = [std_value];
            }
            obj[std_value].push(value);
        });
        Object.keys(obj).forEach((std) => {
            const temp = (0, n_1.arrUnique)(obj[std]);
            temp.forEach((x) => {
                list.push({
                    rid: (0, n_1.md5)(std + x),
                    id: (0, n_1.md5)(std),
                    value: x,
                    mainitem: x === std ? "1" : "0",
                });
            });
        });
        return {
            nodes: list,
            graphs: [],
        };
    });
}
const customTables = {
    mesh: getMesh,
    drug: getDrug,
    company: getCompany,
};
function isCustom(table) {
    return table in customTables;
}
const typesMapping = {
    biomarker: ["biomarker"],
    check: ["检查"],
    cureline: ["治疗线"],
    symptom: ["症状"],
    patienttype: ["患者-分型"],
};
function baseGetData(table) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if ((_a = typesMapping[table]) === null || _a === void 0 ? void 0 : _a.length) {
            const list = yield database_1.pgsqlMaster.query(`SELECT value, std_value FROM "nlp_mark_result_check" where type in (?)`, [typesMapping[table]]);
            const obj = {};
            list.forEach(({ value, std_value }) => {
                value = (0, utils_1.handleStr)(value);
                std_value = (0, utils_1.handleStr)(std_value);
                if (!obj[std_value]) {
                    obj[std_value] = {
                        [std_value]: true,
                    };
                }
                obj[std_value][value] = true;
            });
            const main = [];
            Object.keys(obj).forEach((x, index) => {
                const id = (0, n_1.md5)(x);
                Object.keys(obj[x]).forEach((value) => {
                    main.push({
                        id,
                        value,
                        mainitem: x === value ? "1" : "0",
                        rid: (0, utils_1.getRid)(id, value),
                    });
                });
            });
            return {
                nodes: main,
                graphs: [],
            };
        }
        return {
            nodes: [],
            graphs: [],
        };
    });
}
function insertMin(table) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { nodes, graphs } = yield (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (isCustom(table)) {
                return yield customTables[table]();
            }
            return yield baseGetData(table);
        }))();
        yield Promise.all([
            database_1.pgsql.insert({ table: (0, data_1.getFieldValueTable)(table), data: nodes }),
            database_1.pgsql.insert({ table: (0, data_1.getFieldValueTable)(table, true), data: graphs }),
        ]);
    });
}
function insertData() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield Promise.all(data_1.tables.map((x) => insertMin(x)));
    });
}
exports.insertData = insertData;
