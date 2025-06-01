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
exports.gradeSubmission = void 0;
var openai_1 = require("openai");
var dotenv = require("dotenv");
dotenv.config();
var openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
var gradeSubmission = function (content, assignmentTitle, assignmentDescription) { return __awaiter(void 0, void 0, void 0, function () {
    var prompt_1, completion, response, gradingResult, score, error_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                prompt_1 = "\nYou are an experienced English teacher grading a student submission. Please evaluate the following submission and provide:\n\n1. A score from 0-100\n2. Detailed, constructive feedback\n\nAssignment: ".concat(assignmentTitle, "\n").concat(assignmentDescription ? "Description: ".concat(assignmentDescription) : "", "\n\nStudent Submission:\n\"").concat(content, "\"\n\nEvaluation Criteria:\n- Content relevance and understanding (25%)\n- Writing clarity and organization (25%)\n- Grammar and mechanics (25%)\n- Depth of analysis/creativity (25%)\n\nPlease respond in the following JSON format:\n{\n  \"score\": [number between 0-100],\n  \"feedback\": \"[detailed constructive feedback explaining the score and providing specific suggestions for improvement]\"\n}\n\nMake your feedback encouraging yet honest, highlighting both strengths and areas for improvement.\n");
                return [4 /*yield*/, openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            {
                                role: "system",
                                content: "You are a helpful English teacher who provides constructive feedback on student writing. Always respond with valid JSON format.",
                            },
                            {
                                role: "user",
                                content: prompt_1,
                            },
                        ],
                        temperature: 0.7,
                        max_tokens: 1000,
                    })];
            case 1:
                completion = _c.sent();
                response = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
                if (!response) {
                    throw new Error("No response from OpenAI");
                }
                gradingResult = JSON.parse(response.trim());
                if (typeof gradingResult.score !== "number" ||
                    typeof gradingResult.feedback !== "string") {
                    throw new Error("Invalid response format from OpenAI");
                }
                score = Math.max(0, Math.min(100, Math.round(gradingResult.score)));
                return [2 /*return*/, {
                        score: score,
                        feedback: gradingResult.feedback,
                    }];
            case 2:
                error_1 = _c.sent();
                console.error("Error grading submission with OpenAI:", error_1);
                return [2 /*return*/, fallbackGrading(content, assignmentTitle)];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.gradeSubmission = gradeSubmission;
var fallbackGrading = function (content, assignmentTitle) {
    var wordCount = content.trim().split(/\s+/).length;
    var score = 70;
    var feedback = "";
    if (wordCount >= 200)
        score += 15;
    else if (wordCount >= 100)
        score += 10;
    else if (wordCount >= 50)
        score += 5;
    if (content.includes(".") && content.includes(","))
        score += 5;
    if (content.split(".").length > 3)
        score += 5;
    if (/[A-Z]/.test(content) && /[a-z]/.test(content))
        score += 5;
    score = Math.min(100, score);
    if (assignmentTitle.toLowerCase().includes("essay")) {
        feedback = "Your essay demonstrates understanding of the topic. ".concat(wordCount >= 200
            ? "You've met the length requirement well."
            : "Consider expanding your analysis with more examples.", " ").concat(score > 85
            ? "Excellent work on structure and analysis!"
            : score > 70
                ? "Good effort! Consider adding more specific examples and deeper analysis."
                : "You've made a good start. Try to develop your arguments more thoroughly.");
    }
    else if (assignmentTitle.toLowerCase().includes("creative")) {
        feedback = "Your creative piece shows imagination and effort. ".concat(content.includes('"')
            ? "Good use of dialogue!"
            : "Consider adding dialogue to bring characters to life.", " ").concat(score > 85
            ? "Excellent character development and narrative flow!"
            : score > 70
                ? "Nice creative approach! Consider adding more descriptive details."
                : "Creative start! Try to develop the scene and characters more fully.");
    }
    else {
        feedback = "Your submission shows good effort and understanding. ".concat(score > 85
            ? "Excellent work - clear, well-organized, and thoughtful!"
            : score > 70
                ? "Good job! Consider adding more detail to strengthen your response."
                : "You're on the right track. Try to expand your ideas with more examples.");
    }
    return { score: score, feedback: feedback };
};
