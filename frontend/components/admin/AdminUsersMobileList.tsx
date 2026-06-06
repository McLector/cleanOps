'use client';

import React from 'react';
import { Star, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Job, Profile } from '@/types';

interface UserWithEmail extends Profile {
  email?: string;
}

interface UserActivity {
  customerJobs: Job[];
  workerJobs: Job[];
  totalSpent: number;
  totalEarned: number;
}

interface AdminUsersMobileListProps {
  users: UserWithEmail[];
  loading: boolean;
  expandedRows: Set<string>;
  userActivityCache: Record<string, UserActivity>;
  roleStyles: Record<string, string>;
  avatarStyles: Record<string, string>;
  onToggleUser: (id: string) => void;
  onSuspendUser: (user: UserWithEmail) => void;
  onViewJobs: (id: string) => void;
}

export function AdminUsersMobileList({
  users,
  loading,
  expandedRows,
  userActivityCache,
  roleStyles,
  avatarStyles,
  onToggleUser,
  onSuspendUser,
  onViewJobs,
}: AdminUsersMobileListProps) {
  return (
    <div data-testid="admin-users-mobile-list" className="space-y-3 md:hidden">
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
            <Skeleton className="h-28 w-full rounded" />
          </div>
        ))
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No users found.
        </div>
      ) : (
        users.map((user) => {
          const initials = (user.full_name || 'U').substring(0, 2).toUpperCase();
          const isExpanded = expandedRows.has(user.id);
          const activity = userActivityCache[user.id];

          return (
            <article key={user.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarStyles[user.role] || 'bg-slate-400'}`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{user.full_name || 'Anonymous'}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Badge variant="outline" className={`capitalize border-0 px-2 py-0.5 text-xs font-medium ${roleStyles[user.role] || 'bg-slate-100'}`}>
                    {user.role}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Balance</p>
                    <p className="mt-1 font-semibold text-slate-800">${(user.money_balance || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rating</p>
                    {user.rating ? (
                      <p className="mt-1 flex items-center font-medium text-yellow-500">
                        <Star className="mr-1 h-3 w-3 fill-current" aria-hidden="true" />
                        {user.rating.toFixed(1)}
                      </p>
                    ) : (
                      <p className="mt-1 text-slate-400">-</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Joined</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => onToggleUser(user.id)}>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Activity
                  </Button>
                  {user.role !== 'admin' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Suspend ${user.full_name || 'user'}`}
                      className="ml-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onSuspendUser(user)}
                    >
                      Suspend
                    </Button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-4 text-sm">
                  {!activity ? (
                    <Skeleton className="h-16 w-full rounded" />
                  ) : (
                    <>
                      <div className="rounded border border-slate-200 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer Activity</p>
                        <p className="mt-2">Jobs Requested: {activity.customerJobs.length}</p>
                        <p>Active Jobs: {activity.customerJobs.filter((job) => ['OPEN', 'IN_PROGRESS'].includes(job.status)).length}</p>
                        <p>Total Spent: ${Number(activity.totalSpent).toFixed(2)}</p>
                        <Button type="button" variant="link" className="h-auto px-0 pt-2" onClick={() => onViewJobs(user.id)}>
                          View their jobs
                        </Button>
                      </div>
                      {(user.role === 'employee' || activity.workerJobs.length > 0) && (
                        <div className="rounded border border-slate-200 bg-white p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Worker Activity</p>
                          <p className="mt-2">Jobs Worked: {activity.workerJobs.length}</p>
                          <p>Active Jobs: {activity.workerJobs.filter((job) => ['OPEN', 'IN_PROGRESS'].includes(job.status)).length}</p>
                          <p>Total Earned: ${Number(activity.totalEarned).toFixed(2)}</p>
                          <Button type="button" variant="link" className="h-auto px-0 pt-2" onClick={() => onViewJobs(user.id)}>
                            View assigned jobs
                          </Button>
                        </div>
                      )}
                    </>
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
