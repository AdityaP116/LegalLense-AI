import { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockDocuments, mockConflicts } from '../data/mockData';
import { FileText, ChevronLeft, ChevronRight, Search, ZoomIn, ZoomOut, Send } from 'lucide-react';

export default function EvidenceViewer() {
  const [selectedDoc, setSelectedDoc] = useState(mockDocuments[0].id);
  const [chatMessage, setChatMessage] = useState('');
  
  const currentDoc = mockDocuments.find(d => d.id === selectedDoc);
  const conflict = mockConflicts[0];

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-surface-container-low">
      
      {/* Left Pane - Documents List */}
      <div className="w-full md:w-[280px] flex-shrink-0 bg-white border-r border-outline-variant/30 flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-outline-variant/30 sticky top-0 bg-white z-10">
          <h2 className="font-heading font-semibold text-on-surface flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Case Documents
          </h2>
        </div>
        <div className="p-2 space-y-1">
          {mockDocuments.map(doc => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                selectedDoc === doc.id 
                  ? 'bg-primary-container/10 text-primary font-medium' 
                  : 'text-on-surface-variant hover:bg-surface hover:text-on-surface'
              }`}
            >
              <FileText className="w-4 h-4 opacity-70" />
              <span className="truncate">{doc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Center Pane - Document Viewer */}
      <div className="flex-1 flex flex-col h-full bg-[#F1F5F9] relative overflow-hidden">
        {/* Viewer Toolbar */}
        <div className="h-14 bg-white border-b border-outline-variant/30 flex items-center justify-between px-4 flex-shrink-0">
          <span className="font-medium text-sm text-on-surface">{currentDoc?.name}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Button variant="ghost" size="sm" className="px-2 h-8"><ZoomOut className="w-4 h-4" /></Button>
              <span className="text-xs font-mono">100%</span>
              <Button variant="ghost" size="sm" className="px-2 h-8"><ZoomIn className="w-4 h-4" /></Button>
            </div>
            <div className="w-px h-4 bg-outline-variant/50"></div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Button variant="ghost" size="sm" className="px-2 h-8"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-xs font-mono">Page 2 / 12</span>
              <Button variant="ghost" size="sm" className="px-2 h-8"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
        
        {/* PDF Placeholder */}
        <div className="flex-1 overflow-auto p-8 flex justify-center">
          <div className="bg-white w-full max-w-[800px] h-[1000px] shadow-level-1 border border-outline-variant/30 relative flex flex-col items-center pt-24 text-outline-variant/50">
            <FileText className="w-24 h-24 mb-4 opacity-50" />
            <p className="font-heading">Document Preview</p>
            
            {/* Highlighted Evidence Area */}
            {selectedDoc === 'd1' && (
              <div className="absolute top-[300px] left-12 right-12 bg-primary/10 border-2 border-primary/50 rounded-sm p-4 cursor-pointer hover:bg-primary/20 transition-colors">
                <div className="absolute -left-3 top-2 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20"></div>
                <p className="text-sm font-medium text-on-surface">5. Notice Period = 30 days</p>
                <div className="mt-2 text-xs font-mono text-primary flex justify-end">Clause 5</div>
              </div>
            )}
            
            {selectedDoc === 'd2' && (
              <div className="absolute top-[450px] left-12 right-12 bg-error/10 border-2 border-error/50 rounded-sm p-4 cursor-pointer hover:bg-error/20 transition-colors">
                <div className="absolute -left-3 top-2 w-2 h-2 rounded-full bg-error ring-4 ring-error/20"></div>
                <p className="text-sm font-medium text-on-surface">12. Notice Period = 90 days</p>
                <div className="mt-2 text-xs font-mono text-error flex justify-end">Clause 12</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Pane - AI Chat & Evidence Details */}
      <div className="w-full md:w-[360px] flex-shrink-0 bg-white border-l border-outline-variant/30 flex flex-col h-full z-10 shadow-[-4px_0_12px_rgba(15,23,42,0.02)]">
        <div className="p-4 border-b border-outline-variant/30">
          <h2 className="font-heading font-semibold text-on-surface flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> Evidence & Analysis
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <Card className="border-error-container shadow-none bg-error-container/5">
            <CardContent className="p-4">
              <Badge variant="conflict" className="mb-2">Document Conflict</Badge>
              <h3 className="font-heading text-sm font-semibold text-on-surface mb-2">{conflict.title}</h3>
              <p className="text-xs text-on-surface-variant mb-4">{conflict.description}</p>
              
              <div className="space-y-3">
                {conflict.sources.map((src, idx) => (
                  <div key={idx} className={`p-2 rounded border text-xs cursor-pointer ${src.documentId === selectedDoc ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-outline-variant/50 bg-surface'}`} onClick={() => setSelectedDoc(src.documentId)}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-on-surface truncate pr-2">{src.documentName}</span>
                      <span className="font-mono text-[10px] text-on-surface-variant flex-shrink-0">p. {src.page}</span>
                    </div>
                    <div className="text-on-surface-variant italic">"{src.text}"</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4 pt-4 border-t border-outline-variant/30">
            <h3 className="font-heading text-sm font-semibold text-on-surface">Ask Follow-up</h3>
            
            <div className="bg-surface p-3 rounded-lg border border-outline-variant/50 text-sm">
              <div className="font-semibold text-primary mb-1">LegalLens AI</div>
              <p className="text-on-surface-variant leading-relaxed">
                The offer letter and employment agreement contain conflicting notice periods. Would you like me to flag this as a question for preparation?
              </p>
            </div>
            
            <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 text-sm ml-8 text-right">
              <div className="font-semibold text-on-surface mb-1">You</div>
              <p className="text-on-surface-variant leading-relaxed">
                Yes, and check if there is any severance clause.
              </p>
            </div>
            
            <div className="bg-surface p-3 rounded-lg border border-outline-variant/50 text-sm">
              <div className="font-semibold text-primary mb-1 flex items-center gap-2">
                LegalLens AI
                <Badge variant="missing" className="scale-75 origin-left">Missing Info</Badge>
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                I have flagged the notice period conflict. Regarding severance, there is no mention of severance pay in any of the uploaded documents.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-outline-variant/30 bg-surface">
          <div className="relative">
            <input 
              type="text" 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask about this document..."
              className="w-full bg-white border border-outline-variant rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-primary rounded-full hover:bg-primary/10 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
