"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldsMap = exports.getTable = exports.dictPrefix = exports.prefix = exports.rootConfig = void 0;
const static_1 = require("../../../configs/static");
exports.rootConfig = {
    prefix: "dict_field_value_",
    trigger: "medomino_az_timestamp_update",
    trigger_timestamp: "timestamp",
};
exports.prefix = static_1.isDev ? "DEMO_" : "LOCAL_";
exports.dictPrefix = "tag_value";
const tables = [
    "fields",
    "users",
    "roles",
    "groups",
    "user_logs",
    "user_logs_models",
    "nlp_upload",
    "nlp_upload_old",
    "nlp_upload_split",
    "nlp_text",
    "nlp_entity",
    "nlp_entity_add",
    "nlp_entity_remark",
    "nlp_entity_std",
    "nlp_upload_tags",
    "nlp_upload_field",
    "nlp_upload_collect",
    "nlp_upload_tags_field",
    "feedback_type",
    "feedback_logs",
    "tag_type",
    "tag_value",
    "tag_value_tree",
    "tag_value_graph",
    "tag_type_control",
    "msg_model",
    "msg_data",
    "msg_users",
    "msg_control",
    "custom_search",
];
function getTable(table) {
    return `${exports.prefix}${table}`;
}
exports.getTable = getTable;
exports.fieldsMap = {
    tag_type_control: {
        drop: true,
        comment: "",
        cols: {
            type: {
                type: "text",
            },
            username: {
                type: "varchar(32)",
            },
            timestamp: {
                type: "timestamptz(6)",
            },
        },
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    custom_search: {
        drop: true,
        comment: "",
        cols: {
            username: {
                type: "varchar(32)",
                primary: true,
                index: "UNIQUE",
            },
            data: {
                type: "text",
            },
        },
    },
    msg_model: {
        drop: true,
        comment: "",
        cols: {
            type: {
                type: "varchar(32)",
                primary: true,
                index: "UNIQUE",
            },
            file_control: {
                type: "int2",
            },
            label: {
                type: "text",
            },
            content: {
                type: "text",
            },
        },
    },
    msg_data: {
        drop: true,
        comment: "",
        cols: {
            type: {
                type: "varchar(32)",
                index: true,
            },
            id: {
                type: "varchar(32)",
                primary: true,
                index: "UNIQUE",
            },
            vals: {
                type: "text",
            },
            timestamp: {
                type: "timestamptz(6)",
                comment: "????????????",
            },
        },
        trigger: {
            status: ["INSERT"],
            func: exports.rootConfig.trigger,
        },
    },
    msg_users: {
        drop: true,
        comment: "",
        cols: {
            type: {
                type: "varchar(32)",
                index: true,
            },
            id: {
                type: "varchar(32)",
                index: true,
            },
            rid: {
                type: "varchar(32)",
                primary: true,
            },
            username: {
                type: "varchar(255)",
                index: true,
            },
            status: {
                type: "timestamptz(6)",
                comment: "????????????????????????",
            },
        },
    },
    msg_control: {
        drop: true,
        comment: "",
        cols: {
            username: {
                type: "varchar(255)",
                primary: true,
            },
            mail: {
                type: "int2",
            },
            msgs: {
                type: "text",
            },
            expire: {
                type: "int2",
            },
            file_control: {
                type: "text",
                comment: "????????????????????????????????????",
            },
        },
    },
    tag_type: {
        drop: true,
        cols: {
            role: {
                type: "varchar(32)",
                index: true,
            },
            type: {
                type: "varchar(255)",
                index: "UNIQUE",
                primary: true,
            },
            username: {
                type: "varchar(255)",
                comment: "?????????/???????????????",
            },
            status: {
                type: "varchar(255)",
                comment: "delete / update",
            },
            prefix: {
                type: "text",
            },
            prefix_number: {
                type: "int2",
            },
            timestamp: {
                type: "timestamptz(6)",
                comment: "????????????",
            },
        },
        comment: "????????????",
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    tag_value: {
        drop: true,
        cols: {
            type: {
                type: "varchar(255)",
                index: true,
            },
            id: {
                type: "varchar(32)",
                index: true,
                comment: "??????ID",
                noNull: true,
            },
            value: {
                type: "text",
                comment: "???????????????",
                noNull: true,
            },
            mainitem: {
                type: "varchar",
                length: 1,
                comment: "????????? 1 ?????????????????????????????? ???????????? 1 0 ",
                noNull: true,
            },
            rid: {
                type: "varchar(32)",
                comment: "????????????ID",
                noNull: true,
                primary: true,
            },
            username: {
                type: "varchar(255)",
                comment: "?????????",
            },
            status: {
                type: "varchar(255)",
                comment: "delete / update",
            },
            timestamp: {
                type: "timestamptz(6)",
                comment: "????????????",
            },
        },
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    tag_value_graph: {
        drop: true,
        cols: {
            id: {
                type: "varchar(32)",
                primary: true,
                noNull: true,
            },
            source_type: {
                type: "varchar(255)",
                noNull: true,
            },
            target_type: {
                type: "varchar(255)",
                noNull: true,
            },
            graph: {
                type: "varchar(255)",
                index: true,
                noNull: true,
            },
            source_id: {
                type: "varchar(32)",
                comment: "source ??????",
                noNull: true,
            },
            target_id: {
                type: "varchar(32)",
                comment: "target ??????",
                noNull: true,
            },
            username: {
                type: "varchar(255)",
                comment: "?????????",
            },
            status: {
                type: "varchar(255)",
                comment: "delete / update",
            },
            timestamp: {
                type: "timestamptz(6)",
                comment: "????????????",
            },
        },
        comment: "????????????",
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    tag_value_tree: {
        drop: true,
        cols: {
            type: {
                type: "varchar(255)",
                noNull: true,
            },
            tree_id: {
                type: "varchar(255)",
                index: true,
                primary: true,
            },
            depth: {
                type: "int2",
                noNull: true,
            },
            num: {
                type: "int2",
                noNull: true,
            },
            id: {
                type: "varchar(32)",
                noNull: true,
            },
            username: {
                type: "varchar(255)",
                comment: "?????????",
                noNull: true,
            },
            status: {
                type: "varchar(255)",
                comment: "delete / update",
            },
            timestamp: {
                type: "timestamptz(6)",
                comment: "????????????",
            },
        },
        comment: "????????????",
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    nlp_upload_collect: {
        drop: true,
        cols: {
            res_id: {
                type: "varchar(32)",
                index: "UNIQUE",
            },
            username: {
                type: "varchar(255)",
                comment: "",
            },
            timestamp: {
                type: "timestamptz(6)",
            },
        },
        comment: "??????",
        trigger: {
            status: ["INSERT"],
            func: exports.rootConfig.trigger,
        },
    },
    feedback_logs: {
        drop: true,
        cols: {
            type: {
                type: "varchar(255)",
                noNull: true,
            },
            text: {
                type: "text",
            },
            username: {
                type: "varchar(255)",
                comment: "",
            },
            timestamp: {
                type: "timestamptz(6)",
            },
            username_handle: {
                type: "varchar(255)",
                comment: "?????????",
            },
            text_handle: {
                type: "text",
            },
        },
        comment: "??????",
        trigger: {
            status: ["INSERT"],
            func: exports.rootConfig.trigger,
        },
    },
    feedback_type: {
        drop: true,
        cols: {
            type: {
                type: "varchar(255)",
                index: "UNIQUE",
                noNull: true,
            },
            username: {
                type: "varchar(255)",
                comment: "?????????",
            },
            timestamp: {
                type: "timestamptz(6)",
            },
        },
        comment: "????????????",
        trigger: {
            status: ["INSERT"],
            func: exports.rootConfig.trigger,
        },
    },
    nlp_upload_field: {
        drop: true,
        cols: {
            res_id: {
                type: "varchar(32)",
                index: true,
            },
            field: {
                type: "varchar(32)",
                index: true,
            },
            username: {
                type: "varchar(255)",
                comment: "?????????",
            },
            timestamp: {
                type: "timestamptz(6)",
            },
        },
        comment: "",
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    nlp_upload_tags: {
        drop: true,
        cols: {
            res_id: {
                type: "varchar(32)",
                index: true,
            },
            id: {
                type: "varchar(32)",
            },
            type: {
                type: "varchar(32)",
                index: true,
                comment: "field ???????????? ????????????",
            },
            value: {
                type: "text",
            },
            username: {
                type: "varchar(255)",
                comment: "?????????",
            },
            timestamp: {
                type: "timestamptz(6)",
            },
        },
        comment: "???????????????????????????????????????",
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    nlp_upload_tags_field: {
        drop: true,
        cols: {
            res_id: {
                type: "varchar(32)",
                index: true,
            },
            id: {
                type: "varchar(32)",
            },
            type: {
                type: "varchar(32)",
                index: true,
                comment: "field ?????? ????????????",
            },
            value: {
                type: "text",
            },
            username: {
                type: "varchar(255)",
                comment: "?????????",
            },
            timestamp: {
                type: "timestamptz(6)",
            },
        },
        comment: "???????????????????????????????????????",
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    fields: {
        drop: true,
        cols: {
            field: {
                type: "varchar(32)",
                primary: true,
                index: "UNIQUE",
            },
            mapping: {
                type: "text",
            },
            order: {
                type: "int2",
            },
            icon: {
                type: "varchar(255)",
            },
            svg: {
                type: "text",
            },
            username: {
                type: "varchar(255)",
            },
            timestamp: {
                type: "timestamptz(6)",
            },
        },
        comment: "???????????????????????????????????????",
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    users: {
        comment: "?????????",
        drop: true,
        cols: {
            id: {
                type: "varchar(32)",
                index: "UNIQUE",
                primary: true,
            },
            username: {
                type: "varchar(32)",
                index: "UNIQUE",
            },
            password: {
                type: "varchar",
                length: 64,
            },
            mail: {
                type: "text",
            },
            available: {
                type: "int2",
            },
            super: {
                type: "int2",
            },
            groups: {
                type: "text",
            },
            parents: {
                type: "text",
            },
            create_date: {
                type: "timestamptz(6)",
            },
            timestamp: {
                type: "timestamptz(6)",
            },
        },
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    roles: {
        comment: "?????????",
        drop: true,
        cols: {
            id: {
                type: "varchar(32)",
                index: "UNIQUE",
                primary: true,
            },
            user_id: {
                type: "varchar(32)",
                index: true,
            },
            name: {
                type: "text",
            },
            desc: {
                type: "text",
            },
            permission: {
                type: "text",
            },
            create_date: {
                type: "timestamptz(6)",
            },
            timestamp: {
                type: "timestamptz(6)",
            },
        },
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    groups: {
        comment: "?????????",
        drop: true,
        cols: {
            id: {
                type: "varchar(32)",
                index: "UNIQUE",
                primary: true,
            },
            user_id: {
                type: "varchar(32)",
                index: true,
            },
            name: {
                type: "varchar(32)",
            },
            desc: {
                type: "text",
            },
            roles: {
                type: "text",
            },
            create_date: {
                type: "timestamptz(6)",
            },
            timestamp: {
                type: "timestamptz(6)",
            },
        },
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    user_logs: {
        comment: "??????????????????",
        drop: true,
        cols: {
            id: {
                type: "varchar(32)",
                primary: true,
            },
            key: {
                type: "varchar(32)",
            },
            user_id: {
                type: "varchar(32)",
            },
            username: {
                type: "varchar(32)",
            },
            body: {
                type: "text",
            },
            vals: {
                type: "text",
            },
            timestamp: {
                type: "timestamptz(6)",
            },
        },
        trigger: {
            status: ["INSERT"],
            func: exports.rootConfig.trigger,
        },
    },
    user_logs_models: {
        drop: true,
        comment: "",
        cols: {
            key: {
                type: "varchar(32)",
                primary: true,
                index: "UNIQUE",
            },
            label: {
                type: "text",
            },
            content: {
                type: "text",
            },
        },
    },
    nlp_upload_split: {
        comment: "",
        drop: true,
        cols: {
            res_id: {
                type: "varchar(32)",
                index: true,
            },
            img_id: {
                type: "text",
            },
            order: {
                type: "varchar(32)",
            },
            rids: {
                type: "text",
            },
            timestamp: {
                type: "timestamptz(6)",
                comment: "????????????",
            },
        },
        trigger: {
            status: ["INSERT"],
            func: exports.rootConfig.trigger,
        },
    },
    nlp_upload: {
        comment: "",
        drop: true,
        cols: {
            id: {
                type: "varchar(32)",
                primary: true,
                index: "UNIQUE",
            },
            name: {
                type: "text",
            },
            ext: {
                type: "varchar(255)",
            },
            c_ext: {
                type: "varchar(255)",
                comment: "?????????????????????",
            },
            user_upload: {
                type: "varchar(255)",
            },
            timestamp: {
                type: "timestamptz(6)",
                comment: "????????????",
            },
            expire_timestamp: {
                type: "timestamptz(6)",
                comment: "????????????",
            },
            status_handle: {
                type: "int2",
                comment: "0 ????????????1 ??????",
            },
            status_entity: {
                type: "int2",
                comment: "0 ????????????1 ??????",
            },
            status_filetag: {
                type: "int2",
                comment: "0 ????????????1 ??????",
            },
            user_approval: {
                type: "varchar(255)",
            },
            approval_timestamp: {
                type: "timestamptz(6)",
            },
            file_status: {
                type: "varchar(32)",
                comment: " upload(?????????) approval???????????????down????????????",
            },
        },
        trigger: {
            status: ["INSERT"],
            func: exports.rootConfig.trigger,
        },
    },
    nlp_upload_old: {
        comment: "",
        drop: true,
        cols: {
            parent: {
                type: "varchar(32)",
                index: true,
            },
            id: {
                type: "varchar(32)",
            },
            name: {
                type: "text",
            },
            ext: {
                type: "varchar(255)",
            },
            c_ext: {
                type: "varchar(255)",
                comment: "?????????????????????",
            },
            user_upload: {
                type: "varchar(255)",
            },
            timestamp: {
                type: "timestamptz(6)",
                comment: "????????????",
            },
            expire_timestamp: {
                type: "timestamptz(6)",
                comment: "????????????",
            },
            status_handle: {
                type: "int2",
                comment: "0 ????????????1 ??????",
            },
            status_entity: {
                type: "int2",
                comment: "0 ????????????1 ??????",
            },
            status_filetag: {
                type: "int2",
                comment: "0 ????????????1 ??????",
            },
        },
    },
    nlp_entity: {
        comment: "",
        drop: true,
        cols: {
            id: {
                type: "varchar(32)",
                primary: true,
            },
            rid: {
                type: "varchar(32)",
            },
            res_id: {
                type: "varchar(32)",
                index: true,
            },
            type: {
                type: "varchar(255)",
            },
            value: {
                type: "text",
            },
            range: {
                type: "varchar(255)",
            },
            check_status: {
                type: "varchar(32)",
                comment: " confirm  remove ",
            },
            check_user: {
                type: "varchar(255)",
            },
            check_date: {
                type: "timestamptz(6)",
            },
        },
    },
    nlp_entity_add: {
        drop: true,
        cols: {
            res_id: {
                type: "varchar(32)",
            },
            rid: {
                type: "varchar(32)",
            },
            id: {
                type: "varchar(32)",
            },
            type: {
                type: "varchar(255)",
            },
            value: {
                type: "text",
            },
            range: {
                type: "varchar(255)",
            },
            username: {
                type: "varchar(255)",
            },
            timestamp: {
                type: "timestamptz(6)",
                comment: "????????????",
            },
        },
        trigger: {
            status: ["INSERT"],
            func: exports.rootConfig.trigger,
        },
    },
    nlp_entity_remark: {
        drop: true,
        cols: {
            res_id: {
                type: "varchar(32)",
            },
            rid: {
                type: "varchar(32)",
            },
            id: {
                type: "varchar(32)",
            },
            type: {
                type: "varchar(255)",
            },
            value: {
                type: "text",
            },
            range: {
                type: "varchar(255)",
            },
            remark_type: {
                type: "varchar(255)",
            },
            remark_value: {
                type: "text",
            },
            remark_range: {
                type: "varchar(255)",
            },
            username: {
                type: "varchar(255)",
            },
            timestamp: {
                type: "timestamptz(6)",
                comment: "????????????",
            },
        },
        trigger: {
            status: ["INSERT"],
            func: exports.rootConfig.trigger,
        },
    },
    nlp_entity_std: {
        drop: true,
        comment: "?????????",
        cols: {
            id: {
                type: "varchar(32)",
                primary: true,
                comment: "type + value ????????????",
            },
            type: {
                type: "varchar(255)",
            },
            value: {
                type: "text",
            },
            std_value: {
                type: "text",
            },
            username: {
                type: "varchar(255)",
            },
            timestamp: {
                type: "timestamptz(6)",
                comment: "??????????????????",
            },
        },
        trigger: {
            status: ["INSERT", "UPDATE"],
            func: exports.rootConfig.trigger,
        },
    },
    nlp_text: {
        comment: "",
        drop: true,
        cols: {
            res_id: {
                type: "varchar(32)",
                index: true,
            },
            rid: {
                type: "varchar(32)",
                primary: true,
                index: "UNIQUE",
            },
            order_index: {
                type: "varchar(255)",
            },
            content: {
                type: "text",
            },
        },
    },
};
