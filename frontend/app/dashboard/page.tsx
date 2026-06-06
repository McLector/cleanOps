'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { NavigationDrawer } from '@/components/layout/NavigationDrawer';
import { TopAppBar } from '@/components/layout/TopAppBar';
import { AnalyticsMetricCards } from '@/components/dashboard/AnalyticsMetricCards';
import { JobsCreatedChart } from '@/components/dashboard/JobsCreatedChart';
import { SpendingBreakdownChart } from '@/components/dashboard/SpendingBreakdownChart';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { QuickStatsRow } from '@/components/dashboard/QuickStatsRow';
import { useAuth } from '@/lib/authContext';
import { Sun, Cloud, CloudRain } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { getCustomerJobs } from '@/app/actions/jobs';
import { Job } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sun };
  if (hour < 18) return { text: 'Good afternoon', icon: Cloud };
  return { text: 'Good evening', icon: CloudRain };
}

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { profile, user } = useAuth();
  const [greeting, setGreeting] = useState({ text: 'Welcome', icon: Sun });
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    setGreeting(getGreeting());
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  const { data: jobs, loading } = useAsyncData<Job[]>({
    fetchFn: async () => {
      try {
        const data = await getCustomerJobs();
        return { data: data as Job[], success: true };
      } catch (err: any) {
        // If it's an unauthorized error during logout, just return empty data
        if (err.message === 'Unauthorized') {
          return { data: [], success: true };
        }
        return { success: false, error: err.message };
      }
    },
    defaultValue: [],
    enabled: !!profile?.id,
    cacheKey: `dashboard-jobs-${profile?.id}`,
  });

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'there';
  const firstWord = userName.split(' ')[0];

  // Calculate metrics from real data
  const metrics = useMemo(() => {
    const totalJobs = jobs.length;
    const totalSpent = jobs.reduce((sum, job) => sum + (job.price_amount || 0), 0);
    const activeJobs = jobs.filter(j => ['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW'].includes(j.status)).length;
    
    // Average price
    const avgPrice = totalJobs > 0 ? totalSpent / totalJobs : 0;

    return {
      totalJobs,
      totalSpent: `$${totalSpent.toLocaleString()}`,
      activeJobs,
      avgPrice: `$${avgPrice.toFixed(2)}`
    };
  }, [jobs]);

  // Prepare chart data
  const chartData = useMemo(() => {
    // Last 6 months trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        month: months[d.getMonth()],
        year: d.getFullYear(),
        date: `${months[d.getMonth()]} ${d.getFullYear()}`,
        count: 0,
        revenue: 0
      };
    }).reverse();

    jobs.forEach(job => {
      const d = new Date(job.created_at);
      const m = months[d.getMonth()];
      const y = d.getFullYear();
      const monthData = last6Months.find(item => item.month === m && item.year === y);
      if (monthData) {
        monthData.count++;
        monthData.revenue += (job.price_amount || 0);
      }
    });

    return last6Months;
  }, [jobs]);

  return (
    <ProtectedRoute requiredRole="customer">
      <div className="flex h-dvh overflow-hidden" style={{ fontFamily: 'var(--md-font-body)' }}>
        <NavigationDrawer isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />

        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <TopAppBar 
            onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Dashboard"
            showSearch={false}
          />

          <main 
            className="flex-1 overflow-auto p-4 sm:p-6"
            style={{ 
              backgroundColor: 'var(--md-background)'
            }}
          >
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-4 shadow-lg text-white overflow-hidden relative sm:p-6 lg:p-8">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2 sm:gap-3">
                    <greeting.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                    <span className="text-sm font-semibold text-blue-100 sm:text-lg">{greeting.text}</span>
                  </div>
                  <h1 className="mb-2 text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
                    Welcome back,{' '}
                    <span className="block text-4xl font-extrabold text-blue-200 sm:text-5xl md:inline md:text-7xl">
                      {firstWord}
                    </span>
                    !
                  </h1>
                  <p className="text-sm text-blue-100 sm:text-lg">
                    {currentDate ? `Today is ${currentDate}` : 'Loading date...'}
                  </p>
                </div>
              </div>

              <AnalyticsMetricCards 
                totalJobs={metrics.totalJobs}
                totalSpent={metrics.totalSpent}
                activeJobs={metrics.activeJobs}
                avgPrice={metrics.avgPrice}
              />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <JobsCreatedChart data={chartData} />
                <SpendingBreakdownChart data={chartData.map(d => ({ week: d.month, revenue: d.revenue }))} />
              </div>

              <QuickStatsRow jobs={jobs} />

              <RecentActivityFeed jobs={jobs.slice(0, 10)} />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
