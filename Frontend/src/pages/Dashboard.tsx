import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Award,
  Inbox,
  ChevronDown,
  ChevronUp,
  Briefcase,
  PenLine,
  X
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { useAppSelector } from '../store';
import { cn } from '../lib/utils';
import type { Candidate } from '../store/jobsSlice';
import { useNavigate } from 'react-router-dom';

interface KanbanCandidate extends Candidate {
  jobTitle: string;
  jobId: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { jobs } = useAppSelector((s) => s.jobs);

  const [selectedCandidate, setSelectedCandidate] =
    useState<KanbanCandidate | null>(null);

  const [remark, setRemark] = useState('');
  const [candidateRemarks, setCandidateRemarks] =
    useState<Record<string, string[]>>({});

  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [jobSearch, setJobSearch] = useState('');
  const [expandedColumns, setExpandedColumns] =
    useState<Record<string, boolean>>({});

  const filteredJobs = useMemo(() => {
    let result = jobs;

    if (selectedJobId !== 'all') {
      result = result.filter((j) => j.id === selectedJobId);
    }

    if (jobSearch.trim()) {
      result = result.filter((j) =>
        j.title.toLowerCase().includes(jobSearch.toLowerCase())
      );
    }

    return result;
  }, [jobs, selectedJobId, jobSearch]);

  const jobBoards = filteredJobs.map((job) => {
    const allJobCandidates: KanbanCandidate[] =
      job.candidates.map((c) => ({
        ...c,
        jobTitle: job.title,
        jobId: job.id,
      }));

    const rejected = allJobCandidates.filter(
      (c) => c.final_score < 0.6
    );

    const screenedData = allJobCandidates.filter(
      (c) => c.rank !== 0 && c.final_score >= 0.6
    );

    const shortlisted = [...screenedData]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 3);

    const screened = [...screenedData]
      .sort((a, b) => a.rank - b.rank)
      .slice(3);

    return {
      jobId: job.id,
      jobTitle: job.title,
      sourcedCount: allJobCandidates.length, // ✅ TOTAL SOURCED
      columns: [
        {
          key: 'rejected',
          title: 'Rejected',
          icon: Inbox,
          candidates: rejected,
          color: 'bg-red-100 text-red-700',
          headerColor: 'text-red-600',
          borderColor: 'border-red-300',
        },
        {
          key: 'screened',
          title: 'Screened',
          icon: Users,
          candidates: screened,
          color: 'bg-amber-100 text-amber-700',
          headerColor: 'text-amber-600',
          borderColor: 'border-amber-300',
        },
        {
          key: 'shortlisted',
          title: 'Shortlisted',
          icon: Award,
          candidates: shortlisted,
          color: 'bg-emerald-100 text-emerald-700',
          headerColor: 'text-emerald-600',
          borderColor: 'border-emerald-300',
        },
      ],
    };
  });

  const toggleColumn = (columnKey: string) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const addRemark = () => {
    if (!remark.trim() || !selectedCandidate) return;
    const key = `${selectedCandidate.jobId}-${selectedCandidate.name}`;
    setCandidateRemarks((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), remark.trim()],
    }));
    setRemark('');
  };

  const removeRemark = (key: string, index: number) => {
    setCandidateRemarks((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const hasRemarks = (c: KanbanCandidate) => {
    const key = `${c.jobId}-${c.name}`;
    return (candidateRemarks[key] || []).length > 0;
  };

  return (
    <div className="overflow-x-hidden">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search job title..."
            value={jobSearch}
            onChange={(e) => setJobSearch(e.target.value)}
            className="border rounded px-3 py-2 text-sm sm:w-64"
          />

          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="border rounded px-3 py-2 text-sm sm:w-48"
          >
            <option value="all">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            <Briefcase size={16} />
            Create Jobs
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="space-y-12">
        {jobBoards.map((board) => (
          <div key={board.jobId}>
            <h2 className="text-xl font-semibold">{board.jobTitle}</h2>

            {/* ✅ TOTAL SOURCED */}
            <div className="mt-1 mb-4 text-sm text-blue-600 font-medium">
              👥 {board.sourcedCount} total sourced candidates
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {board.columns.map((col) => {
                const columnKey = `${board.jobId}-${col.key}`;
                const isExpanded = expandedColumns[columnKey];
                const visibleCandidates = isExpanded
                  ? col.candidates
                  : col.candidates.slice(0, 5);

                return (
                  <div key={col.title}>
                    <div className="flex items-center gap-2 mb-4">
                      <col.icon className={cn('w-5 h-5', col.headerColor)} />
                      <h3 className="font-semibold">{col.title}</h3>
                      <Badge variant="secondary" className="ml-auto">
                        {col.candidates.length}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {visibleCandidates.map((c, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            'glass-card rounded-xl p-4 border-l-4 cursor-pointer hover:shadow-md transition',
                            col.borderColor
                          )}
                          onClick={() => setSelectedCandidate(c)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">
                                {c.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {c.jobTitle}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {hasRemarks(c) && (
                                <PenLine
                                  size={14}
                                  className="text-indigo-500"
                                  title="Remarks added"
                                />
                              )}
                              <Badge className={col.color}>
                                {c.rank === 0 ? 'Rejected' : `Rank ${c.rank}`}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                        
                      ))}

                      {col.candidates.length > 5 && (
                        <button
                          onClick={() => toggleColumn(columnKey)}
                          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        ))}
      </div>

      {/* Remark Modal */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">
              {selectedCandidate.name}
            </h2>

            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Add remark..."
              className="w-full border rounded-lg p-3 text-sm mb-3"
              rows={3}
            />

            <div className="flex gap-2 mb-4">
              <button
                onClick={addRemark}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Add Remark
              </button>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>

            {(candidateRemarks[
              `${selectedCandidate.jobId}-${selectedCandidate.name}`
            ] || []).map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded mb-2"
              >
                <span className="text-sm">{r}</span>
                <X
                  size={14}
                  className="cursor-pointer text-red-500"
                  onClick={() =>
                    removeRemark(
                      `${selectedCandidate.jobId}-${selectedCandidate.name}`,
                      i
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;