import { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CheckSquare, Trash2, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function Questions() {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [questions, setQuestions] = useState([
    { id: 'q1', text: 'If my offer letter says 30 days notice but the employment agreement says 90 days, which one legally applies?', status: 'pending', source: 'Analysis Dashboard' },
    { id: 'q2', text: 'I never signed an employee handbook. Can they enforce policies from it?', status: 'pending', source: 'Missing Info' },
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setQuestions([...questions, { id: `q${Date.now()}`, text: newQuestion, status: 'pending', source: 'User Added' }]);
    setNewQuestion('');
  };

  const toggleStatus = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, status: q.status === 'pending' ? 'discussed' : 'pending' } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-heading text-[32px] font-bold leading-10 text-on-surface mb-2">
            Questions to Prepare
          </h1>
          <p className="text-on-surface-variant font-sans text-[16px]">
            Review AI-generated questions based on document conflicts, and add your own.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
            placeholder="E.g., What happens to my stock options if I resign?"
            className="flex-1 border border-outline-variant rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <Button onClick={handleAddQuestion} disabled={!newQuestion.trim()}>
            <Plus className="w-4 h-4 mr-2" /> Add Question
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <Card key={q.id} className={q.status === 'discussed' ? 'opacity-60 bg-surface-container-low' : ''}>
            <CardContent className="p-5 flex items-start gap-4">
              <button 
                onClick={() => toggleStatus(q.id)}
                className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  q.status === 'discussed' 
                    ? 'bg-[#059669] text-white' 
                    : 'border-2 border-outline hover:border-primary'
                }`}
              >
                {q.status === 'discussed' && <CheckSquare className="w-4 h-4" />}
              </button>
              
              <div className="flex-1">
                <p className={`text-on-surface font-medium ${q.status === 'discussed' ? 'line-through text-on-surface-variant' : ''}`}>
                  {q.text}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={q.source === 'User Added' ? 'verified' : 'review'}>
                    Source: {q.source}
                  </Badge>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)} className="text-on-surface-variant hover:text-error hover:bg-error-container/30 px-2 h-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-12 pt-6 border-t border-outline-variant/30">
        <Button variant="secondary" onClick={() => navigate(`/case/${caseId}/timeline`)}>
          Back to Timeline
        </Button>
        <Button onClick={() => navigate(`/case/${caseId}/brief`)}>
          Generate Brief
        </Button>
      </div>
    </div>
  );
}
