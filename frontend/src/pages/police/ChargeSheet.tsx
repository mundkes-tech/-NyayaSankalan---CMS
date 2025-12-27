import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  Send, 
  Download, 
  Eye, 
  User,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCases, getFIRs, updateCase, addAuditLog } from '../../utils/localStorage';
import { Case, FIR, Document } from '../../types';
import StatusBadge from '../../components/UI/StatusBadge';

const ChargeSheet: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(true);
  const [chargeSheetData, setChargeSheetData] = useState({
    caseTitle: '',
    caseNumber: '',
    firNumber: '',
    accusedDetails: '',
    charges: '',
    evidenceSummary: '',
    witnessDetails: '',
    legalProvisions: '',
    officerName: '',
    officerRank: '',
    stationName: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const allCases = getCases();
  const allFIRs = getFIRs();
  
  const currentCase = allCases.find(c => c.id === caseId);
  const relatedFIR = currentCase ? allFIRs.find(f => f.id === currentCase.firId) : null;
  
  useEffect(() => {
    if (currentCase && relatedFIR) {
      setChargeSheetData({
        caseTitle: currentCase.title,
        caseNumber: currentCase.caseNumber,
        firNumber: relatedFIR.firNumber,
        accusedDetails: relatedFIR.accused,
        charges: 'Charges to be specified based on evidence',
        evidenceSummary: 'Summary of evidence collected during investigation',
        witnessDetails: 'Names and details of witnesses to be added',
        legalProvisions: 'Sections under which charges are framed',
        officerName: user?.name || 'Investigating Officer',
        officerRank: user?.role === 'police' ? 'Police Officer' : 'Senior Officer',
        stationName: currentCase.station,
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [currentCase, relatedFIR, user]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setChargeSheetData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // In a real app, this would save to localStorage
    alert('Charge sheet saved successfully!');
    setIsEditing(false);
  };

  const handleGenerate = () => {
    // In a real app, this would create a document in localStorage
    const newDocument: Document = {
      id: Date.now().toString(),
      name: `Charge Sheet - ${currentCase.title}`,
      type: 'charge_sheet',
      fileName: `charge_sheet_${currentCase.caseNumber}.pdf`,
      fileSize: 1024 * 100, // 100KB mock size
      uploadedBy: user?.name || 'Unknown',
      uploadedAt: new Date().toISOString(),
      required: true,
      status: 'uploaded'
    };

    // Add document to the case
    const updatedDocuments = [...currentCase.documents, newDocument];
    updateCase(currentCase.id, { documents: updatedDocuments });

    // Add to audit log
    addAuditLog({
      action: 'DOCUMENT_CREATED',
      resource: 'Document',
      resourceId: newDocument.id,
      details: { 
        documentType: 'charge_sheet',
        caseId: currentCase.id,
        caseNumber: currentCase.caseNumber
      }
    });

    alert('Charge sheet generated and saved to case documents!');
    navigate(`/cases/${currentCase.id}`);
  };

  const canEdit = user?.role === 'police' && currentCase.assignedOfficerId === user.id;
  const canView = ['police', 'sho', 'court_clerk', 'judge'].includes(user?.role || '');

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
              <h1 className="text-2xl font-bold text-white">Charge Sheet</h1>
            </div>
            <p className="text-gray-400 mt-1">Case #{currentCase.caseNumber} | {currentCase.title}</p>
          </div>
          <StatusBadge status={currentCase.status} />
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Charge Sheet Form</h2>
          <div className="flex space-x-2">
            {canEdit && (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Draft
                </button>
                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Generate & Submit
                </button>
              </>
            )}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-1" />
              Print
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Case Information */}
          <div className="border-b border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-white mb-4">Case Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Case Title</label>
                <input
                  type="text"
                  name="caseTitle"
                  value={chargeSheetData.caseTitle}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Case Number</label>
                <input
                  type="text"
                  name="caseNumber"
                  value={chargeSheetData.caseNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">FIR Number</label>
                <input
                  type="text"
                  name="firNumber"
                  value={chargeSheetData.firNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={chargeSheetData.date}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                />
              </div>
            </div>
          </div>

          {/* Accused Information */}
          <div className="border-b border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-white mb-4">Accused Information</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Accused Details</label>
              <textarea
                name="accusedDetails"
                value={chargeSheetData.accusedDetails}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
              />
            </div>
          </div>

          {/* Charges Framed */}
          <div className="border-b border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-white mb-4">Charges Framed</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Charges</label>
              <textarea
                name="charges"
                value={chargeSheetData.charges}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Legal Provisions</label>
              <textarea
                name="legalProvisions"
                value={chargeSheetData.legalProvisions}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
              />
            </div>
          </div>

          {/* Evidence Summary */}
          <div className="border-b border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-white mb-4">Evidence Summary</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Summary of Evidence</label>
              <textarea
                name="evidenceSummary"
                value={chargeSheetData.evidenceSummary}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={5}
                className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
              />
            </div>
          </div>

          {/* Witness Details */}
          <div className="border-b border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-white mb-4">Witness Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Witness Information</label>
              <textarea
                name="witnessDetails"
                value={chargeSheetData.witnessDetails}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
              />
            </div>
          </div>

          {/* Officer Information */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Investigating Officer</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Officer Name</label>
                <input
                  type="text"
                  name="officerName"
                  value={chargeSheetData.officerName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Rank</label>
                <input
                  type="text"
                  name="officerRank"
                  value={chargeSheetData.officerRank}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Station</label>
                <input
                  type="text"
                  name="stationName"
                  value={chargeSheetData.stationName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                />
              </div>
            </div>
          </div>
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

export default ChargeSheet;