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
exports.getLoginHistory = exports.getStreakStats = exports.getStreakLeaderboard = exports.getMyStreak = exports.recordLogin = void 0;
var supabase_1 = require("../utils/supabase");
var auth_1 = require("../utils/auth");
var dotenv = require("dotenv");
dotenv.config();
var recordLogin = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, student, studentError, today, todayDateString, existingLogin, lastLoginDate, yesterday, isConsecutive, newStreakDays, lastLoginDateString, yesterdayDateString, loginStreakError, updateError, bonusPoints, pointsError, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("id, userId, streakDays, lastLogin, classId")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _b.sent(), student = _a.data, studentError = _a.error;
                if (studentError || !student) {
                    return [2 /*return*/, c.json({ error: "Student not found" }, 404)];
                }
                today = new Date();
                todayDateString = today.toISOString().split("T")[0];
                return [4 /*yield*/, supabase_1.supabase
                        .from("LoginStreak")
                        .select("id")
                        .eq("userId", userId)
                        .eq("loginDate", todayDateString)
                        .single()];
            case 2:
                existingLogin = (_b.sent()).data;
                if (existingLogin) {
                    return [2 /*return*/, c.json({
                            message: "Already logged in today",
                            currentStreak: student.streakDays,
                            loginDate: todayDateString,
                            bonusPoints: 0,
                        })];
                }
                lastLoginDate = student.lastLogin
                    ? new Date(student.lastLogin)
                    : null;
                yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                isConsecutive = false;
                newStreakDays = 1;
                if (lastLoginDate) {
                    lastLoginDateString = lastLoginDate.toISOString().split("T")[0];
                    yesterdayDateString = yesterday.toISOString().split("T")[0];
                    if (lastLoginDateString === yesterdayDateString) {
                        isConsecutive = true;
                        newStreakDays = student.streakDays + 1;
                    }
                    else if (lastLoginDateString === todayDateString) {
                        return [2 /*return*/, c.json({
                                message: "Already logged in today",
                                currentStreak: student.streakDays,
                                bonusPoints: 0,
                            })];
                    }
                    else {
                        isConsecutive = false;
                        newStreakDays = 1;
                    }
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("LoginStreak")
                        .upsert([
                        {
                            loginDate: todayDateString,
                            consecutive: isConsecutive,
                            userId: userId,
                        },
                    ], {
                        onConflict: "userId,loginDate",
                    })];
            case 3:
                loginStreakError = (_b.sent()).error;
                if (loginStreakError) {
                    console.error("Error recording login streak:", loginStreakError);
                    return [2 /*return*/, c.json({ error: "Failed to record login streak" }, 500)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .update({
                        streakDays: newStreakDays,
                        lastLogin: today.toISOString(),
                    })
                        .eq("userId", userId)];
            case 4:
                updateError = (_b.sent()).error;
                if (updateError) {
                    console.error("Error updating student streak:", updateError);
                    return [2 /*return*/, c.json({ error: "Failed to update student streak" }, 500)];
                }
                bonusPoints = 0;
                if (newStreakDays >= 7)
                    bonusPoints = 50;
                else if (newStreakDays >= 3)
                    bonusPoints = 20;
                else if (isConsecutive)
                    bonusPoints = 10;
                if (!(bonusPoints > 0)) return [3 /*break*/, 6];
                return [4 /*yield*/, supabase_1.supabase
                        .from("ClassLeaderboard")
                        .insert([
                        {
                            studentId: student.id,
                            classId: student.classId || 1,
                            points: bonusPoints,
                            updated: today.toISOString(),
                        },
                    ])];
            case 5:
                pointsError = (_b.sent()).error;
                if (pointsError) {
                    console.error("Error adding streak bonus points:", pointsError);
                }
                _b.label = 6;
            case 6: return [2 /*return*/, c.json({
                    message: "Login recorded successfully",
                    currentStreak: newStreakDays,
                    isConsecutive: isConsecutive,
                    bonusPoints: bonusPoints,
                    loginDate: todayDateString,
                })];
            case 7:
                error_1 = _b.sent();
                console.error("Error in recordLogin:", error_1);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.recordLogin = recordLogin;
var getMyStreak = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, student, studentError, thirtyDaysAgo, _b, recentLogins, loginsError, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("id, streakDays, lastLogin, user:User(username, fullName)")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _c.sent(), student = _a.data, studentError = _a.error;
                if (studentError || !student) {
                    return [2 /*return*/, c.json({ error: "Student not found" }, 404)];
                }
                thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return [4 /*yield*/, supabase_1.supabase
                        .from("LoginStreak")
                        .select("loginDate, consecutive")
                        .eq("userId", userId)
                        .gte("loginDate", thirtyDaysAgo.toISOString().split("T")[0])
                        .order("loginDate", { ascending: false })];
            case 2:
                _b = _c.sent(), recentLogins = _b.data, loginsError = _b.error;
                if (loginsError) {
                    console.error("Error fetching login history:", loginsError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch login history" }, 500)];
                }
                return [2 /*return*/, c.json({
                        currentStreak: student.streakDays,
                        lastLogin: student.lastLogin,
                        user: student.user,
                        recentLogins: recentLogins || [],
                    })];
            case 3:
                error_2 = _c.sent();
                console.error("Error in getMyStreak:", error_2);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getMyStreak = getMyStreak;
var getStreakLeaderboard = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var classId, userId, student, teacher, _a, streakData, streakError, leaderboard, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                classId = c.req.param("classId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("classId")
                        .eq("userId", userId)
                        .single()];
            case 1:
                student = (_b.sent()).data;
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .single()];
            case 2:
                teacher = (_b.sent()).data;
                if (!student && !teacher) {
                    return [2 /*return*/, c.json({ error: "Access denied: Not a student or teacher" }, 403)];
                }
                if (student && student.classId.toString() !== classId) {
                    return [2 /*return*/, c.json({ error: "Access denied: Not in this class" }, 403)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("\n        id,\n        streakDays,\n        lastLogin,\n        user:User(username, fullName)\n      ")
                        .eq("classId", parseInt(classId))
                        .order("streakDays", { ascending: false })
                        .limit(50)];
            case 3:
                _a = _b.sent(), streakData = _a.data, streakError = _a.error;
                if (streakError) {
                    console.error("Error fetching streak leaderboard:", streakError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch streak leaderboard" }, 500)];
                }
                leaderboard = (streakData === null || streakData === void 0 ? void 0 : streakData.map(function (student, index) { return ({
                    rank: index + 1,
                    studentId: student.id,
                    user: student.user,
                    streakDays: student.streakDays,
                    lastLogin: student.lastLogin,
                }); })) || [];
                return [2 /*return*/, c.json(leaderboard, 200)];
            case 4:
                error_3 = _b.sent();
                console.error("Error in getStreakLeaderboard:", error_3);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getStreakLeaderboard = getStreakLeaderboard;
var getStreakStats = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, student, studentError, _b, classStats, classStatsError, streaks, totalStudents, averageStreak, maxStreak, studentsWithActiveStreaks, today, _c, todayLogins, todayError, todayLoginCount, error_4;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 4, , 5]);
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("classId")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _d.sent(), student = _a.data, studentError = _a.error;
                if (studentError || !student) {
                    return [2 /*return*/, c.json({ error: "Student not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("streakDays, userId")
                        .eq("classId", student.classId)];
            case 2:
                _b = _d.sent(), classStats = _b.data, classStatsError = _b.error;
                if (classStatsError) {
                    console.error("Error fetching class stats:", classStatsError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch class statistics" }, 500)];
                }
                streaks = (classStats === null || classStats === void 0 ? void 0 : classStats.map(function (s) { return s.streakDays; })) || [];
                totalStudents = streaks.length;
                averageStreak = totalStudents > 0
                    ? Math.round(streaks.reduce(function (sum, streak) { return sum + streak; }, 0) / totalStudents)
                    : 0;
                maxStreak = totalStudents > 0 ? Math.max.apply(Math, streaks) : 0;
                studentsWithActiveStreaks = streaks.filter(function (streak) { return streak > 0; }).length;
                today = new Date().toISOString().split("T")[0];
                return [4 /*yield*/, supabase_1.supabase
                        .from("LoginStreak")
                        .select("userId")
                        .eq("loginDate", today)
                        .in("userId", (classStats === null || classStats === void 0 ? void 0 : classStats.map(function (s) { return s.userId; })) || [])];
            case 3:
                _c = _d.sent(), todayLogins = _c.data, todayError = _c.error;
                todayLoginCount = (todayLogins === null || todayLogins === void 0 ? void 0 : todayLogins.length) || 0;
                return [2 /*return*/, c.json({
                        totalStudents: totalStudents,
                        averageStreak: averageStreak,
                        maxStreak: maxStreak,
                        studentsWithActiveStreaks: studentsWithActiveStreaks,
                        todayLoginCount: todayLoginCount,
                        activeStreakPercentage: totalStudents > 0
                            ? Math.round((studentsWithActiveStreaks / totalStudents) * 100)
                            : 0,
                    })];
            case 4:
                error_4 = _d.sent();
                console.error("Error in getStreakStats:", error_4);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getStreakStats = getStreakStats;
var getLoginHistory = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, period, userId, startDate, _b, loginHistory, historyError, error_5;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = c.req.query().period, period = _a === void 0 ? "month" : _a;
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                startDate = new Date();
                switch (period) {
                    case "week":
                        startDate.setDate(startDate.getDate() - 7);
                        break;
                    case "month":
                        startDate.setMonth(startDate.getMonth() - 1);
                        break;
                    case "year":
                        startDate.setFullYear(startDate.getFullYear() - 1);
                        break;
                    default:
                        startDate.setMonth(startDate.getMonth() - 1);
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("LoginStreak")
                        .select("loginDate, consecutive")
                        .eq("userId", userId)
                        .gte("loginDate", startDate.toISOString().split("T")[0])
                        .order("loginDate", { ascending: true })];
            case 1:
                _b = _c.sent(), loginHistory = _b.data, historyError = _b.error;
                if (historyError) {
                    console.error("Error fetching login history:", historyError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch login history" }, 500)];
                }
                return [2 /*return*/, c.json({
                        period: period,
                        startDate: startDate.toISOString().split("T")[0],
                        endDate: new Date().toISOString().split("T")[0],
                        loginHistory: loginHistory || [],
                        totalLogins: (loginHistory === null || loginHistory === void 0 ? void 0 : loginHistory.length) || 0,
                        consecutiveLogins: (loginHistory === null || loginHistory === void 0 ? void 0 : loginHistory.filter(function (login) { return login.consecutive; }).length) || 0,
                    })];
            case 2:
                error_5 = _c.sent();
                console.error("Error in getLoginHistory:", error_5);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getLoginHistory = getLoginHistory;
