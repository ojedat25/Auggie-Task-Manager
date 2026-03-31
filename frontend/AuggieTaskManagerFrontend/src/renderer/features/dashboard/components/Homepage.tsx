import { useHomepage } from '../hooks/useHomepage';

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const Homepage = () => {
  const { displayName, loadingUser, sortedUpcomingTasks, loadingTasks } = useHomepage();

  const greetingName = displayName || 'Auggie';

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const greeting = getTimeBasedGreeting();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body space-y-3">
          <div className="text-lg font-semibold">
            {loadingUser ? (
              <span className="skeleton h-7 w-56" />
            ) : (
              <>
                {greeting}, <span className="text-accent">{greetingName}</span>
              </>
            )}
          </div>

          <p className="text-base-content/80">
            Here’s what’s coming up next. Stay on top of due dates and keep your
            week moving.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="stat bg-base-200 rounded-box">
              <div className="stat-title">Upcoming tasks</div>
              <div className="stat-value text-primary">
                {loadingTasks ? (
                  <span className="skeleton h-8 w-10" />
                ) : (
                  sortedUpcomingTasks.length
                )}
              </div>
              <div className="stat-desc">Next 7 days</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body space-y-3">
          <div className="text-lg font-semibold">Upcoming</div>

          {loadingTasks ? (
            <div className="space-y-2">
              <div className="skeleton h-6 w-full" />
              <div className="skeleton h-6 w-full" />
              <div className="skeleton h-6 w-full" />
              <div className="skeleton h-6 w-full" />
            </div>
          ) : sortedUpcomingTasks.length === 0 ? (
            <div className="alert">
              <span>No tasks due soon.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Due</th>
                    <th className="hidden md:table-cell">Course</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUpcomingTasks.map((t) => (
                    <tr key={t.id}>
                      <td className="font-medium">{t.title}</td>
                      <td className="text-primary">{formatDueDate(t.dueAt)}</td>
                      <td className="hidden md:table-cell">{t.course ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="card-actions justify-end">
            <button className="btn btn-primary btn-sm" disabled>
              View all tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


