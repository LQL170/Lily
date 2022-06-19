"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GETDATA = exports.fields_tag = exports.tag_common = exports.admin = exports.feedback = exports.fields = exports.handleStr = exports.getTypeId = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("../../utils");
const database_1 = require("../../../../configs/database");
const n_1 = require("@m170/utils/n");
const methods_1 = require("../../import/methods");
function getTypeId(type, value) {
    return (0, methods_1.getId)(type, value);
}
exports.getTypeId = getTypeId;
function handleStr(str) {
    return (str || "").trim();
}
exports.handleStr = handleStr;
tslib_1.__exportStar(require("./type"), exports);
exports.fields = [
    "肿瘤",
    "呼吸",
    "心血管",
    "糖尿病",
    "消化",
    "肾病",
    "其它",
];
exports.feedback = ["系统BUG", "使用疑问"];
exports.admin = {
    username: "medomino",
    password: (0, utils_1.encryptPassword)("medomino", "medomino"),
};
exports.tag_common = {
    文件类型: [
        {
            value: "产品说明书",
        },
        {
            value: "FAQ",
        },
        {
            value: "SRL",
        },
        {
            value: "医学视频",
        },
        {
            value: "患教材料",
        },
        {
            value: "医学图文",
        },
        {
            value: "医学档案",
        },
        {
            value: "医学幻灯",
        },
        {
            value: "医学文献",
        },
        {
            value: "药品样例",
        },
        {
            value: "Medical Insight",
        },
        {
            value: "Literature Alert",
        },
        {
            value: "Medical Intelligence",
        },
        {
            value: "AZ医速递",
        },
        {
            value: "Newsletter",
        },
    ],
    超适应症: [
        {
            value: "off label",
        },
        {
            value: "in label",
        },
    ],
    文件目标人群: [
        {
            value: "患者",
        },
        {
            value: "医生",
        },
        {
            value: "AZ内部",
        },
    ],
    研究类型: [
        {
            value: "三期临床研究",
        },
        {
            value: "综述",
        },
        {
            value: "病例报道",
        },
        {
            value: "Meta分析",
        },
    ],
    文件格式: [
        {
            value: "PPT",
        },
        {
            value: "PDF",
        },
        {
            value: "图片",
        },
        {
            value: "视频",
        },
        {
            value: "Word",
        },
        {
            value: "Excel",
        },
        {
            value: "Txt",
        },
    ],
    文件来源: [
        {
            value: "学会机构",
        },
        {
            value: "大会",
        },
        {
            value: "杂志",
        },
        {
            value: "微信公众号",
        },
    ],
    文件权限: [
        {
            value: "推广材料",
        },
        {
            value: "内部材料",
        },
        {
            value: "非推广材料",
        },
    ],
    文件状态: [
        {
            value: "有效期",
        },
        {
            value: "已下架",
        },
        {
            value: "已过期",
        },
    ],
    "审批号/文件编号": [],
    文件上传用户: [],
};
exports.fields_tag = ["疾病", "药品"];
exports.GETDATA = {
    疾病: ({ key, username }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const tree = {};
        const data = yield database_1.pgsqlMaster.query(`SELECT "treeID" as id, "treeNum" as path, value, translated, "mainItem" as mainitem FROM "mesh_node_filter" WHERE "treeNum" like 'C04%'`);
        const nodes = (() => {
            const nodes = [];
            const repeatVal = {};
            const ids = {};
            const md5M = {};
            data.forEach(({ value, translated, mainitem, id, path }) => {
                if (!md5M[id]) {
                    md5M[id] = (0, n_1.md5)(id);
                }
                tree[path] = md5M[id];
                value = handleStr(value);
                translated = handleStr(translated);
                if (!ids[md5M[id]]) {
                    ids[md5M[id]] = {
                        std: translated || value,
                        value: [],
                    };
                }
                const item = ids[md5M[id]];
                if (+mainitem) {
                    item.std = translated || value;
                }
                if (value && !repeatVal[value]) {
                    item.value.push(value);
                    repeatVal[value] = true;
                }
                if (translated && !repeatVal[translated]) {
                    item.value.push(translated);
                    repeatVal[translated] = true;
                }
            });
            Object.keys(ids).forEach((id) => {
                const { std, value } = ids[id];
                value.forEach((value) => {
                    nodes.push({
                        type: key,
                        id,
                        value,
                        mainitem: value === std ? "1" : "0",
                        rid: getTypeId(key, value),
                        username,
                    });
                });
            });
            return nodes;
        })();
        const graphs = (() => {
            let graphs = [];
            const graphsObj = {};
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
                        if (!graphsObj[id]) {
                            const source = tree[parent];
                            const target = tree[child];
                            graphsObj[id] = {
                                source,
                                target,
                                type: key,
                                username,
                            };
                        }
                    }
                }
            });
            graphs = graphs.concat(Object.values(graphsObj));
            return graphs;
        })();
        return {
            nodes,
            graphs,
        };
    }),
    药品: ({ key, username }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const nodes = [];
        const graphs = [];
        const main = yield (() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            let [atc, drug] = yield Promise.all([
                database_1.pgsqlMaster.query(`SELECT atc, value, mainitem FROM "atc_tree"`),
                database_1.pgsqlMaster.query(`SELECT id, value, "ATC" as atc, mainitem FROM "drug_mesh_standard"`),
            ]);
            atc = atc.filter((x) => x.atc.startsWith("A"));
            drug = [];
            drug = drug.filter((x) => ["brand", "molecule"].includes(x["value type"]));
            const obj = {};
            atc.forEach(({ atc, value, mainitem }) => {
                if (!obj[atc]) {
                    obj[atc] = { value: "", list: [] };
                }
                obj[atc].list.push(value);
                if (+mainitem === 1) {
                    obj[atc].value = value;
                }
            });
            drug.forEach(({ atc, value, mainitem, "value type": type }) => {
                if (!obj[atc]) {
                    obj[atc] = { value: "", list: [] };
                }
                obj[atc].list.push(value);
                if (+mainitem === 1 && type === "molecule") {
                    obj[atc].value = value;
                }
            });
            const main = Object.keys(obj)
                .map((x) => {
                const { value, list } = obj[x];
                const arr = (0, n_1.arrUnique)(list, true);
                const atcArr = x.match(/\d+|[A-Z]/g) || [];
                return {
                    atc: x,
                    atcArr,
                    depth: atcArr.length,
                    value: value || arr[0],
                    list: arr,
                };
            })
                .filter((x) => x.value);
            return main;
        }))();
        const ids = {};
        {
            const repeatVal = {};
            main.forEach(({ atc, value, list }) => {
                if (repeatVal[value]) {
                    return;
                }
                repeatVal[value] = true;
                const _list = [];
                list.forEach((x) => {
                    if (!repeatVal[x] && x !== value) {
                        repeatVal[x] = true;
                        _list.push(x);
                    }
                });
                const id = (0, n_1.md5)(atc);
                ids[atc] = id;
                nodes.push({
                    type: key,
                    id,
                    value,
                    mainitem: "1",
                    username,
                    rid: (0, n_1.md5)(value),
                });
                _list.forEach((value) => {
                    nodes.push({
                        type: key,
                        id,
                        value,
                        mainitem: "1",
                        username,
                        rid: (0, n_1.md5)(value),
                    });
                });
            });
        }
        {
            const links = main.map(({ atc, depth }) => {
                return {
                    atc,
                    depth,
                };
            });
            const arr = Array(Math.max(...links.map((x) => x.depth)))
                .fill(0)
                .map(() => {
                return [];
            });
            links.forEach((x) => {
                arr[x.depth - 1].push(x.atc);
            });
            arr.slice(0, arr.length - 1).forEach((x, index) => {
                const parent = x;
                const childs = arr[index + 1];
                parent.forEach((x) => {
                    const list = childs.filter((e) => e.startsWith(x));
                    list.forEach((e) => {
                        if (ids[x] && ids[e]) {
                            graphs.push({
                                target: ids[x],
                                source: ids[e],
                                type: key,
                                username,
                            });
                        }
                    });
                });
            });
        }
        return {
            nodes,
            graphs,
        };
    }),
};
