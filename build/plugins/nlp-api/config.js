"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nlpApi = void 0;
const os_1 = require("os");
const isRemote = (0, os_1.type)() === "Windows_NT" && (0, os_1.hostname)() === "LQL";
const dev = {
    entity: "https://api.medomino.com/_nlp_api/az_entity",
    fileTag: "https://api.medomino.com/_nlp_api/az_filetag",
    search: "https://api.medomino.com/_nlp_api/az_search",
};
const prod = {
    entity: "http://192.168.1.41:5008/parse_interior",
    fileTag: "http://192.168.1.41:6006/get_concept_api",
    search: "http://192.168.1.41:6006/get_sorted_file_api",
};
exports.nlpApi = isRemote ? dev : prod;
