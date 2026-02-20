import { seedProjects } from "@/mock/projectSampleData";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#f4f6f8] text-slate-900">
      <aside className="w-48 border-r border-slate-200 bg-[#e8eef2] p-3">
        <div className="space-y-2">
          <button className="w-full bg-[#0f7ea9] px-3 py-2 text-left text-sm font-medium text-white">
            New Project
          </button>
          <button className="w-full bg-[#0f7ea9] px-3 py-2 text-left text-sm font-medium text-white">
            capture_button
          </button>
        </div>
      </aside>

      <main className="w-full px-16 py-10">
        <div className="mb-6 flex items-center justify-end">
          <p className="text-sm text-slate-600">Claudius Marco Andrew</p>
        </div>

        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-medium text-slate-900">Project List</h1>

          <div className="space-y-4">
            {seedProjects.map((project) => {
              const checkpointsCount = project.checkpoints.length;
              const label = checkpointsCount === 1 ? "assessment" : "assessments";

              return (
                <article
                  key={project.id}
                  className="rounded-md bg-[#127ea9] px-5 py-4 text-white shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-semibold leading-tight">{project.name}</h2>
                      <p className="mt-3 text-xs text-sky-100">
                        {checkpointsCount} {label}
                      </p>
                    </div>
                    <span className="text-xl leading-none text-sky-100">⋮</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
