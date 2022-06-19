"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.models = void 0;
exports.models = {
    release: {
        content: "${fileName}等${fileCount}个内容由${username}发布",
        vals: ["fileCount", "fileName", "username"],
        label: "新内容发布",
        file_control: true,
    },
    approval: {
        content: "${fileName}等${fileCount}个内容由${username}${fileAction}",
        vals: ["fileCount", "fileName", "username", "fileAction"],
        label: "审批文件动态",
    },
    down: {
        content: "${fileName}等${fileCount}个内容由${username}下架",
        vals: ["fileCount", "fileName", "username"],
        label: "文件下架提醒",
        file_control: true,
    },
    expire: {
        content: "${fileName}等${fileCount}个内容即将过期",
        vals: ["fileCount", "fileName"],
        label: "文件即将过期提醒",
        file_control: true,
    },
};
