import { motion } from 'framer-motion';
import { User, Users, Award, Inbox } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { useAppSelector } from '../store';
import type { Candidate } from '../store/jobsSlice';
import { cn } from '../lib/utils';

interface KanbanCandidate extends Candidate {
  jobTitle: string;
  jobId: string;
}

const Dashboard = () => {
  const { jobs } = useAppSelector((s) => s.jobs);

  // Flatten all candidates across jobs into kanban columns
  const allCandidates: KanbanCandidate[] = jobs.flatMap((job) =>
    job.candidates.map((c) => ({ ...c, jobTitle: job.title, jobId: job.id }))
  );

  // Sourced: rank === 0
  const sourced = allCandidates.filter((c) => c.rank === 0);
  // Screened: rank !== 0
  const screened = allCandidates.filter((c) => c.rank !== 0);
  // Shortlisted: top 3 by rank (highest rank first, or lowest depending on API - assuming higher = better)
  const shortlisted = [...screened].sort((a, b) => a.rank - b.rank).slice(0, 3);

  const columns = [
    {
      title: 'Sourced',
      icon: Inbox,
      candidates: sourced,
      color: 'bg-muted text-muted-foreground',
      headerColor: 'text-muted-foreground',
      borderColor: 'border-border',
    },
    {
      title: 'Screened',
      icon: Users,
      candidates: screened,
      color: 'bg-amber-100 text-amber-700',
      headerColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
    {
      title: 'Shortlisted',
      icon: Award,
      candidates: shortlisted,
      color: 'bg-emerald-100 text-emerald-700',
      headerColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} • {allCandidates.length} total candidates
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {columns.map((col) => (
          <div key={col.title} className="glass-card rounded-xl p-5">
            <p className="text-sm text-muted-foreground">{col.title}</p>
            <p className={cn('text-3xl font-bold mt-1', col.headerColor)}>{col.candidates.length}</p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      {allCandidates.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No candidates yet</h3>
          <p className="text-muted-foreground">Go to Jobs and submit a job description to rank resumes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div key={col.title}>
              <div className="flex items-center gap-2 mb-4">
                <col.icon className={cn('w-5 h-5', col.headerColor)} />
                <h2 className="font-semibold text-foreground">{col.title}</h2>
                <Badge variant="secondary" className="ml-auto">
                  {col.candidates.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {col.candidates.length === 0 ? (
                  <div className="glass-card rounded-xl p-4 text-center text-sm text-muted-foreground">
                    No candidates
                  </div>
                ) : (
                  col.candidates.map((c, i) => (
                    <motion.div
                      key={`${c.jobId}-${c.name}-${i}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn('glass-card rounded-xl p-4 border-l-4', col.borderColor)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{c.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{c.jobTitle}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn('text-xs', col.color)}>
                          Rank {c.rank}
                        </Badge>
                      </div>
                      {c.email && (
                        <p className="text-xs text-muted-foreground mt-1">{c.email}</p>
                      )}
                      {c.score !== undefined && (
                        <p className="text-xs text-muted-foreground">Score: {c.score}</p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
