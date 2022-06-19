"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const n_1 = require("@m170/utils/n");
const path_1 = require("path");
const database_1 = require("../../../configs/database");
const methods_1 = require("./methods");
const xlsx = new n_1.XLSX();
const xlsxPath = (0, path_1.join)(__dirname, "xlsx");
function getMesh(mark) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsqlMaster.query(`select "treeID" as id, "mainItem" as mainitem, value, translated from mesh_node_filter where is_delete != '1'`);
        const exceptVal = ["胃印戎细胞癌"];
        mark = mark.filter((e) => !exceptVal.includes(e.value));
        const main = (0, methods_1.getMain)({
            data: data.sort((a, b) => +b.mainitem - +a.mainitem),
            fields: ["translated", "value"],
            id: "id",
            valueCallback(item) {
                return Boolean(+item.mainitem);
            },
            mark,
        });
        return main;
    });
}
function getDrug(mark) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let [data, atc] = yield Promise.all([
            database_1.pgsqlMaster.query(`SELECT copy, id, value, "value type" as type, company, mainitem FROM "drug_mesh_standard"`),
            (0, methods_1.getAtc)(),
        ]);
        data = data.filter((x) => ["brand", "molecule"].includes(x.type));
        const { handleData, idCompany } = (() => {
            const main = [];
            const idCompany = {};
            data.sort((a, b) => {
                const c = +b.mainitem - +a.mainitem;
                if (c === 0) {
                    return a.type > b.type ? 1 : -1;
                }
                return c;
            });
            const repeat = {};
            data.forEach(({ id, value, type, company, mainitem }) => {
                value = (0, methods_1.handleStr)(value);
                if (!repeat[value.toLowerCase()]) {
                    if (type === "brand") {
                        main.push({
                            id,
                            value,
                            mainitem,
                        });
                        if (!idCompany[id]) {
                            idCompany[id] = {
                                type: "brand",
                                company: [],
                            };
                        }
                        idCompany[id].company.push(company);
                        repeat[value.toLowerCase()] = true;
                    }
                    else if (type === "molecule") {
                        const _id = id.split("_")[0];
                        main.push({
                            id: _id,
                            value,
                            mainitem,
                        });
                        if (!idCompany[_id]) {
                            idCompany[_id] = {
                                type: "molecule",
                                company: [],
                            };
                        }
                        idCompany[_id].company.push(company);
                        repeat[value.toLowerCase()] = true;
                    }
                }
            });
            Object.keys(idCompany).forEach((x) => {
                idCompany[x].company = (0, n_1.arrUnique)(idCompany[x].company);
            });
            return {
                handleData: main,
                idCompany,
            };
        })();
        const except = (0, n_1.arrObject)(handleData.map((x) => x.value.toLowerCase()));
        const drug = (0, methods_1.getMain)({
            data: handleData.concat(atc.filter((x) => !except[x.value.toLowerCase()])),
            fields: ["value"],
            id: "id",
            valueCallback(item) {
                return Boolean(+item.mainitem);
            },
            mark,
            _type: "药品",
        });
        return {
            drug,
            idCompany,
        };
    });
}
function getCompany(mark) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsqlMaster.query(`select std_value, type, value from drug_mesh_company`);
        const main = (0, methods_1.getMain)({
            data,
            fields: ["value", "std_value"],
            id: "std_value",
            valueCallback(item) {
                return item.type === "keyword";
            },
            mark,
        });
        return main;
    });
}
function getOther() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const data = yield database_1.pgsqlMaster.query(`SELECT type, value, std_value FROM "nlp_mark_result_check"`);
        data.forEach((x) => {
            x.type = (0, methods_1.handleStr)(x.type);
            x.value = (0, methods_1.handleStr)(x.value);
            x.std_value = (0, methods_1.handleStr)(x.std_value);
        });
        return data.filter((x) => x.type && x.value);
    });
}
function getNodesLinksFromXlsx() {
    const data = {
        关系表: xlsx.readFile((0, path_1.join)(xlsxPath, "关系冷启动.xlsx"))["关系表"],
        实体表: xlsx.readFile((0, path_1.join)(xlsxPath, "AZ图书馆字典表和关系表冷启动20220616.xlsx"))["实体表"],
    };
    const nodes = data["实体表"]
        .map(({ type_category, entity_type, value, treeID, mainitem }) => {
        return {
            role: type_category === "通用标签"
                ? "common"
                : "field",
            type: entity_type.trim(),
            value: ((value || "") + "").trim(),
            treeID,
            mainitem,
        };
    })
        .filter((x) => x.value);
    const links = data["关系表"].map(({ tail_entity, tail_type, triple_type, head_type, head_entity }) => {
        return {
            source_type: head_type.trim(),
            source_value: head_entity.trim(),
            graph: triple_type.trim(),
            target_type: tail_type.trim(),
            target_value: tail_entity.trim(),
        };
    });
    return {
        nodes,
        links,
    };
}
function insertData(env, mainRes) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const envs = typeof env === "string" ? [env] : env;
        const min = (prefix) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const min = (table, data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const _table = prefix + table;
                yield database_1.pgsql.clear(_table);
                yield database_1.pgsql.insert({
                    table: _table,
                    data,
                });
            });
            const { types, nodes, tree, graphs } = mainRes;
            yield Promise.all([
                min("tag_type", types),
                min("tag_value", nodes),
                min("tag_value_tree", tree),
                min("tag_value_graph", (0, n_1.arrUniqueBy)(graphs, "id")),
            ]);
        });
        yield Promise.all(envs.map((x) => min(x)));
    });
}
function merge(left, right, keys) {
    keys.forEach((x) => {
        left[x] = left[x].concat(right[x]);
    });
}
function init() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const xlsxData = getNodesLinksFromXlsx();
        function filterNodesLinks(role) {
            if (role) {
                const { nodes, links } = xlsxData;
                const need = (0, n_1.arrObject)(nodes.filter((x) => x.role === role), "type", true);
                return {
                    nodes: nodes.filter((x) => need[x.type]),
                    links: links.filter((x) => need[x.source_type] && need[x.target_type]),
                };
            }
            return xlsxData;
        }
        const mainRes = {
            nodes: [],
            graphs: [],
            tree: [],
            types: [],
        };
        function addTypes() {
            const { nodes } = filterNodesLinks();
            const _ = (0, n_1.arrObject)(nodes, "type", "role");
            Object.keys(_)
                .sort((a, b) => (_[a] > _[b] ? 1 : a > b ? 1 : -1))
                .forEach((e) => {
                const { prefix, num: prefix_number } = (0, methods_1.getPrefix)(e);
                mainRes.types.push({
                    role: _[e],
                    type: e,
                    username: "-",
                    prefix_number,
                    prefix,
                });
            });
            return (type) => {
                var _a;
                const prefix = (_a = mainRes.types.find((x) => x.type === type)) === null || _a === void 0 ? void 0 : _a.prefix;
                if (!prefix) {
                    throw new Error("no prefix");
                }
                return prefix;
            };
        }
        const getExistPrefix = addTypes();
        function addCommonNodeTree() {
            const { nodes } = filterNodesLinks("common");
            const common = nodes.filter((x) => x.role === "common");
            const tag_common = {};
            common.forEach((x) => {
                if (!tag_common[x.type]) {
                    tag_common[x.type] = [];
                }
                const temp = tag_common[x.type].find((e) => e.value === x.value);
                if (!temp) {
                    tag_common[x.type].push({ value: x.value, alias: [x.value] });
                }
            });
            const mainResCommon = {
                nodes: [],
                tree: [],
            };
            const minNodes = (data, type) => {
                data.forEach(({ children, value, alias }) => {
                    const source = (0, methods_1.getId)(type, value);
                    const allVals = (0, n_1.arrUnique)([value, ...alias]);
                    allVals.forEach((x) => {
                        mainResCommon.nodes.push({
                            type,
                            id: source,
                            value: x,
                            username: "-",
                            mainitem: x === value ? "1" : "0",
                            rid: (0, methods_1.getId)(type, x),
                        });
                    });
                    if (children === null || children === void 0 ? void 0 : children.length) {
                        minNodes(children, type);
                    }
                });
            };
            const minTree = (tree, type, prefix = "", depth = 0) => {
                tree.forEach((x, index) => {
                    const tree_id = prefix + index;
                    mainResCommon.tree.push({
                        tree_id,
                        id: (0, methods_1.getId)(type, x.value),
                        username: "-",
                        num: index,
                        type,
                        depth,
                    });
                    if (x.children) {
                        minTree(x.children, type, tree_id + methods_1.split, depth + 1);
                    }
                });
            };
            Object.keys(tag_common).forEach((type) => {
                const tree = tag_common[type];
                minNodes(tree, type);
                minTree(tree, type, getExistPrefix(type));
            });
            return mainResCommon;
        }
        const mainResCommon = addCommonNodeTree();
        function addFieldNodeTreeGraph() {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const mainResField = {
                    nodes: [],
                    tree: [],
                    graphs: [],
                };
                const { nodes, links } = filterNodesLinks("field");
                const { allMapping, getCurrent, allMappingUpdate, idCompany } = yield (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const mark = yield getOther();
                    const mapTypes = ["疾病", "药品", "公司"];
                    const elseTypes = (() => {
                        const base = nodes.filter((x) => !mapTypes.includes(x.type));
                        const needTypes = (0, n_1.arrUnique)(base.map((x) => x.type));
                        const main = base
                            .map((x) => {
                            return {
                                type: x.type,
                                value: x.value,
                                std_value: x.value,
                            };
                        })
                            .concat(mark.filter((e) => !mapTypes.includes(e.type)));
                        return needTypes.map((type) => {
                            const data = (0, methods_1.getMain)({
                                data: main.filter((x) => x.type === type),
                                fields: ["value", "std_value"],
                                id: "std_value",
                                valueCallback(item) {
                                    return item.value === item.std_value;
                                },
                                mark: [],
                            });
                            return {
                                type,
                                data,
                            };
                        });
                    })();
                    const [mesh, { drug, idCompany }, company] = yield Promise.all([
                        getMesh(mark.filter((x) => x.type === "疾病")),
                        getDrug(mark.filter((x) => x.type === "药品")),
                        getCompany(mark.filter((x) => x.type === "公司")),
                    ]);
                    const allMapping = {};
                    const min = (type, data) => {
                        if (!allMapping[type]) {
                            allMapping[type] = {
                                idMap: {},
                                itemMap: {},
                                idMd5: {},
                            };
                        }
                        data.forEach((x) => {
                            allMapping[type]["itemMap"][x.id] = x;
                            allMapping[type]["idMd5"][x.id] = (0, methods_1.getId)(type, x.value);
                            x.alias.forEach((e) => {
                                allMapping[type]["idMap"][e.toLowerCase()] = x.id;
                            });
                        });
                    };
                    min("疾病", mesh);
                    min("药品", drug);
                    min("公司", company);
                    elseTypes.forEach((x) => {
                        min(x.type, x.data);
                    });
                    {
                    }
                    function getCurrent(type, val) {
                        const id = allMapping[type].idMap[val.toLowerCase()];
                        if (id) {
                            return {
                                md5Id: allMapping[type].idMd5[id],
                                current: allMapping[type].itemMap[id],
                                id,
                            };
                        }
                        return null;
                    }
                    return {
                        allMapping,
                        getCurrent,
                        allMappingUpdate: min,
                        idCompany,
                    };
                }))();
                const update = [];
                const noGraphs = [];
                {
                    const obj = {};
                    nodes.forEach((x) => {
                        if (!obj[x.type]) {
                            obj[x.type] = [];
                        }
                        obj[x.type].push(x);
                    });
                    Object.keys(obj).forEach((type) => {
                        const withId = obj[type].filter((x) => x.treeID);
                        const noId = obj[type].filter((x) => !x.treeID);
                        const handle = (type, items) => {
                            var _a, _b;
                            const vals = items.map((x) => x.value);
                            const list = vals.map((x) => getCurrent(type, (0, methods_1.handleStr)(x)));
                            const mapIds = (0, n_1.arrUnique)(list.map((x) => x === null || x === void 0 ? void 0 : x.id), true);
                            if (!mapIds.length) {
                                const value = (items.find((x) => +x.mainitem) || items[0]).value;
                                const temp = {
                                    id: value,
                                    value,
                                    alias: (0, n_1.arrUnique)(items.map((x) => x.value), true),
                                };
                                allMappingUpdate(type, [temp]);
                                update.push(...items);
                            }
                            else if (mapIds.length === 1) {
                                const c = (_a = list.find((x) => x)) === null || _a === void 0 ? void 0 : _a.current;
                                if (!c) {
                                    throw new Error("异常错误");
                                }
                                c.alias.push(...vals);
                                c.alias = (0, n_1.arrUnique)(c.alias);
                                allMappingUpdate(type, [c]);
                            }
                            else {
                                if (type === "药品") {
                                    if (mapIds.length > 2) {
                                        throw new Error("药品匹配上了 3 个以上");
                                    }
                                    const [parent, child] = mapIds.sort((a, b) => a.length - b.length);
                                    const parentNode = list.find((x) => (x === null || x === void 0 ? void 0 : x.id) === parent);
                                    const childNode = list.find((x) => (x === null || x === void 0 ? void 0 : x.id) === child);
                                    list.forEach((x, index) => {
                                        const val = vals[index];
                                        if (x) {
                                            if (x.id === parent) {
                                                parentNode.current.alias.push(val);
                                            }
                                            else {
                                                childNode.current.alias.push(val);
                                            }
                                        }
                                        else {
                                            parentNode.current.alias.push(val);
                                        }
                                    });
                                    parentNode.current.alias = (0, n_1.arrUnique)(parentNode.current.alias, true);
                                    childNode.current.alias = (0, n_1.arrUnique)(childNode.current.alias, true);
                                    allMappingUpdate(type, [parentNode.current, childNode.current]);
                                }
                                else {
                                    const _list = list.filter((x) => x);
                                    const id = mapIds.join();
                                    const value = ((_b = items.find((x) => +x.mainitem)) === null || _b === void 0 ? void 0 : _b.value) || _list[0].current.value;
                                    const alias = (0, n_1.arrUnique)((0, n_1.arrConcat)(..._list.map((x) => x.current.alias), vals), true);
                                    allMappingUpdate(type, [
                                        {
                                            id,
                                            value,
                                            alias,
                                        },
                                    ]);
                                }
                            }
                        };
                        if (withId.length) {
                            const withIdObj = {};
                            withId.forEach((x) => {
                                if (!withIdObj[x.treeID]) {
                                    withIdObj[x.treeID] = [];
                                }
                                withIdObj[x.treeID].push(x);
                            });
                            Object.values(withIdObj).forEach((items) => {
                                handle(type, items);
                            });
                        }
                        if (noId.length) {
                            noId.forEach((x) => {
                                handle(type, [x]);
                            });
                        }
                    });
                    nodes.forEach((x) => {
                        if (!getCurrent(x.type, x.value)) {
                            console.log(x);
                            throw new Error("MAP ERROR");
                        }
                    });
                }
                const nodeMap = (() => {
                    const obj = {};
                    nodes.forEach((x) => {
                        var _a;
                        if (!obj[x.type]) {
                            obj[x.type] = [];
                        }
                        const val = (_a = getCurrent(x.type, x.value)) === null || _a === void 0 ? void 0 : _a.id;
                        if (val) {
                            obj[x.type].push(val);
                        }
                        else {
                            throw new Error("MAP ERROR");
                        }
                    });
                    Object.keys(obj).forEach((x) => {
                        obj[x] = (0, n_1.arrUnique)(obj[x]);
                    });
                    return obj;
                })();
                Object.keys(nodeMap).forEach((type) => {
                    nodeMap[type].forEach((x) => {
                        const base = allMapping[type]["itemMap"][x];
                        const id = allMapping[type]["idMd5"][x];
                        if (!base || !id) {
                            throw new Error("123");
                        }
                        const item = base;
                        const { value, alias } = item;
                        alias.forEach((x) => {
                            mainResField.nodes.push({
                                type,
                                value: x,
                                id,
                                mainitem: x === value ? "1" : "0",
                                username: "-",
                                rid: (0, methods_1.getId)(type, x),
                            });
                        });
                    });
                });
                const treeType = {};
                const allTypes = (0, n_1.arrUnique)(nodes.map((x) => x.type), true);
                allTypes.forEach((e) => {
                    if (!treeType[e]) {
                        treeType[e] = [];
                    }
                });
                {
                    const idCompanyArr = Object.keys(idCompany).map((x) => {
                        return {
                            item: allMapping["药品"].itemMap[x],
                            md5Id: allMapping["药品"].idMd5[x],
                            key: x,
                            data: idCompany[x],
                        };
                    });
                    const map = (0, n_1.arrObject)(idCompanyArr, "key", "md5Id");
                    const obj = {};
                    idCompanyArr.forEach((x) => {
                        const [parent, child] = x.key.split("_");
                        if (child) {
                            if (!obj[map[parent]]) {
                                obj[map[parent]] = [];
                            }
                            obj[map[parent]].push(map[x.key]);
                        }
                    });
                    Object.keys(obj).forEach((source) => {
                        (0, n_1.arrUnique)(obj[source]).forEach((target) => {
                            treeType["药品"].push({
                                source,
                                target,
                            });
                        });
                    });
                    idCompanyArr.forEach(({ md5Id: source_id, data }) => {
                        data.company.forEach((x) => {
                            const c = getCurrent("公司", x);
                            if (!c) {
                                return;
                            }
                            mainResField.graphs.push({
                                source_id,
                                source_type: "药品",
                                graph: "生产",
                                target_id: c.md5Id,
                                target_type: "公司",
                                username: "-",
                                id: (0, methods_1.getGraphId)(source_id, c.md5Id, "生产"),
                            });
                        });
                    });
                }
                links.forEach((x) => {
                    if (allMapping[x.source_type] && allMapping[x.target_type]) {
                        const l = getCurrent(x.source_type, x.source_value);
                        const r = getCurrent(x.target_type, x.target_value);
                        if (l && r) {
                            const source_id = l.md5Id;
                            const target_id = r.md5Id;
                            const { source_type, target_type, graph } = x;
                            if (x.graph !== "所属父级") {
                                mainResField.graphs.push({
                                    source_id,
                                    source_type,
                                    graph,
                                    target_id,
                                    target_type,
                                    username: "-",
                                    id: (0, methods_1.getGraphId)(source_id, target_id, graph),
                                });
                            }
                            else {
                                if (source_type === target_type) {
                                    treeType[x.target_type].push({
                                        source: target_id,
                                        target: source_id,
                                    });
                                }
                            }
                        }
                        else {
                            noGraphs.push(Object.assign(Object.assign({}, x), { reason: "MAP ERROR" }));
                        }
                    }
                    else {
                        noGraphs.push(Object.assign(Object.assign({}, x), { reason: "不存在的实体类型" }));
                    }
                });
                const no = {
                    update,
                    noGraphs,
                };
                if (Object.values(no).some((x) => x.length)) {
                    xlsx.writeFile((0, n_1.getKeys)(no)
                        .map((e) => {
                        return {
                            sheet: e,
                            data: no[e],
                        };
                    })
                        .filter((x) => x.data.length), (0, path_1.join)(xlsxPath, "no"));
                    (0, n_1.getKeys)(no).forEach((x) => {
                        const len = no[x].length;
                        if (len) {
                            console.log(x, len);
                        }
                    });
                }
                Object.keys(treeType).forEach((type) => {
                    const nodes = mainResField.nodes.filter((x) => +x.mainitem && x.type === type);
                    const map = (0, n_1.arrObject)(nodes, "id", "value");
                    const links = (0, n_1.arrUniqueBy)(treeType[type].filter((e) => map[e.source] && map[e.target] && e.source !== e.target));
                    const tree = (0, methods_1.getTree)({
                        nodes: nodes.map(({ id, value }) => ({ id, value })),
                        links,
                    });
                    const min = (item, prefix = "", depth = 0) => {
                        item.forEach((x, index) => {
                            var _a;
                            const tree_id = prefix + index;
                            mainResField.tree.push({
                                tree_id,
                                id: x.id,
                                username: "-",
                                type,
                                num: index,
                                depth,
                            });
                            if ((_a = x.children) === null || _a === void 0 ? void 0 : _a.length) {
                                min(x.children, tree_id + methods_1.split, depth + 1);
                            }
                        });
                    };
                    min(tree, getExistPrefix(type));
                });
                return mainResField;
            });
        }
        const mainResField = yield addFieldNodeTreeGraph();
        merge(mainRes, mainResCommon, ["nodes", "tree"]);
        merge(mainRes, mainResField, ["nodes", "tree", "graphs"]);
        yield insertData(["DEMO_", "LOCAL_"], mainRes);
        process.exit();
    });
}
init();
