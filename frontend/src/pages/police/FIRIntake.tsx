import React, { useState } from 'react';
import { FileText, Upload, Plus } from 'lucide-react';
import { FIR } from '../types';
import { addFIR, addCase } from '../../utils/localStorage';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../../components/UI/Modal';

const FIRIntake: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    complainant: '',
    accused: '',
    location: '',
    dateTime: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.description || !formData.complainant || !formData.location) {
      toast.error('Please fill all required fields');
      return;
    }

    // Generate FIR
    const firId = Date.now().toString();
    const firNumber = `FIR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    const newFIR: FIR = {
      id: firId,
      firNumber,
      title: formData.title,
      description: formData.description,
      complainant: formData.complainant,
      accused: formData.accused || 'Unknown',
      location: formData.location,
      dateTime: formData.dateTime || new Date().toISOString(),
      officerId: user.id,
      officerName: user.name,
      station: user.station || 'Unknown Station',
      status: 'registered',
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addFIR(newFIR);

    // Auto-create case
    const caseId = Date.now().toString() + '_case';
    const caseNumber = `CASE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    const newCase = {
      id: caseId,
      caseNumber,
      firId: firId,
      firNumber: firNumber,
      title: formData.title,
      description: formData.description,
      status: 'preparing' as const,
      assignedOfficerId: user.id,
      assignedOfficerName: user.name,
      station: user.station || 'Unknown Station',
      documents: [],
      timeline: [{
        id: '1',
        action: 'FIR Registered',
        description: 'FIR successfully registered and case created',
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
        status: 'completed' as const
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addCase(newCase);

    // Update FIR status
    newFIR.status = 'case_created';

    toast.success(`FIR ${firNumber} registered and case ${caseNumber} created successfully!`);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      complainant: '',
      accused: '',
      location: '',
      dateTime: '',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-white">FIR Digital Intake</h1>
        <p className="text-gray-400">Register a new First Information Report</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-600">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Manual FIR Entry</h3>
              <p className="text-sm text-gray-400">Enter FIR details manually using the form</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition-colors">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-600">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Upload FIR Document</h3>
              <p className="text-sm text-gray-400">Upload scanned FIR (PDF/Image) with OCR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">FIR Registration Process</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">1</div>
            <div>
              <p className="text-white font-medium">Enter FIR Details</p>
              <p>Fill in all required information about the incident</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">2</div>
            <div>
              <p className="text-white font-medium">Auto-Generate FIR Number</p>
              <p>System will automatically assign a unique FIR number</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">3</div>
            <div>
              <p className="text-white font-medium">Case Auto-Creation</p>
              <p>A case file will be automatically created and linked to the FIR</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">4</div>
            <div>
              <p className="text-white font-medium">Document Management</p>
              <p>Add supporting documents and evidence to the case file</p>
            </div>
          </div>
        </div>
      </div>

      {/* FIR Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New FIR"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">
              Incident Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Brief description of the incident"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Detailed description of the incident"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="complainant" className="block text-sm font-medium text-gray-300">
                Complainant Name *
              </label>
              <input
                type="text"
                id="complainant"
                name="complainant"
                required
                value={formData.complainant}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Name of the complainant"
              />
            </div>

            <div>
              <label htmlFor="accused" className="block text-sm font-medium text-gray-300">
                Accused Name
              </label>
              <input
                type="text"
                id="accused"
                name="accused"
                value={formData.accused}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Name of accused (if known)"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300">
              Location of Incident *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Location where incident occurred"
            />
          </div>

          <div>
            <label htmlFor="dateTime" className="block text-sm font-medium text-gray-300">
              Date and Time of Incident
            </label>
            <input
              type="datetime-local"
              id="dateTime"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Register FIR & Create Case
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FIRIntake;