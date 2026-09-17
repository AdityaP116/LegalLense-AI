import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CitationToken } from '../components/ui/CitationToken';
import { mockConflicts, mockMissingInformation, mockCases } from '../data/mockData';
import { AlertCircle, ChevronRight, FileSearch, ShieldAlert } from 'lucide-react';

export default function AnalysisDashboard() {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-on-surface-variant p-8">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="font-heading text-xl font-bold text-on-surface mb-2">Analyzing Documents</h2>
        <p>LegalLens is extracting clauses, identifying entities, and mapping relationships...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="verified">Analysis Complete</Badge>
          <span className="text-sm text-on-surface-variant">Case: {mockCases[0].title}</span>
        </div>
        <h1 className="font-heading text-[32px] font-bold leading-10 text-on-surface">
          Analysis Dashboard
        </h1>
        <p className="text-on-surface-variant font-sans text-[16px] mt-2 max-w-2xl">
          We found {mockConflicts.length} conflict and {mockMissingInformation.length} missing information across your uploaded documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column - Conflicts & Issues */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h2 className="font-heading text-[24px] font-semibold text-on-surface mb-4 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-error" /> Conflicts Detected
            </h2>
            <div className="space-y-4">
              {mockConflicts.map(conflict => (
                <Card key={conflict.id} className="border-error-container bg-error-container/10">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge variant="conflict" className="mb-3">High Priority Conflict</Badge>
                        <h3 className="font-heading text-lg font-semibold text-on-surface mb-1">
                          {conflict.title}
                        </h3>
                        <p className="text-on-surface-variant text-sm">{conflict.description}</p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/case/${caseId}/evidence`)}>
                        Review Evidence
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {conflict.sources.map((source, idx) => (
                        <div key={idx} className="bg-surface p-4 rounded border border-outline-variant/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-on-surface-variant">Source {idx + 1}</span>
                            <CitationToken 
                              documentName={source.documentName} 
                              page={source.page} 
                              clause={source.clause} 
                              onClick={() => navigate(`/case/${caseId}/evidence`)}
                            />
                          </div>
                          <p className="text-sm text-on-surface font-medium">"{source.text}"</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-[24px] font-semibold text-on-surface mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-[#D97706]" /> Missing Information
            </h2>
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-outline-variant/30">
                  {mockMissingInformation.map((info, idx) => (
                    <li key={idx} className="p-4 flex items-start gap-4 hover:bg-surface-container-low transition-colors">
                      <div className="w-2 h-2 rounded-full bg-[#D97706] mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-on-surface mb-2">{info}</p>
                        <Badge variant="review">Needs Review</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/case/${caseId}/questions`)}>
                        Add to Questions
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Side Column - Navigation & Next Steps */}
        <div className="space-y-6">
          <Card className="bg-primary text-white border-none shadow-level-2">
            <CardContent className="p-6">
              <h3 className="font-heading text-lg font-semibold mb-2">Next Steps</h3>
              <p className="text-primary-fixed mb-6 text-sm leading-relaxed">
                Review the identified conflicts and evidence. Once verified, we can build your timeline and final preparation brief.
              </p>
              <Button 
                variant="secondary" 
                className="w-full justify-between"
                onClick={() => navigate(`/case/${caseId}/timeline`)}
              >
                Continue to Timeline <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-primary" /> Key Findings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-on-surface-variant text-xs mb-1">Notice Period</div>
                  <div className="font-semibold text-on-surface flex justify-between items-center">
                    Conflicted <Badge variant="conflict" className="scale-75 origin-right">High</Badge>
                  </div>
                </div>
                <div className="w-full h-px bg-outline-variant/30"></div>
                <div>
                  <div className="text-on-surface-variant text-xs mb-1">Termination Date</div>
                  <div className="font-semibold text-on-surface flex justify-between items-center">
                    Aug 30, 2026 <Badge variant="verified" className="scale-75 origin-right">Verified</Badge>
                  </div>
                </div>
                <div className="w-full h-px bg-outline-variant/30"></div>
                <div>
                  <div className="text-on-surface-variant text-xs mb-1">Severance Pay</div>
                  <div className="font-semibold text-on-surface flex justify-between items-center">
                    Not Mentioned <Badge variant="missing" className="scale-75 origin-right">Missing</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
