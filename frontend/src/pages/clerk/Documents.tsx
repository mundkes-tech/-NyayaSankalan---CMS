import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Search, Download, Eye } from 'lucide-react';
import { Document } from '../../types';
import { getCases } from '../../utils/localStorage';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/UI/StatusBadge';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';

const Documents: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [ocrMode, setOcrMode] = useState(false);
  
  const cases = getCases();
  const userCases = user?.role === 'police' 
    ? cases.filter(c => c.assignedOfficerId === user.id)
    : cases;

  // Get all documents from user's cases
  const allDocuments = userCases.flatMap(case_ => 
    case_.documents.map(doc => ({ ...doc, caseId: case_.id, caseNumber: case_.caseNumber }))
  );

  // Filter documents
  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc as any).caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const documentTypes = [
    { value: 'fir', label: 'FIR' },
    { value: 'charge_sheet', label: 'Charge Sheet' },
    { value: 'remand_application', label: 'Remand Application' },
    { value: 'evidence_list', label: 'Evidence List' },
    { value: 'witness_list', label: 'Witness List' },
    { value: 'evidence', label: 'Evidence' },
    { value: 'statement', label: 'Statement' },
    { value: 'report', label: 'Report' },
  ];

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'fir': return <FileText className="h-5 w-5 text-blue-400" />;
      case 'evidence': return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default: return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Simulate file upload
    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      type: 'evidence',
      fileName: file.name,
      fileSize: file.size,
      uploadedBy: user?.name || 'Unknown',
      uploadedAt: new Date().toISOString(),
      required: false,
      status: 'uploaded',
      ocrExtracted: ocrMode ? generateMockOCRText() : undefined
    };

    toast.success(`Document "${file.name}" uploaded successfully!`);
    setIsUploadModalOpen(false);
    event.target.value = ''; // Reset input
  };

  const generateMockOCRText = () => {
    return "This is mock OCR extracted text from the uploaded document. In a real implementation, this would contain the actual text extracted from the document using OCR technology.";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Document Management</h1>
        <p className="text-gray-400">Upload, manage, and organize case documents</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Types</option>
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:bg-gray-800 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getDocumentTypeIcon(doc.type)}
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-white truncate">{doc.name}</h3>
                  <p className="text-xs text-gray-400">{doc.fileName}</p>
                </div>
              </div>
              <StatusBadge status={doc.status} />
            </div>

            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="text-white">{documentTypes.find(t => t.value === doc.type)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="text-white">{formatFileSize(doc.fileSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Case:</span>
                <span className="text-white">{(doc as any).caseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Uploaded:</span>
                <span className="text-white">{formatDate(doc.uploadedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>By:</span>
                <span className="text-white">{doc.uploadedBy}</span>
              </div>
            </div>

            {doc.ocrExtracted && (
              <div className="mt-4 p-2 bg-gray-800 rounded">
                <p className="text-xs text-gray-300 font-medium mb-1">OCR Extracted:</p>
                <p className="text-xs text-gray-400 truncate">{doc.ocrExtracted}</p>
              </div>
            )}

            <div className="flex space-x-2 mt-4">
              <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-600 rounded-md text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none">
                <Download className="h-3 w-3 mr-1" />
                Download
              </button>
              <button 
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-600 rounded-md text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <p className="text-lg font-medium text-gray-400">No documents found</p>
          <p className="text-sm text-gray-500">Upload documents to get started</p>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Document"
        size="lg"
      >
        <div className="space-y-4">
          {userCases.length > 0 && (
            <div>
              <label htmlFor="case" className="block text-sm font-medium text-gray-300">
                Select Case
              </label>
              <select
                id="case"
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a case...</option>
                {userCases.map((case_) => (
                  <option key={case_.id} value={case_.id}>
                    {case_.caseNumber} - {case_.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center">
            <input
              id="ocr-mode"
              type="checkbox"
              checked={ocrMode}
              onChange={(e) => setOcrMode(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
            />
            <label htmlFor="ocr-mode" className="ml-2 text-sm text-gray-300">
              Enable OCR text extraction (mock)
            </label>
          </div>

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-4" />
            <div className="text-sm text-gray-400">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none">
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              PDF, DOC, DOCX, JPG, JPEG, PNG up to 10MB
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Documents;