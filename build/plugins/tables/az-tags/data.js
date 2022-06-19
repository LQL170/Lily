"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fields = exports.tables = exports.getFieldValueTable = exports.rootConfig = void 0;
exports.rootConfig = {
    prefix: "dict_field_value_",
    trigger: "medomino_az_timestamp_update",
    trigger_timestamp: "timestamp",
};
function getFieldValueTable(_table, graph) {
    return `${exports.rootConfig.prefix}${_table}${graph ? "_graph" : ""}`;
}
exports.getFieldValueTable = getFieldValueTable;
exports.tables = [
    "mesh",
    "drug",
    "company",
    "biomarker",
    "check",
    "cureline",
    "symptom",
    "patienttype",
];
exports.fields = [
    "肿瘤",
    "呼吸",
    "心血管",
    "代谢",
    "消化",
    "肾病",
    "其它",
];
