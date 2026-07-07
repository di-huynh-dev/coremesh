import { FreeAssessmentShell } from '@/components/free-assessment/free-assessment-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Frontend Assessment | DiCodeWeb',
  description:
    'Take a free DiCodeWeb assessment to benchmark frontend readiness, identify senior-level gaps, and choose a focused study plan.',
};

export default function FreeAssessmentPage() {
  return <FreeAssessmentShell />;
}
