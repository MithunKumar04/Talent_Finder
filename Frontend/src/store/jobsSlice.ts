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
  },
});

export const { setLoading, addJobPosting, setSelectedJob, setError, clearError } = jobsSlice.actions;
export default jobsSlice.reducer;
