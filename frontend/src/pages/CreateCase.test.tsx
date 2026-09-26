import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CreateCase } from './CreateCase';
import { caseService } from '@/services/caseService';
import { documentService } from '@/services/documentService';
import { analysisService } from '@/services/analysisService';
import * as ReactRouter from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

vi.mock('@/services/caseService', () => ({
  caseService: {
    create: vi.fn(),
  },
}));

vi.mock('@/services/documentService', () => ({
  documentService: {
    upload: vi.fn(),
  },
}));

vi.mock('@/services/analysisService', () => ({
  analysisService: {
    triggerAnalysis: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('CreateCase Component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (ReactRouter.useNavigate as any).mockReturnValue(mockNavigate);
  });

  it('renders form correctly', () => {
    render(
      <BrowserRouter>
        <CreateCase />
      </BrowserRouter>
    );
    expect(screen.getByText(/Create New Case/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Case Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Describe your situation/i)).toBeInTheDocument();
  });

  it('shows error if narrative is empty on submit', async () => {
    render(
      <BrowserRouter>
        <CreateCase />
      </BrowserRouter>
    );

    // Check consents to enable the button
    fireEvent.click(screen.getByLabelText(/Data Privacy Consent/i));
    fireEvent.click(screen.getByLabelText(/AI Processing Consent/i));

    const submitBtn = screen.getByRole('button', { name: /Create Case & Analyze/i });
    fireEvent.click(submitBtn);

    // Initial title state is 'New Case' so that passes. Next check is narrative.
    await waitFor(() => {
      expect(screen.getByText(/Please describe your situation in more detail/i)).toBeInTheDocument();
    });
  });

  it('allows form submission when filled correctly', async () => {
    (caseService.create as any).mockResolvedValue({ id: 'case-123' });
    (documentService.upload as any).mockResolvedValue(true);
    (analysisService.triggerAnalysis as any).mockResolvedValue(true);

    render(
      <BrowserRouter>
        <CreateCase />
      </BrowserRouter>
    );

    // Fill title
    fireEvent.change(screen.getByLabelText(/Case Title/i), { target: { value: 'My Case' } });
    
    // Fill narrative
    fireEvent.change(screen.getByLabelText(/Describe your situation/i), { 
      target: { value: 'This is a detailed narrative that is at least 10 chars.' } 
    });

    // Mock file upload
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);

    // Check consents
    fireEvent.click(screen.getByLabelText(/Data Privacy Consent/i));
    fireEvent.click(screen.getByLabelText(/AI Processing Consent/i));

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Create Case & Analyze/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(caseService.create).toHaveBeenCalled();
      expect(documentService.upload).toHaveBeenCalled();
      expect(analysisService.triggerAnalysis).toHaveBeenCalledWith('case-123');
      expect(mockNavigate).toHaveBeenCalledWith('/case/case-123');
    });
  });
});
