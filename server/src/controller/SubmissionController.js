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
exports.regenerateAIFeedback = exports.getSubmissionById = exports.createSubmission = void 0;
var supabase_1 = require("../utils/supabase");
var OpenAI_1 = require("../utils/OpenAI");
var auth_1 = require("../utils/auth");
var dotenv = require("dotenv");
dotenv.config();
var createSubmission = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, content, assignmentId, studentId, userId, _b, student, studentError, _c, assignment, assignmentError, existingSubmission, _d, newSubmission, submissionError, error_1;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 6, , 7]);
                return [4 /*yield*/, c.req.json()];
            case 1:
                _a = _e.sent(), content = _a.content, assignmentId = _a.assignmentId, studentId = _a.studentId;
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                if (!content || !assignmentId || !studentId) {
                    return [2 /*return*/, c.json({ error: "Content, assignmentId, and studentId are required" }, 400)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("userId")
                        .eq("id", studentId)
                        .single()];
            case 2:
                _b = _e.sent(), student = _b.data, studentError = _b.error;
                if (studentError || student.userId !== userId) {
                    return [2 /*return*/, c.json({ error: "Access denied: Invalid student ID" }, 403)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Assignment")
                        .select("id, title, description")
                        .eq("id", assignmentId)
                        .single()];
            case 3:
                _c = _e.sent(), assignment = _c.data, assignmentError = _c.error;
                if (assignmentError) {
                    return [2 /*return*/, c.json({ error: "Assignment not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Submission")
                        .select("id")
                        .eq("studentId", studentId)
                        .eq("assignmentId", assignmentId)
                        .single()];
            case 4:
                existingSubmission = (_e.sent()).data;
                if (existingSubmission) {
                    return [2 /*return*/, c.json({ error: "You have already submitted this assignment" }, 400)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Submission")
                        .insert([
                        {
                            content: content,
                            studentId: studentId,
                            assignmentId: assignmentId,
                            submittedAt: new Date().toISOString(),
                            aiFeedback: null,
                            aiScore: null,
                            feedbackGeneratedAt: null,
                        },
                    ])
                        .select()
                        .single()];
            case 5:
                _d = _e.sent(), newSubmission = _d.data, submissionError = _d.error;
                if (submissionError) {
                    console.error("Error creating submission:", submissionError);
                    return [2 /*return*/, c.json({ error: "Failed to create submission" }, 500)];
                }
                generateAIFeedback(newSubmission.id, content, assignment.title, assignment.description);
                return [2 /*return*/, c.json({
                        message: "Submission created successfully",
                        submission: newSubmission,
                    }, 201)];
            case 6:
                error_1 = _e.sent();
                console.error("Error creating submission:", error_1);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.createSubmission = createSubmission;
var generateAIFeedback = function (submissionId, content, assignmentTitle, assignmentDescription) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, score, feedback, updateError, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 6]);
                console.log("Generating AI feedback for submission ".concat(submissionId, "..."));
                return [4 /*yield*/, (0, OpenAI_1.gradeSubmission)(content, assignmentTitle, assignmentDescription)];
            case 1:
                _a = _b.sent(), score = _a.score, feedback = _a.feedback;
                return [4 /*yield*/, supabase_1.supabase
                        .from("Submission")
                        .update({
                        aiFeedback: feedback,
                        aiScore: score,
                        feedbackGeneratedAt: new Date().toISOString(),
                    })
                        .eq("id", submissionId)];
            case 2:
                updateError = (_b.sent()).error;
                if (updateError) {
                    console.error("Error updating submission with AI feedback:", updateError);
                    return [2 /*return*/];
                }
                console.log("AI feedback generated successfully for submission ".concat(submissionId, ". Score: ").concat(score));
                return [4 /*yield*/, awardPointsForSubmission(submissionId, score)];
            case 3:
                _b.sent();
                return [3 /*break*/, 6];
            case 4:
                error_2 = _b.sent();
                console.error("Error generating AI feedback:", error_2);
                return [4 /*yield*/, supabase_1.supabase
                        .from("Submission")
                        .update({
                        aiFeedback: "Unable to generate AI feedback at this time. Please contact your teacher for manual grading.",
                        aiScore: null,
                        feedbackGeneratedAt: new Date().toISOString(),
                    })
                        .eq("id", submissionId)];
            case 5:
                _b.sent();
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
var awardPointsForSubmission = function (submissionId, aiScore) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, submission, submissionError, points, pointsError, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                return [4 /*yield*/, supabase_1.supabase
                        .from("Submission")
                        .select("\n        studentId,\n        student:Student(\n          classId\n        )\n      ")
                        .eq("id", submissionId)
                        .single()];
            case 1:
                _a = _b.sent(), submission = _a.data, submissionError = _a.error;
                if (submissionError || !submission) {
                    console.error("Error fetching submission for points award:", submissionError);
                    return [2 /*return*/];
                }
                points = Math.max(0, Math.round(aiScore));
                console.log("Calculating points for submission ".concat(submissionId, ": AI Score: ").concat(aiScore, ", Total Points: ").concat(points));
                return [4 /*yield*/, supabase_1.supabase
                        .from("ClassLeaderboard")
                        .insert([
                        {
                            studentId: submission.studentId,
                            classId: submission.student.classId,
                            points: points,
                            updated: new Date().toISOString(),
                        },
                    ])];
            case 2:
                pointsError = (_b.sent()).error;
                if (pointsError) {
                    console.error("Error awarding points:", pointsError);
                }
                else {
                    console.log("Awarded ".concat(points, " points to student ").concat(submission.studentId, " for submission ").concat(submissionId, " (AI Score: ").concat(aiScore, ")"));
                }
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                console.error("Error in awardPointsForSubmission:", error_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var getSubmissionById = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var submissionId, userId, _a, submission, submissionError, student, teacher, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                submissionId = c.req.param("submissionId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Submission")
                        .select("\n        id,\n        content,\n        submittedAt,\n        aiFeedback,\n        aiScore,\n        feedbackGeneratedAt,\n        studentId,\n        assignmentId,\n        student:Student(\n          id,\n          user:User(username, fullName)\n        ),\n        assignment:Assignment(\n          id,\n          title,\n          description,\n          dueDate\n        )\n      ")
                        .eq("id", submissionId)
                        .single()];
            case 1:
                _a = _b.sent(), submission = _a.data, submissionError = _a.error;
                if (submissionError) {
                    return [2 /*return*/, c.json({ error: "Submission not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("userId")
                        .eq("id", submission.studentId)
                        .single()];
            case 2:
                student = (_b.sent()).data;
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .single()];
            case 3:
                teacher = (_b.sent()).data;
                if ((student === null || student === void 0 ? void 0 : student.userId) !== userId && !teacher) {
                    return [2 /*return*/, c.json({ error: "Access denied" }, 403)];
                }
                return [2 /*return*/, c.json(submission, 200)];
            case 4:
                error_4 = _b.sent();
                console.error("Error fetching submission:", error_4);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getSubmissionById = getSubmissionById;
var regenerateAIFeedback = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    var submissionId, userId, _a, submission, submissionError, student, teacher, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                submissionId = c.req.param("submissionId");
                userId = (0, auth_1.getUserIdFromToken)(c);
                if (!userId) {
                    return [2 /*return*/, c.json({ error: "Unauthorized: Invalid token" }, 401)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Submission")
                        .select("\n        id,\n        content,\n        studentId,\n        assignment:Assignment(title, description)\n      ")
                        .eq("id", submissionId)
                        .single()];
            case 1:
                _a = _b.sent(), submission = _a.data, submissionError = _a.error;
                if (submissionError) {
                    return [2 /*return*/, c.json({ error: "Submission not found" }, 404)];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from("Student")
                        .select("userId")
                        .eq("id", submission.studentId)
                        .single()];
            case 2:
                student = (_b.sent()).data;
                return [4 /*yield*/, supabase_1.supabase
                        .from("Teacher")
                        .select("id")
                        .eq("userId", userId)
                        .single()];
            case 3:
                teacher = (_b.sent()).data;
                if ((student === null || student === void 0 ? void 0 : student.userId) !== userId && !teacher) {
                    return [2 /*return*/, c.json({ error: "Access denied" }, 403)];
                }
                return [4 /*yield*/, generateAIFeedback(submission.id, submission.content, submission.assignment.title, submission.assignment.description)];
            case 4:
                _b.sent();
                return [2 /*return*/, c.json({
                        message: "AI feedback regeneration initiated",
                        submissionId: submission.id,
                    }, 200)];
            case 5:
                error_5 = _b.sent();
                console.error("Error regenerating AI feedback:", error_5);
                return [2 /*return*/, c.json({ error: "Internal server error" }, 500)];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.regenerateAIFeedback = regenerateAIFeedback;
