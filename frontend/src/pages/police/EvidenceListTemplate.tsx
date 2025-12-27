import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  Send, 
  Download, 
  Plus,
  Trash2,
  User,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCases, getFIRs, updateCase, addAuditLog } from '../../utils/localStorage';
import { Case, FIR, Document } from '../../types';
import StatusBadge from '../../components/UI/StatusBadge';

const EvidenceListTemplate: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rolePath = user?.role ? (user.role === 'court_clerk' ? 'clerk' : user.role) : 'police';
  
  const [isEditing, setIsEditing] = useState(true);
  const [evidenceData, setEvidenceData] = useState({
    caseTitle: '',
    caseNumber: '',
    firNumber: '',
    date: new Date().toISOString().split('T')[0],
    investigatingOfficer: '',
    stationName: ''
  });
  
  const [evidenceItems, setEvidenceItems] = useState([
    { id: '1', type: 'Physical', description: 'Physical evidence item', exhibitNumber: 'EX-001', location: 'Crime scene', dateCollected: new Date().toISOString().split('T')[0] },
    { id: '2', type: 'Digital', description: 'Digital evidence item', exhibitNumber: 'EX-002', location: 'Device', dateCollected: new Date().toISOString().split('T')[0] }
  ]);
  
  const allCases = getCases();
  const allFIRs = getFIRs();
  
  const currentCase = allCases.find(c => c.id === caseId);
  const relatedFIR = currentCase ? allFIRs.find(f => f.id === currentCase.firId) : null;
  
  useEffect(() => {
    if (currentCase && relatedFIR) {
      setEvidenceData({
        caseTitle: currentCase.title,
        caseNumber: currentCase.caseNumber,
        firNumber: relatedFIR.firNumber,
        date: new Date().toISOString().split('T')[0],
        investigatingOfficer: user?.name || 'Investigating Officer',
        stationName: currentCase.station
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEvidenceData(prev => ({ ...prev, [name]: value }));
  };

  const handleEvidenceChange = (id: string, field: string, value: string) => {
    setEvidenceItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addEvidenceItem = () => {
    const newId = (evidenceItems.length + 1).toString();
    setEvidenceItems([
      ...evidenceItems,
      { 
        id: newId, 
        type: 'Physical', 
        description: '', 
        exhibitNumber: `EX-${String(evidenceItems.length + 1).padStart(3, '0')}`, 
        location: '', 
        dateCollected: new Date().toISOString().split('T')[0] 
      }
    ]);
  };

  const removeEvidenceItem = (id: string) => {
    if (evidenceItems.length > 1) {
      setEvidenceItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSave = () => {
    // In a real app, this would save to localStorage
    alert('Evidence list saved successfully!');
    setIsEditing(false);
  };

  const handleGenerate = () => {
    // In a real app, this would create a document in localStorage
    const newDocument: Document = {
      id: Date.now().toString(),
      name: `Evidence List - ${currentCase.title}`,
      type: 'evidence_list',
      fileName: `evidence_list_${currentCase.caseNumber}.pdf`,
      fileSize: 1024 * 90, // 90KB mock size
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
        documentType: 'evidence_list',
        caseId: currentCase.id,
        caseNumber: currentCase.caseNumber
      }
    });

    alert('Evidence list generated and saved to case documents!');
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
              <h1 className="text-2xl font-bold text-white">Evidence List</h1>
            </div>
            <p className="text-gray-400 mt-1">Case #{currentCase.caseNumber} | {currentCase.title}</p>
          </div>
          <StatusBadge status={currentCase.status} />
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Evidence List Form</h2>
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
                  value={evidenceData.caseTitle}
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
                  value={evidenceData.caseNumber}
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
                  value={evidenceData.firNumber}
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
                  value={evidenceData.date}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                />
              </div>
            </div>
          </div>

          {/* Evidence Items */}
          <div className="border-b border-gray-700 pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Evidence Items</h3>
              {canEdit && (
                <button
                  onClick={addEvidenceItem}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exhibit No.</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date Collected</th>
                    {canEdit && (
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {evidenceItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.exhibitNumber}
                          onChange={(e) => handleEvidenceChange(item.id, 'exhibitNumber', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 border border-gray-600 rounded bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <select
                          value={item.type}
                          onChange={(e) => handleEvidenceChange(item.id, 'type', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 border border-gray-600 rounded bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                        >
                          <option value="Physical">Physical</option>
                          <option value="Digital">Digital</option>
                          <option value="Documentary">Documentary</option>
                          <option value="Testimonial">Testimonial</option>
                          <option value="Demonstrative">Demonstrative</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleEvidenceChange(item.id, 'description', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 border border-gray-600 rounded bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.location}
                          onChange={(e) => handleEvidenceChange(item.id, 'location', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 border border-gray-600 rounded bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <input
                          type="date"
                          value={item.dateCollected}
                          onChange={(e) => handleEvidenceChange(item.id, 'dateCollected', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 border border-gray-600 rounded bg-gray-800 text-white ${isEditing ? 'focus:outline-none focus:ring-1 focus:ring-blue-500' : 'cursor-not-allowed'}`}
                        />
                      </td>
                      {canEdit && (
                        <td className="px-4 py-2 whitespace-nowrap">
                          <button
                            onClick={() => removeEvidenceItem(item.id)}
                            className="text-red-500 hover:text-red-400"
                            disabled={evidenceItems.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  name="investigatingOfficer"
                  value={evidenceData.investigatingOfficer}
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
                  value={evidenceData.stationName}
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
              to={`/${rolePath}/cases/${currentCase.id}`}
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

export default EvidenceListTemplate;