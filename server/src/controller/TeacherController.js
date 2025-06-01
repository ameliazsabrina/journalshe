"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.getSchoolClasses = exports.deleteTeacherClass = exports.editTeacherClass = exports.getCurrentTeacherClasses = exports.getTeacherClasses = exports.getTeacherStats = exports.getAssignmentWithSubmissions = exports.getTeacherAssignments = exports.getTeacherById = exports.getCurrentTeacher = void 0;
var supabase_1 = require("../utils/supabase");
var auth_1 = require("../utils/auth");
var getCurrentTeacher = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, teacher, teacherError, _b, teacherClasses, teacherClassesError, userProfile, error_1;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("\n        id,\n        schoolId,\n        school:School(\n          id,\n          name,\n          address\n        ),\n        user:User(\n          id,\n          username,\n          fullName,\n          email,\n          role:Role(name)\n        )\n      ")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _d.sent(), teacher = _a.data, teacherError = _a.error;
                if (teacherError || !teacher) {
                    return [2 /*return*/, c.json({ error: "Teacher not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("TeacherClass")
                        .select("\n        classId,\n        class:Class(\n          id,\n          name\n        )\n      ")
                        .eq("teacherId", teacher.id)];
            case 2:
                _b = _d.sent(), teacherClasses = _b.data, teacherClassesError = _b.error;
                if (teacherClassesError) {
                    console.error("Error fetching teacher classes:", teacherClassesError);
                }
                userProfile = {
                    id: teacher.user.id,
                    username: teacher.user.username,
                    fullName: teacher.user.fullName,
                    email: teacher.user.email,
                    role: ((_c = teacher.user.role) === null || _c === void 0 ? void 0 : _c.name) || "Teacher",
                    school: teacher.school
                        ? {
                            id: teacher.school.id,
                            name: teacher.school.name,
                            address: teacher.school.address,
                        }
                        : undefined,
                    classes: (teacherClasses === null || teacherClasses === void 0 ? void 0 : teacherClasses.map(function (tc) {
                        var _a;
                        return ({
                            id: tc.classId,
                            name: ((_a = tc.class) === null || _a === void 0 ? void 0 : _a.name) || "Class ".concat(tc.classId),
                        });
                    })) || [],
                };
                return [2 /*return*/, c.json({ user: userProfile }, 200)];
            case 3:
                error_1 = _d.sent();
                console.error("Error fetching current teacher:", error_1);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getCurrentTeacher = getCurrentTeacher;
var getTeacherById = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var teacherId, userId, _a, teacher, teacherError, teacherClasses, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                teacherId = c.req.param("teacherId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("\n        id,\n        school:School(\n          id,\n          name\n        ),\n        user:User(\n          id,\n          username,\n          fullName,\n          email\n        )\n      ")
                        .eq("id", teacherId)
                        .single()];
            case 1:
                _a = _b.sent(), teacher = _a.data, teacherError = _a.error;
                return [4 /*yield*/, supabase_1.supabase
                        .from("TeacherClass")
                        .select("classId")
                        .eq("teacherId", teacherId)];
            case 2:
                teacherClasses = (_b.sent()).data;
                if (teacherError || !teacher) {
                    return [2 /*return*/, c.json({ error: "Teacher not found" }, 404)];
                }
                return [2 /*return*/, c.json({ teacher: teacher, teacherClasses: teacherClasses }, 200)];
            case 3:
                error_2 = _b.sent();
                console.error("Error fetching teacher:", error_2);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getTeacherById = getTeacherById;
var getTeacherAssignments = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, teacher_1, teacherError, _b, assignments, assignmentsError, assignmentsWithStats, error_3;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _c.sent(), teacher_1 = _a.data, teacherError = _a.error;
                if (teacherError || !teacher_1) {
                    return [2 /*return*/, c.json({ error: "Teacher not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .select("\n        id,\n        title,\n        description,\n        dueDate,\n        createdAt,\n        teacherId\n      ")
                        .eq("teacherId", teacher_1.id)
                        .order("createdAt", { ascending: false })];
            case 2:
                _b = _c.sent(), assignments = _b.data, assignmentsError = _b.error;
                if (assignmentsError) {
                    console.error("Error fetching assignments:", assignmentsError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch assignments" }, 500)];
                }
                return [4 /*yield*/, Promise.all(assignments.map(function (assignment) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, submissionCount, submissionCountError, _b, submissions, submissionsError, _c, assignmentClasses, assignmentClassesError, totalStudents, classIds, _d, studentsCount, studentsCountError, _e, teacherClasses, teacherClassesError, classIds, _f, studentsCount, studentsCountError;
                        return __generator(this, function (_g) {
                            switch (_g.label) {
                                case 0: return [4 /*yield*/, supabase_1.supabase
                                        .from("Submission")
                                        .select("*", { count: "exact", head: true })
                                        .eq("assignmentId", assignment.id)];
                                case 1:
                                    _a = _g.sent(), submissionCount = _a.count, submissionCountError = _a.error;
                                    if (submissionCountError) {
                                        console.error("Error counting submissions:", submissionCountError);
                                    }
                                    return [4 /*yield*/, supabase_1.supabase
                                            .from("Submission")
                                            .select("studentId")
                                            .eq("assignmentId", assignment.id)];
                                case 2:
                                    _b = _g.sent(), submissions = _b.data, submissionsError = _b.error;
                                    return [4 /*yield*/, supabase_1.supabase
                                            .from("AssignmentClass")
                                            .select("classId")
                                            .eq("assignmentId", assignment.id)];
                                case 3:
                                    _c = _g.sent(), assignmentClasses = _c.data, assignmentClassesError = _c.error;
                                    totalStudents = 0;
                                    if (!(!assignmentClassesError &&
                                        assignmentClasses &&
                                        assignmentClasses.length > 0)) return [3 /*break*/, 5];
                                    classIds = assignmentClasses.map(function (ac) { return ac.classId; });
                                    return [4 /*yield*/, supabase_1.supabase
                                            .from("Student")
                                            .select("*", { count: "exact", head: true })
                                            .in("classId", classIds)];
                                case 4:
                                    _d = _g.sent(), studentsCount = _d.count, studentsCountError = _d.error;
                                    if (!studentsCountError) {
                                        totalStudents = studentsCount || 0;
                                    }
                                    return [3 /*break*/, 8];
                                case 5: return [4 /*yield*/, supabase_1.supabase
                                        .from("TeacherClass")
                                        .select("classId")
                                        .eq("teacherId", teacher_1.id)];
                                case 6:
                                    _e = _g.sent(), teacherClasses = _e.data, teacherClassesError = _e.error;
                                    if (!(!teacherClassesError &&
                                        teacherClasses &&
                                        teacherClasses.length > 0)) return [3 /*break*/, 8];
                                    classIds = teacherClasses.map(function (tc) { return tc.classId; });
                                    return [4 /*yield*/, supabase_1.supabase
                                            .from("Student")
                                            .select("*", { count: "exact", head: true })
                                            .in("classId", classIds)];
                                case 7:
                                    _f = _g.sent(), studentsCount = _f.count, studentsCountError = _f.error;
                                    if (!studentsCountError) {
                                        totalStudents = studentsCount || 0;
                                    }
                                    _g.label = 8;
                                case 8: return [2 /*return*/, __assign(__assign({}, assignment), { submissionCount: submissionCount || 0, totalStudents: totalStudents, pointsPossible: 100 })];
                            }
                        });
                    }); }))];
            case 3:
                assignmentsWithStats = _c.sent();
                return [2 /*return*/, c.json(assignmentsWithStats, 200)];
            case 4:
                error_3 = _c.sent();
                console.error("Error in getTeacherAssignments:", error_3);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getTeacherAssignments = getTeacherAssignments;
var getAssignmentWithSubmissions = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var assignmentId, userId, _a, teacher, teacherError, _b, assignment, assignmentError, _c, submissions, submissionsError, error_4;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 4, , 5]);
                assignmentId = c.req.param("assignmentId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _d.sent(), teacher = _a.data, teacherError = _a.error;
                if (teacherError || !teacher) {
                    return [2 /*return*/, c.json({ error: "Teacher not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .select("\n        id,\n        title,\n        description,\n        dueDate,\n        createdAt,\n        teacherId\n      ")
                        .eq("id", assignmentId)
                        .eq("teacherId", teacher.id)
                        .single()];
            case 2:
                _b = _d.sent(), assignment = _b.data, assignmentError = _b.error;
                if (assignmentError || !assignment) {
                    return [2 /*return*/, c.json({ error: "Assignment not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Submission")
                        .select("\n        id,\n        content,\n        submittedAt,\n        aiFeedback,\n        aiScore,\n        feedbackGeneratedAt,\n        studentId,\n        student:Student(\n          id,\n          user:User(username, fullName)\n        )\n      ")
                        .eq("assignmentId", assignmentId)
                        .order("submittedAt", { ascending: false })];
            case 3:
                _c = _d.sent(), submissions = _c.data, submissionsError = _c.error;
                if (submissionsError) {
                    console.error("Error fetching submissions:", submissionsError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch submissions" }, 500)];
                }
                return [2 /*return*/, c.json({
                        assignment: assignment,
                        submissions: submissions || [],
                        submissionCount: (submissions === null || submissions === void 0 ? void 0 : submissions.length) || 0,
                    })];
            case 4:
                error_4 = _d.sent();
                console.error("Error in getAssignmentWithSubmissions:", error_4);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getAssignmentWithSubmissions = getAssignmentWithSubmissions;
var getTeacherStats = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, teacher, teacherError, _b, assignmentsCount, assignmentsCountError, _c, teacherAssignments, teacherAssignmentsError, totalSubmissions, assignmentIds, _d, submissionsCount, submissionsCountError, threeDaysFromNow, _e, dueSoonCount, dueSoonError, error_5;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 7, , 8]);
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _f.sent(), teacher = _a.data, teacherError = _a.error;
                if (teacherError || !teacher) {
                    return [2 /*return*/, c.json({ error: "Teacher not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .select("*", { count: "exact", head: true })
                        .eq("teacherId", teacher.id)];
            case 2:
                _b = _f.sent(), assignmentsCount = _b.count, assignmentsCountError = _b.error;
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .select("id")
                        .eq("teacherId", teacher.id)];
            case 3:
                _c = _f.sent(), teacherAssignments = _c.data, teacherAssignmentsError = _c.error;
                totalSubmissions = 0;
                if (!(!teacherAssignmentsError && teacherAssignments)) return [3 /*break*/, 5];
                assignmentIds = teacherAssignments.map(function (a) { return a.id; });
                if (!(assignmentIds.length > 0)) return [3 /*break*/, 5];
                return [4 /*yield*/, supabase_1.supabase
                        .from("Submission")
                        .select("*", { count: "exact", head: true })
                        .in("assignmentId", assignmentIds)];
            case 4:
                _d = _f.sent(), submissionsCount = _d.count, submissionsCountError = _d.error;
                if (!submissionsCountError) {
                    totalSubmissions = submissionsCount || 0;
                }
                _f.label = 5;
            case 5:
                threeDaysFromNow = new Date();
                threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .select("*", { count: "exact", head: true })
                        .eq("teacherId", teacher.id)
                        .lte("dueDate", threeDaysFromNow.toISOString())
                        .gte("dueDate", new Date().toISOString())];
            case 6:
                _e = _f.sent(), dueSoonCount = _e.count, dueSoonError = _e.error;
                return [2 /*return*/, c.json({
                        totalAssignments: assignmentsCount || 0,
                        totalSubmissions: totalSubmissions,
                        assignmentsDueSoon: dueSoonCount || 0,
                        averageCompletionRate: totalSubmissions > 0
                            ? Math.round((totalSubmissions / (assignmentsCount || 1)) * 100)
                            : 0,
                    })];
            case 7:
                error_5 = _f.sent();
                console.error("Error in getTeacherStats:", error_5);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.getTeacherStats = getTeacherStats;
var getTeacherClasses = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var teacherId, userId, _a, teacher, teacherError, _b, teacherClasses, teacherClassesError, classes, error_6;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                teacherId = c.req.param("teacherId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _c.sent(), teacher = _a.data, teacherError = _a.error;
                if (teacherError || !teacher) {
                    return [2 /*return*/, c.json({ error: "Teacher not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("TeacherClass")
                        .select("\n        classId,\n        class:Class(\n          id,\n          name\n        )\n      ")
                        .eq("teacherId", teacherId)];
            case 2:
                _b = _c.sent(), teacherClasses = _b.data, teacherClassesError = _b.error;
                if (teacherClassesError) {
                    console.error("Error fetching teacher classes:", teacherClassesError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch teacher classes" }, 500)];
                }
                classes = (teacherClasses === null || teacherClasses === void 0 ? void 0 : teacherClasses.map(function (tc) {
                    var _a;
                    return ({
                        id: tc.classId,
                        name: ((_a = tc.class) === null || _a === void 0 ? void 0 : _a.name) || "Class ".concat(tc.classId),
                    });
                })) || [];
                return [2 /*return*/, c.json(classes, 200)];
            case 3:
                error_6 = _c.sent();
                console.error("Error in getTeacherClasses:", error_6);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getTeacherClasses = getTeacherClasses;
var getCurrentTeacherClasses = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, teacher, teacherError, _b, teacherClasses, teacherClassesError, classes, error_7;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _c.sent(), teacher = _a.data, teacherError = _a.error;
                if (teacherError || !teacher) {
                    return [2 /*return*/, c.json({ error: "Teacher not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("TeacherClass")
                        .select("\n        classId,\n        class:Class(\n          id,\n          name\n        )\n      ")
                        .eq("teacherId", teacher.id)];
            case 2:
                _b = _c.sent(), teacherClasses = _b.data, teacherClassesError = _b.error;
                if (teacherClassesError) {
                    console.error("Error fetching teacher classes:", teacherClassesError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch teacher classes" }, 500)];
                }
                classes = (teacherClasses === null || teacherClasses === void 0 ? void 0 : teacherClasses.map(function (tc) {
                    var _a;
                    return ({
                        id: tc.classId,
                        name: ((_a = tc.class) === null || _a === void 0 ? void 0 : _a.name) || "Class ".concat(tc.classId),
                    });
                })) || [];
                return [2 /*return*/, c.json(classes, 200)];
            case 3:
                error_7 = _c.sent();
                console.error("Error in getCurrentTeacherClasses:", error_7);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getCurrentTeacherClasses = getCurrentTeacherClasses;
var editTeacherClass = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var classIds, userId, _a, teacher_2, teacherError, deleteError, teacherClassInserts, insertError, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                return [4 /*yield*/, c.req.json()];
            case 1:
                classIds = (_b.sent()).classIds;
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .single()];
            case 2:
                _a = _b.sent(), teacher_2 = _a.data, teacherError = _a.error;
                if (teacherError || !teacher_2) {
                    return [2 /*return*/, c.json({ error: "Teacher not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("TeacherClass")
                        .delete()
                        .eq("teacherId", teacher_2.id)];
            case 3:
                deleteError = (_b.sent()).error;
                if (deleteError) {
                    console.error("Error deleting existing teacher classes:", deleteError);
                    return [2 /*return*/, c.json({ error: "Failed to update teacher classes" }, 500)];
                }
                if (!(classIds && classIds.length > 0)) return [3 /*break*/, 5];
                teacherClassInserts = classIds.map(function (classId) { return ({
                    teacherId: teacher_2.id,
                    classId: classId,
                }); });
                return [4 /*yield*/, supabase_1.supabase
                        .from("TeacherClass")
                        .insert(teacherClassInserts)];
            case 4:
                insertError = (_b.sent()).error;
                if (insertError) {
                    console.error("Error inserting teacher classes:", insertError);
                    return [2 /*return*/, c.json({ error: "Failed to update teacher classes" }, 500)];
                }
                _b.label = 5;
            case 5: return [2 /*return*/, c.json({ message: "Teacher classes updated successfully" }, 200)];
            case 6:
                error_8 = _b.sent();
                console.error("Error in editTeacherClass:", error_8);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.editTeacherClass = editTeacherClass;
var deleteTeacherClass = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var classId, userId, _a, teacher, teacherError, deleteError, error_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                classId = c.req.param("classId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _b.sent(), teacher = _a.data, teacherError = _a.error;
                if (teacherError || !teacher) {
                    return [2 /*return*/, c.json({ error: "Teacher not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("TeacherClass")
                        .delete()
                        .eq("teacherId", teacher.id)
                        .eq("classId", classId)];
            case 2:
                deleteError = (_b.sent()).error;
                if (deleteError) {
                    console.error("Error deleting teacher class:", deleteError);
                    return [2 /*return*/, c.json({ error: "Failed to delete teacher class" }, 500)];
                }
                return [2 /*return*/, c.json({ message: "Teacher class deleted successfully" }, 200)];
            case 3:
                error_9 = _b.sent();
                console.error("Error in deleteTeacherClass:", error_9);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deleteTeacherClass = deleteTeacherClass;
var getSchoolClasses = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, teacher, teacherError, _b, schoolClasses, schoolClassesError, _c, teacherClasses, teacherClassesError, assignedClassIds, error_10;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 4, , 5]);
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("\n        id,\n        schoolId,\n        school:School(\n          id,\n          name,\n          address\n        )\n      ")
                        .eq("userId", userId)
                        .single()];
            case 1:
                _a = _d.sent(), teacher = _a.data, teacherError = _a.error;
                if (teacherError || !teacher) {
                    return [2 /*return*/, c.json({ error: "Teacher not found" }, 404)];
                }
                if (!teacher.schoolId) {
                    return [2 /*return*/, c.json({ classes: [], school: null }, 200)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Class")
                        .select("id, name")
                        .eq("schoolId", teacher.schoolId)
                        .order("name")];
            case 2:
                _b = _d.sent(), schoolClasses = _b.data, schoolClassesError = _b.error;
                if (schoolClassesError) {
                    console.error("Error fetching school classes:", schoolClassesError);
                    return [2 /*return*/, c.json({ error: "Failed to fetch school classes" }, 500)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("TeacherClass")
                        .select("classId")
                        .eq("teacherId", teacher.id)];
            case 3:
                _c = _d.sent(), teacherClasses = _c.data, teacherClassesError = _c.error;
                if (teacherClassesError) {
                    console.error("Error fetching teacher classes:", teacherClassesError);
                }
                assignedClassIds = (teacherClasses === null || teacherClasses === void 0 ? void 0 : teacherClasses.map(function (tc) { return tc.classId; })) || [];
                return [2 /*return*/, c.json({
                        classes: schoolClasses || [],
                        assignedClassIds: assignedClassIds,
                        school: teacher.school,
                    })];
            case 4:
                error_10 = _d.sent();
                console.error("Error in getSchoolClasses:", error_10);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getSchoolClasses = getSchoolClasses;
