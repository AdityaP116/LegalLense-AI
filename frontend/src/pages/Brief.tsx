import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CitationToken } from '../components/ui/CitationToken';
import { mockCases, mockConflicts } from '../data/mockData';
import { Download, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Brief() {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('summary');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-on-surface-variant p-8">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="font-heading text-xl font-bold text-on-surface mb-2">Generating Legal Brief</h2>
        <p>Synthesizing timeline, conflicts, and your questions into a formal brief...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-surface">
      <div className="flex justify-between items-start mb-8 pb-8 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="verified">Prepared Brief</Badge>
            <span className="text-sm font-mono text-on-surface-variant">{new Date().toLocaleDateString()}</span>
          </div>
          <h1 className="font-heading text-[40px] font-bold leading-tight text-on-surface mb-2">
            Personal Legal Preparation Brief
          </h1>
          <p className="text-on-surface-variant font-sans text-lg">
            Re: {mockCases[0].title}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Section 1: Summary */}
        <Card className="border-none shadow-level-1 overflow-visible">
          <CardHeader 
            className="cursor-pointer bg-white hover:bg-surface-container-low transition-colors rounded-t-md border-b-0"
            onClick={() => toggleSection('summary')}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">1. Executive Summary</CardTitle>
              {expandedSection === 'summary' ? <ChevronUp className="w-5 h-5 text-on-surface-variant" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
            </div>
          </CardHeader>
          {expandedSection === 'summary' && (
            <CardContent className="p-6 pt-0 bg-white rounded-b-md text-on-surface leading-relaxed border-t border-outline-variant/30">
              <p className="mt-4">
                The client is involved in an employment dispute regarding their termination. The primary goals are to understand severance rights and resolve conflicting notice period terms found in the provided documentation. LegalLens has analyzed 4 documents and identified critical discrepancies that require legal review before proceeding with any severance negotiations.
              </p>
            </CardContent>
          )}
        </Card>

        {/* Section 2: Evidentiary Conflicts */}
        <Card className="border-none shadow-level-1 overflow-visible">
          <CardHeader 
            className="cursor-pointer bg-white hover:bg-surface-container-low transition-colors rounded-t-md border-b-0"
            onClick={() => toggleSection('conflicts')}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                2. Identified Conflicts <Badge variant="conflict" className="ml-2">1 High Priority</Badge>
              </CardTitle>
              {expandedSection === 'conflicts' ? <ChevronUp className="w-5 h-5 text-on-surface-variant" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
            </div>
          </CardHeader>
          {expandedSection === 'conflicts' && (
            <CardContent className="p-6 pt-0 bg-white rounded-b-md border-t border-outline-variant/30">
              <div className="mt-4 space-y-6">
                {mockConflicts.map(c => (
                  <div key={c.id} className="bg-error-container/5 border border-error-container p-5 rounded">
                    <h4 className="font-heading font-semibold text-on-surface mb-2">{c.title}</h4>
                    <p className="text-sm text-on-surface-variant mb-4">{c.description}</p>
                    <div className="flex gap-4">
                      {c.sources.map((s, i) => (
                        <div key={i} className="flex-1 bg-white p-3 border border-outline-variant/50 rounded shadow-sm">
                          <CitationToken documentName={s.documentName} page={s.page} clause={s.clause} className="mb-2" />
                          <p className="text-sm font-medium">"{s.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Section 3: Missing Information */}
        <Card className="border-none shadow-level-1 overflow-visible">
          <CardHeader 
            className="cursor-pointer bg-white hover:bg-surface-container-low transition-colors rounded-t-md border-b-0"
            onClick={() => toggleSection('missing')}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                3. Missing Information <Badge variant="review" className="ml-2">1 Item</Badge>
              </CardTitle>
              {expandedSection === 'missing' ? <ChevronUp className="w-5 h-5 text-on-surface-variant" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
            </div>
          </CardHeader>
          {expandedSection === 'missing' && (
            <CardContent className="p-6 pt-0 bg-white rounded-b-md border-t border-outline-variant/30">
              <ul className="mt-4 space-y-3">
                <li className="flex gap-3 text-on-surface">
                  <div className="w-2 h-2 rounded-full bg-[#D97706] mt-2 flex-shrink-0"></div>
                  <span>Employee Handbook referenced in the Employment Agreement but not uploaded. This may contain critical policies regarding severance and termination protocols.</span>
                </li>
              </ul>
            </CardContent>
          )}
        </Card>
      </div>

      <div className="flex justify-between mt-12 pt-6 border-t border-outline-variant/30">
        <Button variant="secondary" onClick={() => navigate(`/case/${caseId}/questions`)}>
          Back to Questions
        </Button>
        <Button onClick={() => navigate(`/case/${caseId}/handoff`)}>
          Proceed to Professional Handoff
        </Button>
      </div>
    </div>
  );
}
