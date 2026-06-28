import type { Metadata } from 'next';

import { InterviewDashboardShell } from '@/components/interviews/interview-dashboard-shell';

export const metadata: Metadata = {
  title: 'Interview Dashboard | DiCodeWeb',
  description:
    'Plan your frontend prep, practice the right questions, and track what actually improves with the DiCodeWeb interview dashboard.',
};

export default function InterviewDashboardPage() {
  return <InterviewDashboardShell />;
}
