import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  UserCheck, 
  Search, 
  Filter,
  User,
  Clock,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCases, getFIRs, getPoliceOfficers, updateCase, addAuditLog } from '../../utils/localStorage';
import { Case, FIR, User as UserType } from '../../types';
import StatusBadge from '../../components/UI/StatusBadge';

const AssignCase: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  
  const allCases = getCases();
  const allFIRs = getFIRs();
  const allPoliceOfficers = getPoliceOfficers().filter(officer => officer.role === 'police');
  
  const currentCase = allCases.find(c => c.id === caseId);
  const relatedFIR = currentCase ? allFIRs.find(f => f.id === currentCase.firId) : null;
  
  useEffect(() => {
    if (!user || user.role !== 'sho') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
            onClick={() => navigate('/cases')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </button>
        </div>
      </div>
    );
  }

  const filteredOfficers = allPoliceOfficers.filter(officer => 
    officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.badge?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = () => {
    if (!selectedOfficer) {
      alert('Please select an officer to assign the case to');
      return;
    }

    // Find the selected officer details
    const officer = allPoliceOfficers.find(o => o.id === selectedOfficer);
    
    if (officer) {
      // Update the case with the new assignment
      updateCase(currentCase.id, {
        assignedOfficerId: officer.id,
        assignedOfficerName: officer.name,
        status: 'preparing', // Reset status to preparing for the new officer
        updatedAt: new Date().toISOString()
      });

      // Add to audit log
      addAuditLog({
        action: 'CASE_ASSIGNED',
        resource: 'CASE',
        resourceId: currentCase.id,
        details: { 
          assignedTo: officer.name,
          assignedById: user?.id,
          assignedBy: user?.name,
          note: assignmentNote
        }
      });

      alert(`Case assigned to ${officer.name} successfully!`);
      navigate(`/cases/${currentCase.id}`);
    }
  };

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
              <h1 className="text-2xl font-bold text-white">Assign Case</h1>
            </div>
            <p className="text-gray-400 mt-1">Assign case to a police officer</p>
          </div>
          <StatusBadge status={currentCase.status} />
        </div>
      </div>

      {/* Case Information */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium text-white mb-4">Case Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400">Case Title</p>
            <p className="text-white font-medium">{currentCase.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Case Number</p>
            <p className="text-white font-medium">{currentCase.caseNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">FIR Number</p>
            <p className="text-white font-medium">{relatedFIR?.firNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Current Status</p>
            <div>
              <StatusBadge status={currentCase.status} />
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-400">Description</p>
            <p className="text-white">{currentCase.description}</p>
          </div>
        </div>
      </div>

      {/* Officer Assignment */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium text-white mb-4">Assign to Officer</h2>
        
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search officers by name or badge number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Officer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Badge</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Station</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cases Assigned</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {filteredOfficers.length > 0 ? (
                filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-gray-800">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-white">{officer.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {officer.badge}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {officer.station}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {(() => {
                        // Count how many cases this officer has assigned
                        const casesAssigned = allCases.filter(c => c.assignedOfficerId === officer.id).length;
                        return casesAssigned;
                      })()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedOfficer(officer.id)}
                        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded ${
                          selectedOfficer === officer.id
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {selectedOfficer === officer.id ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No officers found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Assignment Note (Optional)</label>
          <textarea
            value={assignmentNote}
            onChange={(e) => setAssignmentNote(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Add any special instructions or notes for the assigned officer..."
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedOfficer}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded text-white ${
              selectedOfficer 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Assign Case
          </button>
        </div>
      </div>

      {/* Related Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Related Case</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-white">{currentCase.title}</p>
              <p className="text-xs text-gray-400 mb-1">Case #{currentCase.caseNumber}</p>
              <StatusBadge status={currentCase.status} />
            </div>
            <Link 
              to={`/cases/${currentCase.id}`}
              className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm"
            >
              View Case Details
              <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
            </Link>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default AssignCase;