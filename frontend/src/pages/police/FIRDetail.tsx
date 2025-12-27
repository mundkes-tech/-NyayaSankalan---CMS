import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  User, 
  MapPin, 
  Calendar,
  CheckCircle,
  Eye,
  Download,
  Edit
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getFIRs, getCases } from '../../utils/localStorage';
import { FIR, Case } from '../../types';
import StatusBadge from '../../components/UI/StatusBadge';

const FIRDetail: React.FC = () => {
  const { firId } = useParams<{ firId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rolePath = user?.role ? (user.role === 'court_clerk' ? 'clerk' : user.role) : 'police';
  
  const allFIRs = getFIRs();
  const allCases = getCases();
  
  const currentFIR = allFIRs.find(f => f.id === firId);
  const relatedCase = allCases.find(c => c.firId === firId);
  
  if (!currentFIR) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-bold text-white">FIR Not Found</h1>
        </div>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">The requested FIR could not be found.</p>
          <button 
            onClick={() => navigate('/documents')} // Assuming documents page lists FIRs
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEdit = user?.role === 'police' && currentFIR.status === 'draft';
  const canView = ['police', 'sho', 'court_clerk', 'judge'].includes(user?.role || '');

  const getActionButtons = () => {
    return (
      <div className="flex flex-wrap gap-2">
        {canEdit && (
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700">
            <Edit className="h-4 w-4 mr-1" />
            Edit FIR
          </button>
        )}
        
        <Link 
          to={`/${rolePath}/documents?firId=${currentFIR.id}`}
          className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <FileText className="h-4 w-4 mr-1" />
          View Documents
        </Link>
        
        {relatedCase && (
          <Link 
            to={`/cases/${relatedCase.id}`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Case
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
                onClick={() => navigate('/documents')}
                className="inline-flex items-center text-gray-400 hover:text-white mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-white">{currentFIR.title}</h1>
            </div>
            <p className="text-gray-400 mt-1">FIR #{currentFIR.firNumber}</p>
          </div>
          <StatusBadge status={currentFIR.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FIR Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* FIR Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">FIR Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">FIR Number</p>
                <p className="text-white font-medium">{currentFIR.firNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <div>
                  <StatusBadge status={currentFIR.status} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Officer Name</p>
                <p className="text-white font-medium">{currentFIR.officerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Station</p>
                <p className="text-white font-medium">{currentFIR.station}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Date & Time of Incident</p>
                <p className="text-white font-medium">{formatDate(currentFIR.dateTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Created</p>
                <p className="text-white font-medium">{formatDate(currentFIR.createdAt)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-400">Description</p>
                <p className="text-white">{currentFIR.description}</p>
              </div>
            </div>
          </div>

          {/* Complainant & Accused Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Parties Involved</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-white mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2 text-blue-400" />
                  Complainant
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white font-medium">{currentFIR.complainant}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-white mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2 text-red-400" />
                  Accused
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white font-medium">{currentFIR.accused}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">Incident Details</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-white font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {currentFIR.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Date & Time</p>
                <p className="text-white font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDate(currentFIR.dateTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Description</p>
                <p className="text-white">{currentFIR.description}</p>
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

          {/* FIR Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">FIR Status</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                {currentFIR.status !== 'draft' ? (
                  <>
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-sm text-gray-300">Drafted</span>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-3"></div>
                    <span className="text-sm text-gray-300">Drafted</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                {currentFIR.status === 'registered' || currentFIR.status === 'case_created' ? (
                  <>
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-sm text-gray-300">Registered</span>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full bg-gray-600 mr-3"></div>
                    <span className="text-sm text-gray-300">Registered</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center">
                {currentFIR.status === 'case_created' ? (
                  <>
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-sm text-gray-300">Case Created</span>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full bg-gray-600 mr-3"></div>
                    <span className="text-sm text-gray-300">Case Created</span>
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

export default FIRDetail;