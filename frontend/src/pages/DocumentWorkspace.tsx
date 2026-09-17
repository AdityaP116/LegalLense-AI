import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { mockDocuments } from '../data/mockData';
import { UploadCloud, File, Trash2, CheckCircle2, Play } from 'lucide-react';

export default function DocumentWorkspace() {
  const navigate = useNavigate();
  const { caseId } = useParams();
  const [documents, setDocuments] = useState(mockDocuments);
  const [isUploading, setIsUploading] = useState(false);

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setDocuments(prev => [
        ...prev,
        { id: `d${Date.now()}`, name: 'New Evidence.pdf', type: 'application/pdf', size: '3.4 MB', uploadDate: new Date().toISOString().split('T')[0] }
      ]);
      setIsUploading(false);
    }, 1500);
  };

  const handleRemove = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleAnalyze = () => {
    navigate(`/case/${caseId}/analysis`);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-heading text-[32px] font-bold leading-10 text-on-surface mb-2">
            Document Workspace
          </h1>
          <p className="text-on-surface-variant font-sans text-[16px]">
            Upload contracts, notices, and evidence for AI extraction.
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={documents.length === 0} className="gap-2">
          <Play className="w-4 h-4" /> Analyze Documents
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-dashed border-2 border-outline-variant bg-surface-container-low shadow-none hover:border-primary/50 transition-colors">
            <CardContent className="p-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary mb-4 shadow-sm border border-outline-variant/30">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-on-surface mb-2">
                Drag and drop documents here
              </h3>
              <p className="text-on-surface-variant text-sm mb-6 max-w-sm">
                Supported formats: PDF, DOCX, TXT. Max file size: 50MB.
              </p>
              <Button variant="secondary" onClick={handleSimulateUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Select Files'}
              </Button>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-heading text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
              Uploaded Documents 
              <span className="bg-surface-container-high text-on-surface-variant text-xs py-0.5 px-2 rounded-full">
                {documents.length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {documents.map(doc => (
                <Card key={doc.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-container/10 rounded-md flex items-center justify-center text-primary flex-shrink-0">
                      <File className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{doc.name}</p>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1">
                        <span>{doc.size}</span>
                        <span>&bull;</span>
                        <span>{doc.uploadDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#059669] flex items-center gap-1 font-medium bg-[#ECFDF5] px-2 py-1 rounded">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(doc.id)} className="text-on-surface-variant hover:text-error hover:bg-error-container/30 px-2 h-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {documents.length === 0 && (
                <div className="text-center py-8 text-on-surface-variant border border-dashed rounded-md bg-surface-container-low/50">
                  No documents uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <Card className="bg-surface-container sticky top-8">
            <CardContent className="p-6">
              <h3 className="font-heading text-lg font-semibold text-on-surface mb-4">Workspace Summary</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between pb-3 border-b border-outline-variant/30">
                  <span className="text-on-surface-variant">Total Files</span>
                  <span className="font-semibold text-on-surface">{documents.length}</span>
                </div>
                <div className="flex justify-between pb-3 border-b border-outline-variant/30">
                  <span className="text-on-surface-variant">Status</span>
                  <span className="font-semibold text-[#059669]">Ready for Analysis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Est. Processing Time</span>
                  <span className="font-semibold text-on-surface">~45 seconds</span>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-outline-variant/30">
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                  LegalLens will extract clauses, identify entities, and map relationships across all uploaded documents.
                </p>
                <Button className="w-full justify-center" onClick={handleAnalyze} disabled={documents.length === 0}>
                  Run Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
