import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SituationIntake from './pages/SituationIntake';
import DocumentWorkspace from './pages/DocumentWorkspace';
import AnalysisDashboard from './pages/AnalysisDashboard';
import EvidenceViewer from './pages/EvidenceViewer';

import Timeline from './pages/Timeline';
import Questions from './pages/Questions';
import Brief from './pages/Brief';
import ProfessionalHandoff from './pages/ProfessionalHandoff';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/case/new" element={<SituationIntake />} />
          <Route path="/case/:caseId/documents" element={<DocumentWorkspace />} />
          <Route path="/case/:caseId/analysis" element={<AnalysisDashboard />} />
          <Route path="/case/:caseId/evidence" element={<EvidenceViewer />} />
          <Route path="/case/:caseId/timeline" element={<Timeline />} />
          <Route path="/case/:caseId/questions" element={<Questions />} />
          <Route path="/case/:caseId/brief" element={<Brief />} />
          <Route path="/case/:caseId/handoff" element={<ProfessionalHandoff />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
