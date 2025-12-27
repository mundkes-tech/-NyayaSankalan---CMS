import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Eye, 
  User, 
  Clock, 
  Upload,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCases, getFIRs, getAuditLogs } from '../../utils/localStorage';
import { Document, Case, FIR } from '../../types';
import StatusBadge from '../../components/UI/StatusBadge';

const DocumentDetail: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rolePath = user?.role ? (user.role === 'court_clerk' ? 'clerk' : user.role) : 'police';
  
  // For this implementation, we'll simulate document data
  // In a real app, we would retrieve documents from localStorage
  // For now, we'll create mock data based on URL parameters
  
  // Simulating document data - in a real app this would come from localStorage
  const mockDocument: Document = {
    id: docId || 'mock-doc',
    name: 'Charge Sheet - The State vs John Doe',
    type: 'charge_sheet',
    fileName: 'charge_sheet_2024_001.pdf',
    fileSize: 1024 * 1024 * 2.5, // 2.5MB
    uploadedBy: 'Officer Smith',
    uploadedAt: new Date().toISOString(),
    required: true,
    status: 'uploaded'
  };
  
  const allCases = getCases();
  const allFIRs = getFIRs();
  
  // Find related case and FIR if available
  const relatedCase = allCases.find(c => 
    c.documents && c.documents.some(d => d.id === docId)
  );
  const relatedFIR = relatedCase ? allFIRs.find(f => f.id === relatedCase.firId) : null;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canView = ['police', 'sho', 'court_clerk', 'judge'].includes(user?.role || '');
  const canDownload = user?.role !== 'judge'; // Judges have read-only access

  const getActionButtons = () => {
    return (
      <div className="flex flex-wrap gap-2">
        {canDownload && (
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700">
            <Download className="h-4 w-4 mr-1" />
            Download
          </button>
        )}
        
        {canView && (
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700">
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </button>
        )}
        
        {relatedCase && (
          <Link 
            to={`/${rolePath}/cases/${relatedCase.id}`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <FileText className="h-4 w-4 mr-1" />
            View Case
          </Link>
        )}
        
        {relatedFIR && (
          <Link 
            to={`/fir/${relatedFIR.id}`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <FileText className="h-4 w-4 mr-1" />
            View FIR
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <button 
                onClick={() => navigate(`/${rolePath}/documents`)}
                className="inline-flex items-center text-gray-400 hover:text-white mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-white">{mockDocument.name}</h1>
            </div>
            <p className="text-gray-400 mt-1">Document #{mockDocument.id}</p>
          </div>
          <StatusBadge status={mockDocument.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Preview */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Document Preview</h2>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center h-96">
              <FileText className="h-16 w-16 text-gray-500 mb-4" />
              <p className="text-gray-400 mb-2">Document Preview</p>
              <p className="text-sm text-gray-500 text-center">
                This is a preview of the document. In a real application, this would show the actual document content.
              </p>
              <div className="mt-4 flex space-x-2">
                {canDownload && (
                  <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Download className="h-4 w-4 mr-1" />
                    Download Full Document
                  </button>
                )}
                {canView && (
                  <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Eye className="h-4 w-4 mr-1" />
                    View Full Document
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Document Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Document Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Document Name</p>
                <p className="text-white font-medium">{mockDocument.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">File Name</p>
                <p className="text-white font-medium">{mockDocument.fileName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Type</p>
                <p className="text-white font-medium">
                  {mockDocument.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">File Size</p>
                <p className="text-white font-medium">{formatFileSize(mockDocument.fileSize)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Uploaded By</p>
                <p className="text-white font-medium flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  {mockDocument.uploadedBy}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Uploaded At</p>
                <p className="text-white font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDate(mockDocument.uploadedAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Required</p>
                <p className="text-white font-medium">
                  {mockDocument.required ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <div>
                  <StatusBadge status={mockDocument.status} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Actions</h2>
            {getActionButtons()}
          </div>

          {/* Related Case */}
          {relatedCase && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">Related Case</h2>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-white">{relatedCase.title}</p>
                  <p className="text-xs text-gray-400 mb-1">Case #{relatedCase.caseNumber}</p>
                  <StatusBadge status={relatedCase.status} />
                </div>
                <Link 
                  to={`/cases/${relatedCase.id}`}
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
                >
                  View Case Details
                  <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                </Link>
              </div>
            </div>
          )}

          {/* Related FIR */}
          {relatedFIR && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">Related FIR</h2>
              <div className="space-y-3">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-white">{relatedFIR.title}</p>
                  <p className="text-xs text-gray-400 mb-1">FIR #{relatedFIR.firNumber}</p>
                  <StatusBadge status={relatedFIR.status} />
                </div>
                <Link 
                  to={`/fir/${relatedFIR.id}`}
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
                >
                  View FIR Details
                  <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                </Link>
              </div>
            </div>
          )}

          {/* Document Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Document Status</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                {mockDocument.status !== 'pending' ? (
                  <>
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-sm text-gray-300">Uploaded</span>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-3"></div>
                    <span className="text-sm text-gray-300">Uploaded</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                {mockDocument.status === 'verified' ? (
                  <>
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-sm text-gray-300">Verified</span>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full bg-gray-600 mr-3"></div>
                    <span className="text-sm text-gray-300">Verified</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;