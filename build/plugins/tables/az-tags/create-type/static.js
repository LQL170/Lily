"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonTypes = exports.getIdByTree = void 0;
const n_1 = require("@m170/utils/n");
function getIdByTree(data) {
    const nodes = [];
    const graphs = [];
    const min = (data, parent) => {
        data.forEach(({ name, children }) => {
            const id = (0, n_1.md5)(name);
            if (parent) {
                graphs.push({
                    source: parent,
                    target: id,
                    graph: "parent-child",
                    rid: (0, n_1.md5)(parent + id),
                });
            }
            nodes.push({
                id,
                value: name,
            });
            if (children === null || children === void 0 ? void 0 : children.length) {
                min(children, id);
            }
        });
    };
    min(data);
    return {
        nodes,
        graphs,
    };
}
exports.getIdByTree = getIdByTree;
const commonValue = [
    {
        name: "产品说明书",
    },
    {
        name: "FAQ",
    },
    {
        name: "疾病信息",
        children: [
            {
                name: "医学视频",
            },
            {
                name: "患教图文",
            },
            {
                name: "微信图文",
            },
        ],
    },
    {
        name: "产品文献",
        children: [
            {
                name: "指南共识",
            },
            {
                name: "期刊文献",
            },
            {
                name: "会议文献",
            },
        ],
    },
];
exports.commonTypes = [
    {
        name: "资源标签",
        values: commonValue,
    },
    {
        name: "文件类型",
        values: [],
    },
];
