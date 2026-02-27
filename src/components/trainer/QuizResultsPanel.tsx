import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, Shield, Clock, Target, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { sampleBankQuestions, type BankQuestion } from "@/data/questionBankData";

export interface MockQuizResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  passScore: number;
  passed: boolean;
  timeTaken: string;
  violations: number;
  violationLog: { time: string; type: string; detail: string }[];
  answers: {
    questionId: string;
    question: string;
    type: "single" | "multiple";
    options: string[];
    learnerAnswers: number[];
    correctAnswers: number[];
    isCorrect: boolean;
  }[];
}

/** Generate a realistic mock quiz result from the question bank */
export function generateMockQuizResult(unitCode: string): MockQuizResult {
  const questions = sampleBankQuestions.slice(0, 25);
  const correctCount = 19; // 76% — close to pass threshold for realism

  const answers = questions.map((q, i) => {
    const isCorrect = i < correctCount;
    // Simulate learner picking wrong answers for incorrect ones
    const learnerAnswers = isCorrect
      ? q.correctAnswers
      : q.correctAnswers.map((a) => (a + 1) % q.options.length);

    return {
      questionId: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      learnerAnswers,
      correctAnswers: q.correctAnswers,
      isCorrect,
    };
  });

  return {
    score: 76,
    totalQuestions: 25,
    correctCount: 19,
    passScore: 80,
    passed: false,
    timeTaken: "32:15",
    violations: 1,
    violationLog: [
      { time: "12:34", type: "Tab Switch", detail: "Learner switched away from the quiz window for 3 seconds" },
    ],
    answers,
  };
}

interface QuizResultsPanelProps {
  unitCode: string;
}

const QuizResultsPanel = ({ unitCode }: QuizResultsPanelProps) => {
  const result = generateMockQuizResult(unitCode);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showViolations, setShowViolations] = useState(false);

  const scoreColor = result.passed ? "text-green-600" : "text-destructive";

  return (
    <div className="space-y-4">
      {/* Score Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 text-center">
          <Target className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className={`text-2xl font-bold ${scoreColor}`}>{result.score}%</p>
          <p className="text-xs text-muted-foreground">Score</p>
        </Card>
        <Card className="p-3 text-center">
          <BarChart3 className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-2xl font-bold text-foreground">{result.correctCount}/{result.totalQuestions}</p>
          <p className="text-xs text-muted-foreground">Correct</p>
        </Card>
        <Card className="p-3 text-center">
          <CheckCircle2 className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-2xl font-bold text-foreground">{result.passScore}%</p>
          <p className="text-xs text-muted-foreground">Pass Mark</p>
        </Card>
        <Card className="p-3 text-center">
          <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-2xl font-bold text-foreground">{result.timeTaken}</p>
          <p className="text-xs text-muted-foreground">Time Taken</p>
        </Card>
        <Card className="p-3 text-center">
          <Shield className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className={`text-2xl font-bold ${result.violations > 0 ? "text-amber-600" : "text-green-600"}`}>
            {result.violations}
          </p>
          <p className="text-xs text-muted-foreground">Violations</p>
        </Card>
      </div>

      {/* Pass/Fail Banner */}
      <div className={`rounded-xl p-3 flex items-center gap-3 ${result.passed ? "bg-green-50 border border-green-200" : "bg-destructive/5 border border-destructive/20"}`}>
        {result.passed ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
        )}
        <div>
          <p className={`font-semibold text-sm ${result.passed ? "text-green-700" : "text-destructive"}`}>
            {result.passed ? "PASSED" : "FAILED"} — {result.score}% (Pass mark: {result.passScore}%)
          </p>
          <p className="text-xs text-muted-foreground">
            {result.passed ? "Learner met the required standard." : `Learner needs ${result.passScore - result.score}% more to pass.`}
          </p>
        </div>
      </div>

      {/* Score Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Score Progress</span>
          <span>{result.score}% / {result.passScore}% required</span>
        </div>
        <div className="relative">
          <Progress value={result.score} className="h-3" />
          <div
            className="absolute top-0 h-3 border-r-2 border-dashed border-foreground/40"
            style={{ left: `${result.passScore}%` }}
            title={`Pass mark: ${result.passScore}%`}
          />
        </div>
      </div>

      {/* Violation Log */}
      {result.violations > 0 && (
        <div>
          <button
            onClick={() => setShowViolations(!showViolations)}
            className="flex items-center gap-2 text-sm font-semibold text-amber-700 hover:underline"
          >
            <AlertTriangle className="w-4 h-4" />
            {result.violations} Integrity Violation{result.violations > 1 ? "s" : ""} Detected
            {showViolations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showViolations && (
            <div className="mt-2 space-y-2">
              {result.violationLog.map((v, i) => (
                <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{v.type} <span className="text-xs text-muted-foreground ml-2">at {v.time}</span></p>
                    <p className="text-xs text-muted-foreground">{v.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Per-Question Breakdown */}
      <div>
        <button
          onClick={() => setShowQuestions(!showQuestions)}
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:underline"
        >
          📝 Question-by-Question Breakdown
          {showQuestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showQuestions && (
          <div className="mt-3 space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {result.answers.map((a, idx) => (
              <Card key={a.questionId} className={`p-4 border-l-4 ${a.isCorrect ? "border-l-green-500" : "border-l-destructive"}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {a.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-2">
                      <span className="text-muted-foreground mr-1">Q{idx + 1}.</span>
                      {a.question}
                    </p>
                    <div className="space-y-1">
                      {a.options.map((opt, oi) => {
                        const isLearnerPick = a.learnerAnswers.includes(oi);
                        const isCorrectOption = a.correctAnswers.includes(oi);
                        let optClass = "text-xs px-2 py-1.5 rounded-lg ";
                        if (isCorrectOption && isLearnerPick) optClass += "bg-green-50 border border-green-300 text-green-800";
                        else if (isCorrectOption) optClass += "bg-green-50 border border-green-200 text-green-700";
                        else if (isLearnerPick) optClass += "bg-destructive/5 border border-destructive/30 text-destructive";
                        else optClass += "bg-muted/30 text-muted-foreground";

                        return (
                          <div key={oi} className={`flex items-center gap-2 ${optClass}`}>
                            {isCorrectOption && isLearnerPick && <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />}
                            {isCorrectOption && !isLearnerPick && <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />}
                            {!isCorrectOption && isLearnerPick && <XCircle className="w-3 h-3 text-destructive flex-shrink-0" />}
                            {!isCorrectOption && !isLearnerPick && <span className="w-3 h-3 flex-shrink-0" />}
                            <span>{opt}</span>
                            {isLearnerPick && <Badge variant="outline" className="text-[10px] ml-auto px-1.5 py-0">Learner</Badge>}
                            {isCorrectOption && !isLearnerPick && <Badge variant="outline" className="text-[10px] ml-auto px-1.5 py-0 border-green-400 text-green-600">Correct</Badge>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultsPanel;
