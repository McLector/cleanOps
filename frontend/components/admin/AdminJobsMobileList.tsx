'use client';

import React from 'react';
import { Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';

type AdminJob = {
  id: string;
  customer?: { full_name?: string | null } | null;
  worker?: { full_name?: string | null } | null;
  customer_id?: string | null;
  worker_id?: string | null;
  status: string;
  urgency?: string | null;
  price_amount?: number | string | null;
  platform_cut?: number | string | null;
  created_at: string;
  updated_at?: string | null;
  location_address?: string | null;
  distance?: number | string | null;
  tasks?: unknown;
};

interface AdminJobsMobileListProps {
  jobs: AdminJob[];
  loading: boolean;
  expandedRows: Set<string>;
  statusColors: Record<string, string>;
  onToggleRow: (id: string) => void;
  onCopyJobId: (id: string) => void;
  onSelectAction: (job: AdminJob, action: 'complete' | 'cancel') => void;
}

const renderTaskLabel = (task: unknown) => {
  if (typeof task === 'string') return task;
  if (task && typeof task === 'object') {
    const value = task as { name?: string; value?: string };
    return value.name || value.value || 'Task';
  }
  return 'Task';
};

export function AdminJobsMobileList({
  jobs,
  loading,
  expandedRows,
  statusColors,
  onToggleRow,
  onCopyJobId,
  onSelectAction,
}: AdminJobsMobileListProps) {
  return (
    <div data-testid="admin-jobs-mobile-list" className="space-y-3 md:hidden">
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
            <Skeleton className="h-28 w-full rounded" />
          </div>
        ))
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No jobs found matching filters.
        </div>
      ) : (
        jobs.map((job) => {
          const isExpanded = expandedRows.has(job.id);
          const price = Number(job.price_amount || 0).toFixed(2);
          const tasks = Array.isArray(job.tasks) ? job.tasks : [];

          return (
            <article key={job.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-mono text-xs text-slate-700">{job.id.slice(0, 8)}</span>
                      <button
                        type="button"
                        aria-label="Copy job ID"
                        onClick={() => onCopyJobId(job.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                      >
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                      {job.customer?.full_name || 'Unknown customer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-slate-900">${price}</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Worker</p>
                    <p className="mt-1 truncate font-medium text-slate-700">
                      {job.worker?.full_name || 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Urgency</p>
                    <Badge
                      variant="outline"
                      className={`mt-1 text-[10px] uppercase font-bold tracking-wider ${
                        job.urgency === 'HIGH'
                          ? 'border-red-200 bg-red-50 text-red-600'
                          : job.urgency === 'LOW'
                            ? 'border-green-200 bg-green-50 text-green-600'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {job.urgency || 'NORMAL'}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${
                      statusColors[job.status] || 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {job.status.replace('_', ' ')}
                  </span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onToggleRow(job.id)} className="ml-auto">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Details
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {job.status === 'IN_PROGRESS' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => onSelectAction(job, 'complete')}
                    >
                      Force Complete
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                    disabled={job.status === 'COMPLETED' || job.status === 'CANCELLED'}
                    onClick={() => onSelectAction(job, 'cancel')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="space-y-4 border-t border-slate-200 bg-slate-50 p-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
                    <p className="mt-1 rounded border border-slate-200 bg-white p-3 text-slate-800">
                      {job.location_address || 'No address provided'}
                    </p>
                  </div>
                  {tasks.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tasks</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tasks.map((task, index) => (
                          <span key={index} className="rounded border border-blue-200 bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            {renderTaskLabel(task)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
