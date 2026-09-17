import type { Case, Document, Conflict, TimelineEvent } from '../types';

export const mockCases: Case[] = [
  {
    id: 'c1',
    title: 'Employment Dispute',
    status: 'active',
    category: 'Employment',
    lastUpdated: '2026-09-17',
  }
];

export const mockDocuments: Document[] = [
  { id: 'd1', name: 'Offer Letter.pdf', type: 'application/pdf', size: '245 KB', uploadDate: '2026-09-15' },
  { id: 'd2', name: 'Employment Agreement.pdf', type: 'application/pdf', size: '1.2 MB', uploadDate: '2026-09-15' },
  { id: 'd3', name: 'HR Policy.pdf', type: 'application/pdf', size: '850 KB', uploadDate: '2026-09-16' },
  { id: 'd4', name: 'Termination Notice.pdf', type: 'application/pdf', size: '120 KB', uploadDate: '2026-09-16' },
];

export const mockConflicts: Conflict[] = [
  {
    id: 'conf1',
    title: 'Notice Period Mismatch',
    description: 'The notice period in the offer letter differs from the employment agreement.',
    severity: 'high',
    sources: [
      {
        documentId: 'd1',
        documentName: 'Offer Letter.pdf',
        page: 2,
        clause: '5',
        text: 'Notice Period = 30 days'
      },
      {
        documentId: 'd2',
        documentName: 'Employment Agreement.pdf',
        page: 7,
        clause: '12',
        text: 'Notice Period = 90 days'
      }
    ]
  }
];

export const mockTimeline: TimelineEvent[] = [
  { id: 't1', date: '2026-01-12', title: 'Offer Letter Issued', description: 'Initial offer letter sent.' },
  { id: 't2', date: '2026-01-20', title: 'Employment Started', description: 'First day of employment.' },
  { id: 't3', date: '2026-08-15', title: 'Performance Review', description: 'Mid-year performance review.' },
  { id: 't4', date: '2026-08-28', title: 'Resignation Requested', description: 'Verbal request for resignation.' },
  { id: 't5', date: '2026-08-30', title: 'Termination Notice Received', description: 'Formal termination notice delivered.' }
];

export const mockMissingInformation = [
  'Employee Handbook referenced in the Employment Agreement but not uploaded.'
];
