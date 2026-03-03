import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Candidate {
  name: string;
  rank: number;
  final_score?: number;
  email?: string;
  phone?: string;
  experience?: string;
  skills?: string[];
  [key: string]: unknown;
  remarks?: string[];
}

export interface JobPosting {
  id: string;
  title: string;
  jdText: string;
  candidates: Candidate[];
  totalResumes: number;
  createdAt: string;
}

interface JobsState {
  jobs: JobPosting[];
  loading: boolean;
  error: string | null;
  selectedJobId: string | null;
}

const initialState: JobsState = {
  jobs: JSON.parse(localStorage.getItem('jobPostings') || '[]'),
  loading: false,
  error: null,
  selectedJobId: null,
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    addJobPosting(state, action: PayloadAction<JobPosting>) {
      state.jobs.unshift(action.payload);
      state.loading = false;
      localStorage.setItem('jobPostings', JSON.stringify(state.jobs));
    },
    setSelectedJob(state, action: PayloadAction<string | null>) {
      state.selectedJobId = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
    addCandidateRemark(state,action: PayloadAction<{jobId: string; candidateName: string;remark: string;}>) {
      const { jobId, candidateName, remark } = action.payload;

      const job = state.jobs.find((j) => j.id === jobId);
      if (!job) return;

      const candidate = job.candidates.find(
        (c) => c.name === candidateName
      );
      if (!candidate) return;

      if (!candidate.remarks) {
        candidate.remarks = [];
      }

      candidate.remarks.push(remark);

      localStorage.setItem('jobPostings', JSON.stringify(state.jobs));
    },

    removeCandidateRemark(
      state,
      action: PayloadAction<{
        jobId: string;
        candidateName: string;
        index: number;
      }>
    ) {
      const { jobId, candidateName, index } = action.payload;

      const job = state.jobs.find((j) => j.id === jobId);
      if (!job) return;

      const candidate = job.candidates.find(
        (c) => c.name === candidateName
      );
      if (!candidate || !candidate.remarks) return;

      candidate.remarks.splice(index, 1);

      localStorage.setItem('jobPostings', JSON.stringify(state.jobs));
    },
  },
});

export const { setLoading, addJobPosting, setSelectedJob, setError, clearError,addCandidateRemark, removeCandidateRemark } = jobsSlice.actions;
export default jobsSlice.reducer;
