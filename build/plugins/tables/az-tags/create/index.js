"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTables = exports.baseCols = void 0;
const tslib_1 = require("tslib");
const database_1 = require("../../../../configs/database");
const data_1 = require("../data");
exports.baseCols = {
    rid: {
        type: "varchar(32)",
        index: "UNIQUE",
        primary: true,
        comment: "该行记录的唯一键",
        noNull: true,
    },
    [data_1.rootConfig.trigger_timestamp]: {
        type: "timestamptz(6)",
        comment: "修改时间 或者 插入时间",
    },
    edit_user: {
        type: "varchar(255)",
        comment: "修改人",
    },
    edit_status: {
        type: "varchar(32)",
        comment: "修改状态：1. 添加；2. 删除；3. 更新。对同一条记录的编辑，状态和修改人字符依次覆盖",
    },
};
const customCols = {};
function makeFUNCTION() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield database_1.pgsql.query(`CREATE OR REPLACE FUNCTION "${data_1.rootConfig.trigger}"()
      RETURNS "pg_catalog"."trigger" AS $BODY$
         BEGIN
           NEW.${data_1.rootConfig.trigger_timestamp} = CURRENT_TIMESTAMP;
         RETURN NEW;
         END;
         $BODY$
   LANGUAGE plpgsql VOLATILE
     `);
    });
}
function createMin(_table) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fields = customCols[_table] || {};
        const nodes = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, data_1.getFieldValueTable)(_table);
            const dataCols = {
                id: {
                    type: "varchar(32)",
                    index: true,
                    comment: "节点ID",
                    noNull: true,
                },
                value: {
                    type: "varchar",
                    length: 1000,
                    comment: "节点的别名",
                    noNull: true,
                },
                mainitem: {
                    type: "varchar",
                    length: 1,
                    comment: "标记为 1 该别名为节点标准值， 两个取值 1 0 ",
                    noNull: true,
                },
            };
            yield database_1.pgsql.createTable({
                drop: true,
                table,
                cols: Object.assign(dataCols, fields, exports.baseCols),
                trigger: {
                    status: ["INSERT", "UPDATE"],
                    func: data_1.rootConfig.trigger,
                },
            });
        });
        const graphs = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const table = (0, data_1.getFieldValueTable)(_table, true);
            const dataCols = {
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
            yield database_1.pgsql.createTable({
                drop: true,
                table,
                cols: Object.assign(dataCols, fields, exports.baseCols),
                trigger: {
                    status: ["INSERT", "UPDATE"],
                    func: data_1.rootConfig.trigger,
                },
            });
        });
        yield Promise.all([nodes(), graphs()]);
    });
}
function createTables() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield makeFUNCTION();
        yield Promise.all(data_1.tables.map((x) => createMin(x)));
    });
}
exports.createTables = createTables;
