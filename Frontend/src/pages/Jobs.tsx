import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Briefcase,
  Info,
  Mail
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useAppDispatch, useAppSelector } from '../store';
import { addJobPosting, setError, setLoading } from '../store/jobsSlice';
import api from '../lib/axios';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import type { Candidate } from '../store/jobsSlice';

const Jobs = () => {
  const { error } = useAppSelector((s) => s.jobs);

  const dispatch = useAppDispatch();
  const { jobs, loading } = useAppSelector((s) => s.jobs);

  const [title, setTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // 🔎 Filtering states
  const [jobSearch, setJobSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');

  // 🎨 Explanation themes
  const explanationThemes = [
    { bg: 'bg-blue-50', border: 'border-blue-400' },
    { bg: 'bg-purple-50', border: 'border-purple-400' },
    { bg: 'bg-emerald-50', border: 'border-emerald-400' },
    { bg: 'bg-amber-50', border: 'border-amber-400' },
    { bg: 'bg-pink-50', border: 'border-pink-400' },
    { bg: 'bg-indigo-50', border: 'border-indigo-400' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !jdText.trim()) return;

    dispatch(setLoading(true));
    try {
      const { data } = await api.post('/rank-resumes', { jd_text: jdText });

      const jobPosting = {
        id: Date.now().toString(),
        title: title.trim(),
        jdText: jdText.trim(),
        candidates: (data.ranked_candidates || []) as Candidate[],
        totalResumes: data.total_resumes || 0,
        createdAt: new Date().toISOString(),
      };

      dispatch(addJobPosting(jobPosting));
      toast.success(`Ranked ${jobPosting.totalResumes} resumes!`);
      setTitle('');
      setJdText('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to rank resumes';
      dispatch(setError(message));
      toast.error('Failed to rank resumes. Is the API running?');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedJobId((prev) => (prev === id ? null : id));
  };

  // 🔎 Filtered Jobs Logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title
      .toLowerCase()
      .includes(jobSearch.toLowerCase());

    const matchesSelect =
      selectedJobId === 'all' || job.id === selectedJobId;

    return matchesSearch && matchesSelect;
  });

  return (
    <div className="pb-16">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground mt-1">
          Create jobs, rank resumes, and review candidate insights
        </p>
      </div>
      {/* 🔔 Alerts */}
      <div className="mb-6 space-y-3">

        {/* Loading Alert */}
        {loading && (
          <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            Ranking resumes… please wait
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">Error:</span>
            <span className="break-words">{error}</span>
          </div>
        )}

      </div>

      {/* Create Job */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 mb-10 border border-border/60 shadow-sm hover:shadow-md transition-shadow"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
          <Plus className="w-5 h-5 text-indigo-600" />
          New Job Ranking
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Job Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior React Developer"
            />
          </div>

          <div className="space-y-2">
            <Label>Job Description</Label>
            <Textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={6}
              placeholder="Paste full JD here..."
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Rank Resumes
          </Button>
        </form>
      </motion.div>

      {/* 🔎 Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Input
          type="text"
          placeholder="Search job title..."
          value={jobSearch}
          onChange={(e) => setJobSearch(e.target.value)}
          className="w-full sm:w-72"
        />

        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-white shadow-sm hover:border-indigo-400 transition"
        >
          <option value="all">All Jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No jobs match your filter.
        </div>
      )}

      {/* Job Cards */}
      <div className="space-y-6">
        {filteredJobs.map((job, idx) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card rounded-2xl overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleExpand(job.id)}
              className="w-full p-6 flex justify-between hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.totalResumes} candidates • {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {expandedJobId === job.id ? <ChevronUp /> : <ChevronDown />}
            </button>

            <AnimatePresence>
              {expandedJobId === job.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 border-t border-border/60 space-y-6">

                    {/* JD Details */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Job Description</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {job.jdText}
                      </p>
                    </div>

                    {/* Candidates Table */}
                    <div className="overflow-x-auto rounded-xl border border-border/60">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                          <tr>
                            <th className="px-4 py-3 text-center">#</th>
                            <th className="px-4 py-3 text-center">Name</th>
                            <th className="px-4 py-3 text-center">Rank</th>
                            <th className="px-4 py-3 text-center">Explanation</th>
                            <th className="px-4 py-3 text-center">Score</th>
                            <th className="px-4 py-3 text-center">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {job.candidates.map((c, i) => (
                            <tr key={i} className="border-b hover:bg-indigo-50/40 transition">
                              
                              <td className="px-4 py-3 text-center text-muted-foreground">
                                {i + 1}
                              </td>

                              <td className="px-4 py-3  font-medium">
                                {c.name || 'Unknown'}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {c.rank !== 0 && c.final_score >= 0.6 ? (
                                  <div className="flex justify-center items-center gap-2">
                                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                                      Rank {c.rank}
                                    </Badge>

                                    {c.rank <= 3 && (
                                      <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">
                                        Shortlisted
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <Badge className="bg-red-100 text-red-700 border border-red-200">
                                    Rejected
                                  </Badge>
                                )}
                              </td>

                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={!c.explanation}
                                    onClick={() => setSelectedCandidate(c)}
                                    className="border border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500 transition shadow-sm"
                                  >
                                    <Info className="w-4 h-4 mr-1" />
                                    Explanation
                                  </Button>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-center font-semibold text-indigo-600">
                                {(c.final_score * 100).toFixed(1)}%
                              </td>

                              <td className="px-4 py-3 text-left text-muted-foreground">
                                <span className="inline-flex items-center">
                                  <Mail className="w-3 h-3 mr-1 shrink-0" />
                                  <span className="leading-none">{c.email || '—'}</span>
                                </span>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Explanation Modal */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">{selectedCandidate.name}</h2>
            <p className="mb-4 font-semibold text-indigo-600">
              Final Score: {(selectedCandidate.final_score * 100).toFixed(2)}%
            </p>

            <div className="space-y-4">
              {Object.entries(selectedCandidate.explanation || {})
                .filter(([_, v]) => v !== null && v !== undefined && String(v).trim() !== '')
                .map(([key, value], idx) => {
                  const theme = explanationThemes[idx % explanationThemes.length];
                  return (
                    <div
                      key={key}
                      className={cn(
                        'p-4 rounded-xl border-l-4 shadow-sm',
                        theme.bg,
                        theme.border
                      )}
                    >
                      <h4 className="font-semibold capitalize mb-1">
                        {key.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-sm whitespace-pre-wrap">{String(value)}</p>
                    </div>
                  );
                })}
            </div>

            <Button
              className="mt-6 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => setSelectedCandidate(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;