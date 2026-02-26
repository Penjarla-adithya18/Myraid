"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdDate: string;
};

type TaskResponse = {
  data?: {
    tasks: Task[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: {
    message: string;
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "5",
    });

    if (statusFilter !== "ALL") {
      params.set("status", statusFilter);
    }

    if (search.trim()) {
      params.set("search", search.trim());
    }

    return params.toString();
  }, [page, search, statusFilter]);

  const loadTasks = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/tasks?${query}`, { cache: "no-store" });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const payload: TaskResponse = await response.json();

      if (!response.ok || !payload.data) {
        setError(payload.error?.message ?? "Failed to load tasks");
        return;
      }

      setTasks(payload.data.tasks);
      setTotalPages(Math.max(payload.data.pagination.totalPages, 1));
    } finally {
      setIsLoading(false);
    }
  }, [query, router]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("TODO");
    setEditingTask(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const endpoint = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
    const method = editingTask ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description, status }),
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload?.error?.message ?? "Could not save task");
      return;
    }

    resetForm();
    await loadTasks();
  };

  const onEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
  };

  const onDelete = async (taskId: string) => {
    setError("");
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = await response.json();
      setError(payload?.error?.message ?? "Could not delete task");
      return;
    }

    await loadTasks();
  };

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-foreground/[0.02]">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-foreground/15 bg-background p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-foreground/60">Workspace</p>
            <h1 className="mt-1 text-3xl font-semibold">Task Dashboard</h1>
            <p className="mt-2 text-sm text-foreground/70">Create, track, and update your tasks securely.</p>
          </div>
          <button
            className="rounded-xl border border-foreground/20 bg-background px-4 py-2 font-medium"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="h-fit rounded-2xl border border-foreground/15 bg-background p-5">
            <h2 className="text-lg font-semibold">{editingTask ? "Edit Task" : "Create Task"}</h2>
            <p className="mt-1 text-sm text-foreground/70">Fill in details and save to your list.</p>

            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Title</span>
                <input
                  required
                  placeholder="Task title"
                  className="w-full rounded-xl border border-foreground/20 bg-background px-4 py-2.5 outline-none focus:border-foreground"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">Description</span>
                <textarea
                  required
                  placeholder="Task description"
                  className="h-32 w-full rounded-xl border border-foreground/20 bg-background px-4 py-2.5 outline-none focus:border-foreground"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">Status</span>
                <select
                  className="w-full rounded-xl border border-foreground/20 bg-background px-4 py-2.5 outline-none focus:border-foreground"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as TaskStatus)}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </label>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  className="rounded-xl bg-foreground px-4 py-2.5 font-medium text-background"
                  type="submit"
                >
                  {editingTask ? "Update Task" : "Create Task"}
                </button>

                {editingTask ? (
                  <button
                    className="rounded-xl border border-foreground/20 bg-background px-4 py-2.5"
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-foreground/15 bg-background p-5">
            <div className="mb-5 flex flex-col gap-3 md:flex-row">
              <input
                placeholder="Search by title"
                className="w-full rounded-xl border border-foreground/20 bg-background px-4 py-2.5 outline-none focus:border-foreground"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />

              <select
                className="rounded-xl border border-foreground/20 bg-background px-4 py-2.5 outline-none focus:border-foreground"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as "ALL" | TaskStatus);
                  setPage(1);
                }}
              >
                <option value="ALL">ALL STATUS</option>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            {error ? (
              <p className="mb-4 rounded-xl border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm">{error}</p>
            ) : null}

            {isLoading ? <p className="text-sm text-foreground/70">Loading tasks...</p> : null}

            {!isLoading && tasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-foreground/20 bg-foreground/[0.03] px-4 py-8 text-center text-sm text-foreground/75">
                No tasks found for current filters.
              </p>
            ) : null}

            <ul className="space-y-3">
              {tasks.map((task) => (
                <li key={task.id} className="rounded-xl border border-foreground/15 bg-background p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold">{task.title}</h3>
                      <p className="mt-1 text-sm text-foreground/80">{task.description}</p>
                      <p className="mt-2 text-xs text-foreground/65">
                        {task.status} • {new Date(task.createdDate).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        className="rounded-lg border border-foreground/20 px-3 py-1.5 text-sm"
                        onClick={() => onEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-lg border border-foreground/20 px-3 py-1.5 text-sm"
                        onClick={() => onDelete(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between border-t border-foreground/10 pt-4">
              <button
                type="button"
                className="rounded-xl border border-foreground/20 px-4 py-2 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </button>

              <span className="text-sm text-foreground/80">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                className="rounded-xl border border-foreground/20 px-4 py-2 disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
