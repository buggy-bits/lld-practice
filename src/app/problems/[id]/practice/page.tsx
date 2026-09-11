'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DifficultyBadge } from '@/components/Badge';
import { ArrowLeft, Send, AlertCircle, FileCheck, CheckCircle2, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface ProblemDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  requirements: string[];
  constraints?: string[];
}

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const slugOrId = params.id as string;

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [assumptions, setAssumptions] = useState('');
  const [classes, setClasses] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [explanation, setExplanation] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Validation State
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/problems/${slugOrId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProblem(data.problem);
        } else {
          setError(data.error || 'Failed to load problem');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slugOrId]);

  const handleValidation = (): boolean => {
    const errs: string[] = [];

    if (!assumptions.trim()) {
      errs.push('Assumptions section cannot be empty.');
    } else if (assumptions.trim().length < 10) {
      errs.push('Assumptions must be at least 10 characters long.');
    }

    if (!classes.trim()) {
      errs.push('Classes and Interfaces section cannot be empty.');
    } else if (classes.trim().length < 10) {
      errs.push('Classes/Interfaces section must be at least 10 characters long.');
    }

    if (!responsibilities.trim()) {
      errs.push('Responsibilities and Relationships section cannot be empty.');
    } else if (responsibilities.trim().length < 15) {
      errs.push('Responsibilities section must be at least 15 characters long.');
    }

    if (!explanation.trim()) {
      errs.push('Design Explanation section cannot be empty.');
    } else if (explanation.trim().length < 15) {
      errs.push('Design Explanation must be at least 15 characters long.');
    }

    setValidationErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!handleValidation()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Start Attempt
      const startRes = await fetch(`/api/problems/${problem!.id}/attempts`, {
        method: 'POST',
      });
      const startData = await startRes.json();

      if (!startData.success) {
        throw new Error(startData.error || 'Failed to start attempt');
      }

      const attemptId = startData.attempt.id;

      // 2. Submit Attempt
      const submitRes = await fetch(`/api/attempts/${attemptId}/submission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assumptions,
          classes,
          responsibilities,
          explanation,
          additionalNotes,
        }),
      });

      const submitData = await submitRes.json();
      if (!submitData.success) {
        throw new Error(submitData.error || 'Failed to submit design');
      }

      // 3. Redirect to Attempt evaluation page
      router.push(`/attempts/${attemptId}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center text-slate-500">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full mb-4"></div>
        <p className="font-medium">Loading problem details...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6 text-center max-w-xl mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h3 className="font-bold text-lg">{error || 'Problem not found'}</h3>
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-rose-900 underline mt-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Problems
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="p-2 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{problem.title}</h1>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Side-by-side LLD Practice Workspace</p>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Problem Details & Requirements (Sticky) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Problem Description</h2>
              <p className="text-slate-700 text-sm leading-relaxed">{problem.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center mb-3">
                <FileCheck className="w-4 h-4 text-sky-600 mr-2" />
                Requirements ({problem.requirements.length})
              </h2>
              <ul className="space-y-2.5">
                {problem.requirements.map((req, i) => (
                  <li key={i} className="flex items-start text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {problem.constraints && problem.constraints.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Constraints</h2>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                  {problem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Structured Text Submission Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Design Submission</h2>
            <p className="text-slate-500 text-xs mt-1">
              Provide your design details below. Be specific about responsibilities and trade-offs to receive the most explainable feedback.
            </p>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 space-y-1">
              <div className="flex items-center space-x-2 font-semibold text-sm text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Deterministic Validation Messages:</span>
              </div>
              <ul className="list-disc list-inside text-xs space-y-0.5 text-amber-800 pl-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field 1: Assumptions */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                1. Assumptions <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                What scope or boundary assumptions are you making? (e.g. "Assuming multi-floor layout and single entry/exit gate per floor")
              </p>
              <textarea
                rows={3}
                value={assumptions}
                onChange={(e) => setAssumptions(e.target.value)}
                placeholder="List your assumptions clearly..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            {/* Field 2: Classes and Interfaces */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                2. Classes and Interfaces <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                List key domain entities, value objects, interfaces, or enumerations.
              </p>
              <textarea
                rows={4}
                value={classes}
                onChange={(e) => setClasses(e.target.value)}
                placeholder="e.g. Vehicle, Car, Bike, ParkingLot, ParkingFloor, ParkingSpot, Ticket, PricingStrategy..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            {/* Field 3: Responsibilities and Relationships */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                3. Responsibilities and Relationships <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Explain what each class manages and how they interact with each other.
              </p>
              <textarea
                rows={5}
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="e.g. ParkingLot: manages ParkingFloors&#10;ParkingFloor: tracks available spots&#10;PricingStrategy: calculates parking fees on exit..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            {/* Field 4: Design Explanation */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                4. Design Explanation & Rationale <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Why did you choose this architecture? How does it handle future extensions or decoupling?
              </p>
              <textarea
                rows={4}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="e.g. I separated PricingStrategy as an interface because fee calculation algorithms can change independently from parking space management..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            {/* Field 5: Additional Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                5. Additional Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any edge cases, concurrency considerations, or future extension thoughts..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Submitting & Validating...</span>
                  </>
                ) : (
                  <>
                    <span>Submit for Evaluation</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
