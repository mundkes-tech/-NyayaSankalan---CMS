import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  User, 
  Download, 
  Eye, 
  Upload,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCases, getFIRs } from '../../utils/localStorage';
import { Case, FIR, Document } from '../../types';
import StatusBadge from '../../components/UI/StatusBadge';

const EvidenceList: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rolePath = user?.role ? (user.role === 'court_clerk' ? 'clerk' : user.role) : 'police';
  
  const allCases = getCases();
  const allFIRs = getFIRs();
  
  const currentCase = allCases.find(c => c.id === caseId);
  const relatedFIR = currentCase ? allFIRs.find(f => f.id === currentCase.firId) : null;
  
  if (!currentCase) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-bold text-white">Case Not Found</h1>
        </div>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">The requested case could not be found.</p>
          <button 
            onClick={() => navigate(`/${rolePath}/cases`)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </button>
        </div>
      </div>
    );
  }
  
  // Get all evidence documents for the case
  const evidenceDocuments = currentCase.documents.filter(doc => doc.type === 'evidence');
  
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

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-gray-400 hover:text-white mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-white">Evidence List</h1>
            </div>
            <p className="text-gray-400 mt-1">Case #{currentCase.caseNumber} | {currentCase.title}</p>
          </div>
          <StatusBadge status={currentCase.status} />
        </div>
      </div>

      {/* Evidence Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Evidence</p>
              <p className="text-2xl font-semibold text-white">{evidenceDocuments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-600">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Uploaded</p>
              <p className="text-2xl font-semibold text-white">
                {evidenceDocuments.filter(e => e.status === 'uploaded').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-600">
              <Filter className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Pending</p>
              <p className="text-2xl font-semibold text-white">
                {evidenceDocuments.filter(e => e.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-white">Evidence Documents</h2>
            <div className="flex space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search evidence..."
                  className="block pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Evidence Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {evidenceDocuments.length > 0 ? (
                evidenceDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{doc.name}</div>
                        <div className="text-sm text-gray-400">{doc.fileName}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {doc.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {doc.uploadedBy}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(doc.uploadedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {canDownload && (
                          <button className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </button>
                        )}
                        {canView && (
                          <Link 
                            to={`/documents/${doc.id}`}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No evidence documents found</p>
                      <p className="text-sm">Upload evidence documents to this case</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedFIR && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Related FIR</h3>
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

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Case Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Link 
              to={`/${rolePath}/cases/${currentCase.id}`}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <FileText className="h-4 w-4 mr-1" />
              View Case
            </Link>
            <Link 
              to={`/${rolePath}/documents?caseId=${currentCase.id}`}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <FileText className="h-4 w-4 mr-1" />
              All Documents
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceList;