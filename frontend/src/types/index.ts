export interface Case {
  id: string;
  title: string;
  status: 'active' | 'archived';
  category: string;
  lastUpdated: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

export interface Conflict {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  sources: Citation[];
}

export interface Citation {
  documentId: string;
  documentName: string;
  page: number;
  clause: string;
  text: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface Question {
  id: string;
  text: string;
  status: 'pending' | 'discussed';
  relatedDocuments: string[];
}
