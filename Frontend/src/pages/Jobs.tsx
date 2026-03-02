import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Users, ChevronDown, ChevronUp, Loader2, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useAppDispatch,useAppSelector } from '../store';
import { addJobPosting,setError, setLoading } from '../store/jobsSlice';
import api from '../lib/axios';
import { toast } from 'sonner';
import type { Candidate } from '../store/jobsSlice';

const Jobs = () => {
  const dispatch = useAppDispatch();
  const { jobs, loading } = useAppSelector((s) => s.jobs);
  const [title, setTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Jobs</h1>

      {/* Create Job Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Job Ranking
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior React Developer"
              required
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jd-text">Job Description</Label>
            <Textarea
              id="jd-text"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={6}
              required
              maxLength={10000}
            />
          </div>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Ranking...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" /> Rank Resumes
              </>
            )}
          </Button>
        </form>
      </motion.div>

      {/* Job Cards */}
      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No jobs yet</h3>
          <p className="text-muted-foreground">Submit a job description above to rank resumes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(job.id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.totalResumes} candidates • {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="w-3 h-3" /> {job.totalResumes}
                  </Badge>
                  {expandedJobId === job.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {expandedJobId === job.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-border">
                      <div className="mt-4 space-y-2">
                        {job.candidates.length === 0 ? (
                          <p className="text-muted-foreground text-sm">No candidates found.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
                                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Name</th>
                                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Rank</th>
                                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Score</th>
                                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Email</th>
                                </tr>
                              </thead>
                              <tbody>
                                {job.candidates.map((c, i) => (
                                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                                    <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                                    <td className="py-2 px-3 font-medium text-foreground">{c.name || 'Unknown'}</td>
                                    <td className="py-2 px-3">
                                      <Badge
                                        variant="outline"
                                        className={
                                          c.rank > 0
                                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                            : 'bg-muted text-muted-foreground'
                                        }
                                      >
                                        {c.rank}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-3 text-muted-foreground">{c.final_score * 100 + "%" ?? '—'}</td>
                                    <td className="py-2 px-3 text-muted-foreground">{c.email || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
