import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export default function SituationIntake() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [situation, setSituation] = useState('');
  const [goal, setGoal] = useState('');

  const categories = [
    'Employment', 'Real Estate', 'Family Law', 'Corporate', 'Immigration', 'Intellectual Property'
  ];

  const handleContinue = () => {
    // Navigate to document workspace for a new mock case
    navigate('/case/c1/documents');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-[32px] font-bold leading-10 text-on-surface mb-2">
          New Case Intake
        </h1>
        <p className="text-on-surface-variant font-sans text-[16px]">
          Describe the situation so LegalLens can focus its analysis.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-8 space-y-8">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-3 font-heading">
              1. What area of law does this relate to?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`border rounded-md px-4 py-3 text-sm text-left transition-colors ${
                    category === c 
                      ? 'border-primary bg-primary-container/10 text-primary font-medium' 
                      : 'border-outline-variant text-on-surface-variant hover:border-outline'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-3 font-heading">
              2. Describe the situation and timeline
            </label>
            <textarea 
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="E.g., I received an offer letter in January 2026, but the termination notice I just received has conflicting terms..."
              className="w-full border border-outline-variant rounded-md p-4 min-h-[160px] text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-3 font-heading">
              3. What is your primary goal?
            </label>
            <input 
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="E.g., Understand my severance rights"
              className="w-full border border-outline-variant rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        <Button 
          onClick={handleContinue}
          disabled={!category || !situation || !goal}
        >
          Continue to Documents
        </Button>
      </div>
    </div>
  );
}
