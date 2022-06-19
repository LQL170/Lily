"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTree = void 0;
const n_1 = require("@m170/utils/n");
function getTree({ nodes, links, }) {
    const needIds = (0, n_1.arrObject)(nodes.map((x) => x.id));
    links = links.filter((x) => needIds[x.source] && needIds[x.target]);
    const nodeMapping = (() => {
        const data = {};
        const statusObj = {};
        nodes.forEach((x) => {
            data[x.id] = {
                value: x,
                status: "",
                children: [],
                parent: [],
            };
        });
        links.forEach(({ source, target }) => {
            var _a;
            if (!statusObj[source]) {
                statusObj[source] = {
                    parent: {},
                    child: {},
                };
            }
            if (!statusObj[target]) {
                statusObj[target] = {
                    parent: {},
                    child: {},
                };
            }
            statusObj[source].child[target] = true;
            statusObj[target].parent[source] = true;
            if (!data[source].value.children) {
                data[source].value.children = [];
            }
            (_a = data[source].value.children) === null || _a === void 0 ? void 0 : _a.push(data[target].value);
        });
        Object.keys(statusObj).forEach((x) => {
            const { parent, child } = statusObj[x];
            const pLen = Object.keys(parent);
            const cLen = Object.keys(child);
            data[x].children = cLen;
            data[x].parent = pLen;
            if (pLen.length && cLen.length) {
                data[x].status = "parent-child";
            }
            else if (pLen.length && !cLen.length) {
                data[x].status = "parent";
            }
            else if (!pLen.length && cLen.length) {
                data[x].status = "child";
            }
        });
        return data;
    })();
    const nodesWrap = Object.values(nodeMapping);
    const rootNodesNoChild = nodesWrap
        .filter((x) => x.status === "")
        .map((x) => x.value);
    const rootNodes = nodesWrap
        .filter((x) => x.status === "child")
        .map((x) => x.value);
    const tree = [...rootNodes, ...rootNodesNoChild];
    return tree;
}
exports.getTree = getTree;
