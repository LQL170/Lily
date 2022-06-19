"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaticSplitUrl = exports.getStaticUrl = void 0;
const n_1 = require("@m170/utils/n");
const configs_1 = require("../../../configs");
const utils_1 = require("./utils");
const base = n_1.path.parse(utils_1.dirOptions.source).dir;
function getStaticUrl(url) {
    const temp = url.replace(base, "").replace(/\\/g, "/");
    return configs_1.isDev
        ? `http://localhost:${configs_1.DOCKERPORT}/static${temp}`
        : `/static${temp}`;
}
exports.getStaticUrl = getStaticUrl;
function getStaticSplitUrl(url) {
    const temp = url.replace(base, "").replace(/\\/g, "/");
    return configs_1.isDev
        ? `http://localhost:${configs_1.DOCKERPORT}/static-imgs/${temp}`
        : `/static-imgs/${temp}`;
}
exports.getStaticSplitUrl = getStaticSplitUrl;
