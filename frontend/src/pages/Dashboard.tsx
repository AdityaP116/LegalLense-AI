import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockCases } from '../data/mockData';
import { Plus, Briefcase, ChevronRight, Clock, FileText } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-heading text-[32px] font-bold leading-10 tracking-tight text-on-surface mb-2">
            Welcome back
          </h1>
          <p className="text-on-surface-variant font-sans text-[16px]">
            You have {mockCases.length} active case{mockCases.length !== 1 && 's'} in progress.
          </p>
        </div>
        <Button onClick={() => navigate('/case/new')} className="gap-2">
          <Plus className="w-4 h-4" /> Start New Case
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-surface-container-low border-none shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded bg-primary-container/10 flex items-center justify-center text-primary">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface-variant font-heading">Total Cases</p>
                <p className="text-[24px] font-bold text-on-surface font-heading">{mockCases.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-surface-container-low border-none shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded bg-[#FFFBEB] flex items-center justify-center text-[#D97706]">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface-variant font-heading">Needs Review</p>
                <p className="text-[24px] font-bold text-on-surface font-heading">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-container-low border-none shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface-variant font-heading">Documents Analyzed</p>
                <p className="text-[24px] font-bold text-on-surface font-heading">4</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="font-heading text-[24px] font-semibold text-on-surface mb-4">Recent Cases</h2>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="w-1/3 h-6 bg-surface-container-highest rounded"></div>
                <div className="w-24 h-6 bg-surface-container-highest rounded-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : mockCases.length > 0 ? (
        <div className="space-y-4">
          {mockCases.map((c) => (
            <Card 
              key={c.id} 
              className="hover:border-primary/50 hover:shadow-level-2 transition-all cursor-pointer group"
              onClick={() => navigate(`/case/${c.id}/analysis`)}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-[18px] font-semibold text-on-surface mb-1 flex items-center gap-3">
                    {c.title}
                    {c.status === 'active' && <Badge variant="verified">Active</Badge>}
                  </h3>
                  <div className="text-sm text-on-surface-variant flex items-center gap-4">
                    <span>{c.category}</span>
                    <span>&bull;</span>
                    <span>Last updated: {c.lastUpdated}</span>
                  </div>
                </div>
                <Button variant="ghost" className="group-hover:bg-primary-container/10 group-hover:text-primary rounded-full w-10 h-10 p-0 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-surface border-dashed border-2">
          <CardContent className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4 text-outline">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-on-surface mb-2">No active cases</h3>
            <p className="text-on-surface-variant max-w-md mx-auto mb-6">
              Get started by creating a new case and uploading your legal documents for AI-powered analysis.
            </p>
            <Button onClick={() => navigate('/case/new')}>Create First Case</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
