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
exports.getCurrentStudent = exports.getStudentStreaks = exports.getStudentSubmissions = exports.getStudentById = void 0;
var supabase_1 = require("../utils/supabase");
var auth_1 = require("../utils/auth");
var dotenv = require("dotenv");
dotenv.config();
var getStudentById = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var studentId, userId, _a, student, studentError, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                studentId = c.req.param("studentId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("\n        *,\n        user:User(*),\n        school:School(*),\n        class:Class(*)\n      ")
                        .eq("id", studentId)
                        .single()];
            case 1:
                _a = _b.sent(), student = _a.data, studentError = _a.error;
                if (studentError) {
                    return [2 /*return*/, c.json({ error: "Student not found" }, 404)];
                }
                if (student.userId !== userId) {
                    return [2 /*return*/, c.json({ error: "Access denied" }, 403)];
                }
                return [2 /*return*/, c.json(student, 200)];
            case 2:
                error_1 = _b.sent();
                console.error("Error fetching student:", error_1);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getStudentById = getStudentById;
var getStudentSubmissions = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var studentId, userId, _a, student, studentError, _b, submissions, submissionsError, transformedSubmissions, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                studentId = c.req.param("studentId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("userId")
                        .eq("id", studentId)
                        .single()];
            case 1:
                _a = _c.sent(), student = _a.data, studentError = _a.error;
                if (studentError) {
                    return [2 /*return*/, c.json({ error: "Student not found" }, 404)];
                }
                if (student.userId !== userId) {
                    return [2 /*return*/, c.json({ error: "Access denied" }, 403)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Submission")
                        .select("\n        *,\n        assignment:Assignment(*)\n      ")
                        .eq("studentId", studentId)
                        .order("submittedAt", { ascending: false })];
            case 2:
                _b = _c.sent(), submissions = _b.data, submissionsError = _b.error;
                if (submissionsError) {
                    console.error("Error fetching submissions:", submissionsError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch submissions" }, 500)];
                }
                transformedSubmissions = submissions.map(function (submission) {
                    var _a, _b, _c, _d, _e;
                    return ({
                        id: submission.id,
                        assignment: {
                            id: (_a = submission.assignment) === null || _a === void 0 ? void 0 : _a.id,
                            title: (_b = submission.assignment) === null || _b === void 0 ? void 0 : _b.title,
                            description: (_c = submission.assignment) === null || _c === void 0 ? void 0 : _c.description,
                            due_date: (_d = submission.assignment) === null || _d === void 0 ? void 0 : _d.dueDate,
                            points_possible: ((_e = submission.assignment) === null || _e === void 0 ? void 0 : _e.points) || 100,
                        },
                        status: submission.aiFeedback
                            ? "graded"
                            : submission.submittedAt
                                ? "submitted"
                                : "draft",
                        points_earned: submission.aiScore,
                        submitted_at: submission.submittedAt,
                        graded_at: submission.feedbackGeneratedAt,
                        feedback: submission.aiFeedback,
                        content: submission.content,
                    });
                });
                return [2 /*return*/, c.json(transformedSubmissions, 200)];
            case 3:
                error_2 = _c.sent();
                console.error("Error fetching student submissions:", error_2);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getStudentSubmissions = getStudentSubmissions;
var getStudentStreaks = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var studentId, userId, _a, student, studentError, _b, streaks_1, streaksError, currentStreak_1, transformedStreaks, error_3;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                studentId = c.req.param("studentId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("userId")
                        .eq("id", studentId)
                        .single()];
            case 1:
                _a = _c.sent(), student = _a.data, studentError = _a.error;
                if (studentError) {
                    return [2 /*return*/, c.json({ error: "Student not found" }, 404)];
                }
                if (student.userId !== userId) {
                    return [2 /*return*/, c.json({ error: "Access denied" }, 403)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("LoginStreak")
                        .select("*")
                        .eq("userId", userId)
                        .order("loginDate", { ascending: false })
                        .limit(30)];
            case 2:
                _b = _c.sent(), streaks_1 = _b.data, streaksError = _b.error;
                if (streaksError) {
                    console.error("Error fetching streaks:", streaksError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch streaks" }, 500)];
                }
                currentStreak_1 = calculateCurrentStreak(streaks_1);
                transformedStreaks = streaks_1.map(function (streak, index) { return ({
                    id: streak.id,
                    user_id: streak.userId,
                    current_streak: index === 0 ? currentStreak_1 : undefined,
                    longest_streak: undefined,
                    last_login_date: streak.loginDate,
                    total_logins: streaks_1.length,
                    loginDate: streak.loginDate,
                    consecutive: streak.consecutive,
                }); });
                return [2 /*return*/, c.json(transformedStreaks, 200)];
            case 3:
                error_3 = _c.sent();
                console.error("Error fetching student streaks:", error_3);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getStudentStreaks = getStudentStreaks;
var calculateCurrentStreak = function (streaks) {
    if (!streaks || streaks.length === 0)
        return 0;
    var currentStreak = 0;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    for (var i = 0; i < streaks.length; i++) {
        var streakDate = new Date(streaks[i].loginDate);
        streakDate.setHours(0, 0, 0, 0);
        var daysDiff = Math.floor((today.getTime() - streakDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === i && streaks[i].consecutive) {
            currentStreak++;
        }
        else {
            break;
        }
    }
    return currentStreak;
};
var getCurrentStudent = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, student, studentError, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("\n        *,\n        user:User(*),\n        school:School(*),\n        class:Class(*)\n      ")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _b.sent(), student = _a.data, studentError = _a.error;
                if (studentError) {
                    return [2 /*return*/, c.json({ error: "Student profile not found" }, 404)];
                }
                return [2 /*return*/, c.json(student, 200)];
            case 2:
                error_4 = _b.sent();
                console.error("Error fetching current student:", error_4);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getCurrentStudent = getCurrentStudent;
