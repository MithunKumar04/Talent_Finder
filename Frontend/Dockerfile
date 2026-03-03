# frontend/Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run dev

# Serve build with a small web server
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


const allCandidates: KanbanCandidate[] = jobs.flatMap((job) =>
    job.candidates.map((c) => ({ ...c, jobTitle: job.title, jobId: job.id } as KanbanCandidate))
  );

  // Global counts
  const totalSourced = allCandidates.filter((c) => c.final_score < 0.6).length;
  const totalRejected = allCandidates.filter((c) => c.rank === 0).length;

  const totalShortlisted = jobs.reduce((sum, job) => {
    const screened = job.candidates.filter((c) => c.rank !== 0 && c.final_score > 0.6);
    return sum + Math.min(3, screened.length);
  }, 0);

  const totalScreened = jobs.reduce((sum, job) => {
    const screened = job.candidates.filter((c) => c.rank !== 0 && c.final_score > 0.6);
    return sum + Math.max(0, screened.length - 3);
  }, 0);


{/* Global stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground">Sourced</p>
          <p className="text-3xl font-bold mt-1 text-muted-foreground">{totalSourced}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-foreground">Screened</p>
          <p className="text-3xl font-bold mt-1 text-amber-600">{totalScreened}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-foreground">Shortlisted</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">{totalShortlisted}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-foreground">Rejected</p>
          <p className="text-3xl font-bold mt-1 text-red-600">{totalRejected}</p>
        </div>
      </div>