'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge, DifficultyBadge } from '@/components/Badge';
import { ScoreBar } from '@/components/ScoreBar';
import { FeedbackCard } from '@/components/FeedbackCard';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  HelpCircle,
  FileText,
  AlertTriangle,
  History,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

export default function AttemptEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.id as string;

  const [attemptData, setAttemptData] = useState<any>(null);
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttempt = useCallback(async () => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}`);
      const data = await res.json();
      if (data.success) {
        setAttemptData(data.attempt);
        setProblem(data.problem);
      } else {
        setError(data.error || 'Failed to fetch attempt');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    fetchAttempt();
  }, [fetchAttempt]);

  // Poll if status is SUBMITTED or EVALUATING
  useEffect(() => {
    if (!attemptData) return;
    const { status } = attemptData;
    if (status === 'SUBMITTED' || status === 'EVALUATING') {
      const timer = setInterval(() => {
        fetchAttempt();
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [attemptData, fetchAttempt]);

  const handleRetryEvaluation = async () => {
    setRetrying(true);
    try {
      const res = await fetch(`/api/attempts/${attemptId}/evaluate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        await fetchAttempt();
      } else {
        setError(data.error || 'Failed to retry evaluation');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRetrying(false);
    }
  };

  const handleTryAgain = async () => {
    if (!problem) return;
    try {
      const res = await fetch(`/api/problems/${problem.id}/attempts`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/problems/${problem.slug}/practice`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full" />
        <p className="font-semibold text-slate-700">Fetching attempt data...</p>
      </div>
    );
  }

  if (error || !attemptData) {
    return (
      <div className="max-w-xl mx-auto py-12 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-6 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
        <h3 className="font-bold text-lg">{error || 'Attempt not found'}</h3>
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-rose-900 underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Return to Problems
        </Link>
      </div>
    );
  }

  const { status, evaluation, submission, attemptNumber } = attemptData;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="p-2 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{problem?.title || 'LLD Problem'}</h1>
              {problem && <DifficultyBadge difficulty={problem.difficulty} />}
              <span className="text-xs bg-slate-200 text-slate-800 font-bold px-2.5 py-0.5 rounded-full">
                Attempt #{attemptNumber}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Submitted Design Evaluation & Feedback</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/history"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Attempt History</span>
          </Link>

          <button
            onClick={handleTryAgain}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again (New Attempt)</span>
          </button>
        </div>
      </div>

      {/* EVALUATING State View */}
      {(status === 'SUBMITTED' || status === 'EVALUATING') && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-sky-100 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-sky-50 border-2 border-sky-400 flex items-center justify-center">
              <Cpu className="w-8 h-8 text-sky-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-slate-900">Your design is being evaluated...</h2>
            <p className="text-slate-500 text-sm">
              Our evaluation engine is analyzing your responsibility allocations, coupling, abstractions, and trade-off explanations.
            </p>
          </div>
          <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200">
            <StatusBadge status={status} />
            <span>Status updates automatically</span>
          </div>
        </div>
      )}

      {/* FAILED State View */}
      {status === 'FAILED' && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-4 max-w-2xl mx-auto">
          <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="text-xl font-bold text-rose-900">We couldn't evaluate your design.</h2>
          <p className="text-rose-800 text-sm max-w-lg mx-auto">
            Your submission has been safely persisted and saved. You can retry evaluation now without re-entering your submission.
          </p>
          <button
            onClick={handleRetryEvaluation}
            disabled={retrying}
            className="inline-flex items-center space-x-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            {retrying ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Retrying...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Retry Evaluation</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* COMPLETED State View */}
      {status === 'COMPLETED' && evaluation && (
        <div className="space-y-8">
          {/* Top Score Summary Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 bg-sky-500/20 border border-sky-400/30 px-3 py-1 rounded-full text-sky-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluator Engine: {evaluation.evaluatorType}</span>
              </div>
              <h2 className="text-2xl font-bold">Overall Design Quality Score</h2>
              <p className="text-slate-300 text-sm">
                Evaluated against requirement coverage, single responsibility, coupling, abstractions, and trade-offs.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center min-w-[160px]">
              <div className="text-4xl font-extrabold text-white flex items-center justify-center">
                <span>{evaluation.overallScore.toFixed(1)}</span>
                <span className="text-xl text-slate-300 font-normal ml-1">/ 10</span>
              </div>
              <span className="text-xs font-medium text-sky-200 mt-1 block">Structured Rating</span>
            </div>
          </div>

          {/* Section 1: Rubric Criteria Scores */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Award className="w-5 h-5 text-sky-600 mr-2" />
              Rubric Criteria Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluation.criterionScores.map((c: any, index: number) => (
                <ScoreBar
                  key={index}
                  label={c.criterion}
                  score={c.score}
                  evidence={c.evidence}
                  suggestion={c.suggestion}
                />
              ))}
            </div>
          </div>

          {/* Section 2: Structured Feedback Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
              Actionable Design Feedback
            </h3>
            <div className="space-y-4">
              {evaluation.feedbackItems.map((item: any, index: number) => (
                <FeedbackCard
                  key={index}
                  category={item.category}
                  severity={item.severity}
                  evidence={item.evidence}
                  concern={item.concern}
                  suggestion={item.suggestion}
                  confidence={item.confidence}
                />
              ))}
            </div>
          </div>

          {/* Section 3: Active Learning Follow-up Questions */}
          {evaluation.followUpQuestions && evaluation.followUpQuestions.length > 0 && (
            <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-sky-950 flex items-center">
                <HelpCircle className="w-5 h-5 text-sky-600 mr-2" />
                Follow-up Design Questions (To Deepen Your Learning)
              </h3>
              <ul className="space-y-3">
                {evaluation.followUpQuestions.map((q: string, index: number) => (
                  <li key={index} className="bg-white p-4 rounded-xl border border-sky-200 text-slate-800 text-sm font-medium shadow-xs flex items-start">
                    <span className="bg-sky-100 text-sky-800 font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 4: Original Submission Reference */}
          {submission && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <FileText className="w-4 h-4 text-slate-500 mr-2" />
                Original Design Submission Text
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider mb-1">Assumptions</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{submission.assumptions}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono">
                  <span className="font-bold text-slate-900 block font-sans uppercase tracking-wider mb-1">Classes & Interfaces</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{submission.classes}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider mb-1">Responsibilities</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{submission.responsibilities}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider mb-1">Explanation & Rationale</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{submission.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
