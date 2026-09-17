import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { mockDocuments, mockConflicts } from '../data/mockData';
import { Briefcase, Send, Download, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfessionalHandoff() {
  const navigate = useNavigate();
  
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-8">
        <div>
          <h1 className="font-heading text-[32px] font-bold leading-10 text-on-surface mb-2">
            Professional Handoff
          </h1>
          <p className="text-on-surface-variant font-sans text-[16px] max-w-2xl">
            Your case is packaged and ready for legal counsel. Send this secure package to your attorney to save them hours of initial discovery and document review.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" /> Download Package
          </Button>
          <Button className="gap-2 bg-[#059669] hover:bg-[#047857]">
            <Send className="w-4 h-4" /> Secure Transfer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Package Contents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">Legal Preparation Brief</p>
                    <p className="text-xs text-on-surface-variant">Executive summary, timeline, and conflict analysis.</p>
                  </div>
                </div>
                <Badge variant="verified">Included</Badge>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                    <span className="font-heading font-bold">{mockDocuments.length}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">Source Documents</p>
                    <p className="text-xs text-on-surface-variant">All original PDFs, cleanly indexed and OCR'd.</p>
                  </div>
                </div>
                <Badge variant="verified">Included</Badge>
              </div>

              <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-error/10 text-error rounded-md flex items-center justify-center">
                    <span className="font-heading font-bold">{mockConflicts.length}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">Evidentiary Conflicts</p>
                    <p className="text-xs text-on-surface-variant">Direct links to conflicting clauses across documents.</p>
                  </div>
                </div>
                <Badge variant="verified">Included</Badge>
              </div>

            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-surface-container-low border-none shadow-none">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-outline-variant/30 mb-4 text-on-surface-variant">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-on-surface mb-2">Secure Attorney Transfer</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                Send a secure, expiring link directly to your attorney's email. They will gain access to the LegalLens read-only dashboard for this case.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Attorney Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input 
                      type="email" 
                      placeholder="counsel@lawfirm.com" 
                      className="w-full pl-9 pr-3 py-2 text-sm border border-outline-variant rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <Button className="w-full justify-center">Send Secure Link</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
      </div>
    </div>
  );
}
