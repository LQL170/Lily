"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const cache_1 = require("../../../cache");
function cut(data) {
    return data.sort((a, b) => b.value - a.value).slice(0, 15);
}
const index = {
    method: "POST",
    url: "/charts/get",
    handler({ body: { count, key } }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield cache_1.cacheChartData.update();
            const data = cache_1.cacheChartData.get();
            if (count === "file") {
                if (key === "field") {
                    const obj = {};
                    data.forEach(({ fields, res_id }) => {
                        fields.forEach((e) => {
                            if (!obj[e]) {
                                obj[e] = {};
                            }
                            obj[e][res_id] = true;
                        });
                    });
                    return Object.keys(obj).map((x) => ({
                        name: x,
                        value: Object.keys(obj[x]).length,
                    }));
                }
                else if (key === "drug") {
                    const obj = {};
                    data.forEach(({ values, res_id }) => {
                        values.forEach(({ type, value }) => {
                            if (type === "药品") {
                                if (!obj[value]) {
                                    obj[value] = {};
                                }
                                obj[value][res_id] = true;
                            }
                        });
                    });
                    return cut(Object.keys(obj).map((x) => ({
                        name: x,
                        value: Object.keys(obj[x]).length,
                    })));
                }
                else if (key === "mesh") {
                    const obj = {};
                    data.forEach(({ values, res_id }) => {
                        values.forEach(({ type, value }) => {
                            if (type === "疾病") {
                                if (!obj[value]) {
                                    obj[value] = {};
                                }
                                obj[value][res_id] = true;
                            }
                        });
                    });
                    return cut(Object.keys(obj).map((x) => ({
                        name: x,
                        value: Object.keys(obj[x]).length,
                    })));
                }
            }
            else if (count === "tag") {
                if (key === "field") {
                    const obj = {};
                    data.forEach(({ fields, values }) => {
                        fields.forEach((e) => {
                            if (!obj[e]) {
                                obj[e] = 0;
                            }
                            obj[e] += values.length;
                        });
                    });
                    return Object.keys(obj).map((x) => ({
                        name: x,
                        value: obj[x],
                    }));
                }
                else if (key === "drug") {
                    const obj = {};
                    data.forEach(({ values }) => {
                        values.forEach(({ type, value }) => {
                            if (type === "药品") {
                                if (!obj[value]) {
                                    obj[value] = 0;
                                }
                                obj[value] += 1;
                            }
                        });
                    });
                    return cut(Object.keys(obj).map((x) => ({
                        name: x,
                        value: obj[x],
                    })));
                }
                else if (key === "mesh") {
                    const obj = {};
                    data.forEach(({ values }) => {
                        values.forEach(({ type, value }) => {
                            if (type === "疾病") {
                                if (!obj[value]) {
                                    obj[value] = 0;
                                }
                                obj[value] += 1;
                            }
                        });
                    });
                    return cut(Object.keys(obj).map((x) => ({
                        name: x,
                        value: obj[x],
                    })));
                }
            }
            return [];
        });
    },
};
exports.default = index;
