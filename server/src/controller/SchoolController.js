"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listClasses = exports.listSchools = exports.createClass = exports.createSchool = void 0;
var supabase_1 = require("../utils/supabase");
var createSchool = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, address, _b, data, error;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _c.sent(), name = _a.name, address = _a.address;
                return [4 /*yield*/, supabase_1.supabase
                        .from("School")
                        .insert([{ name: name, address: address }])
                        .select()
                        .single()];
            case 2:
                _b = _c.sent(), data = _b.data, error = _b.error;
                if (error) {
                    console.log("Failed to create school", error === null || error === void 0 ? void 0 : error.message);
                    return [2 /*return*/, c.json({ error: "Failed to create school", details: error.message }, 500)];
                }
                else {
                    return [2 /*return*/, c.json({ message: "School created", school: data }, 201)];
                }
                return [2 /*return*/];
        }
    });
}); };
exports.createSchool = createSchool;
var createClass = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, schoolId, school, _b, data, error;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _c.sent(), name = _a.name, schoolId = _a.schoolId;
                return [4 /*yield*/, supabase_1.supabase
                        .from("School")
                        .select("id")
                        .eq("id", schoolId)
                        .single()];
            case 2:
                school = (_c.sent()).data;
                if (!school)
                    return [2 /*return*/, c.json({ error: "School not found" }, 404)];
                return [4 /*yield*/, supabase_1.supabase
                        .from("Class")
                        .insert([{ name: name, schoolId: schoolId }])
                        .select()
                        .single()];
            case 3:
                _b = _c.sent(), data = _b.data, error = _b.error;
                if (error)
                    return [2 /*return*/, c.json({ error: "Failed to create class", details: error.message }, 500)];
                return [2 /*return*/, c.json({ message: "Class created", class: data }, 201)];
        }
    });
}); };
exports.createClass = createClass;
var listSchools = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, supabase_1.supabase.from("School").select("*")];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    return [2 /*return*/, c.json({ error: "Failed to fetch schools" }, 500)];
                return [2 /*return*/, c.json(data, 200)];
        }
    });
}); };
exports.listSchools = listSchools;
var listClasses = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var schoolId, query, _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                schoolId = c.req.query().schoolId;
                query = supabase_1.supabase.from("Class").select("*");
                if (schoolId)
                    query.eq("schoolId", schoolId);
                return [4 /*yield*/, query];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    return [2 /*return*/, c.json({ error: "Failed to fetch classes" }, 500)];
                return [2 /*return*/, c.json(data, 200)];
        }
    });
}); };
exports.listClasses = listClasses;
