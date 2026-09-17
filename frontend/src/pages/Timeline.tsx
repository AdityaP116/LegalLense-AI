import { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { mockTimeline, mockCases } from '../data/mockData';
import { ArrowRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Timeline() {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [filter, setFilter] = useState<'all' | 'documents' | 'events'>('all');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-on-surface-variant">Case: {mockCases[0].title}</span>
          </div>
          <h1 className="font-heading text-[32px] font-bold leading-10 text-on-surface mb-2">
            Case Timeline
          </h1>
          <p className="text-on-surface-variant font-sans text-[16px]">
            Chronological reconstruction based on your uploaded documents.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('all')}>
            All
          </Button>
          <Button variant={filter === 'documents' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('documents')}>
            Documents
          </Button>
          <Button variant={filter === 'events' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('events')}>
            Events
          </Button>
        </div>
      </div>

      <div className="relative border-l-2 border-outline-variant/50 ml-[120px] pb-12">
        {mockTimeline.map((event) => (
          <div key={event.id} className="relative mb-8 last:mb-0 group cursor-pointer">
            {/* Timeline node */}
            <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-white border-2 border-primary group-hover:bg-primary transition-colors z-10 shadow-sm" />
            
            {/* Date label (positioned to the left of the line) */}
            <div className="absolute -left-[120px] top-3.5 w-[100px] text-right pr-4">
              <span className="font-mono text-sm font-semibold text-primary">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            
            {/* Event content */}
            <div className="pl-8">
              <Card className="group-hover:border-primary/50 group-hover:shadow-level-2 transition-all">
                <CardContent className="p-5 flex justify-between items-center">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-on-surface mb-1">
                      {event.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm">
                      {event.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="hidden group-hover:flex gap-1 text-primary">
                    View Source <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-12 pt-6 border-t border-outline-variant/30">
        <Button variant="secondary" onClick={() => navigate(`/case/${caseId}/evidence`)}>
          Back to Evidence
        </Button>
        <Button onClick={() => navigate(`/case/${caseId}/questions`)}>
          Continue to Questions
        </Button>
      </div>
    </div>
  );
}
