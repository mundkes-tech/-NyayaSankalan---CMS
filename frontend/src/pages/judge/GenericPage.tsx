import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  FolderOpen, 
  Users, 
  BarChart3, 
  Shield,
  Bell,
  Search,
  Gavel
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface GenericPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  showBackButton?: boolean;
}

const GenericPage: React.FC<GenericPageProps> = ({ 
  title, 
  description, 
  icon,
  showBackButton = true
}) => {
  const { user } = useAuth();
  const rolePath = user?.role === 'court_clerk' ? 'clerk' : user?.role || 'judge';
  const navigate = useNavigate();
  const { caseId } = useParams<{ caseId: string }>();

  // Get the appropriate icon based on the title
  const getIcon = () => {
    switch(title.toLowerCase()) {
      case 'evidence management':
        return <Shield className="h-12 w-12 mx-auto text-gray-500 mb-4" />;
      case 'analytics':
        return <BarChart3 className="h-12 w-12 mx-auto text-gray-500 mb-4" />;
      case 'notifications':
        return <Bell className="h-12 w-12 mx-auto text-gray-500 mb-4" />;
      case 'search':
        return <Search className="h-12 w-12 mx-auto text-gray-500 mb-4" />;
      case 'audit trail':
        return <Shield className="h-12 w-12 mx-auto text-gray-500 mb-4" />;
      case 'judgments':
        return <Gavel className="h-12 w-12 mx-auto text-gray-500 mb-4" />;
      case 'generate receipt':
        return <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />;
      case 'assign cases':
        return <Users className="h-12 w-12 mx-auto text-gray-500 mb-4" />;
      default:
        return <FolderOpen className="h-12 w-12 mx-auto text-gray-500 mb-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            {showBackButton && (
              <button 
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-gray-400 hover:text-white mb-2"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </button>
            )}
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-gray-400">{description}</p>
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        {icon || getIcon()}
        <p className="text-lg font-medium text-gray-300 mb-2">{title}</p>
        <p className="text-gray-400">This section is currently under development.</p>
        <p className="text-sm text-gray-500 mt-2">
          {user?.role === 'sho' && caseId 
            ? `Case ID: ${caseId}` 
            : `Role: ${user?.role || 'Unknown'}`
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link 
              to={`/${rolePath}/dashboard`}
              className="block px-4 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Return to Dashboard
            </Link>
            <Link 
              to={`/${rolePath}/cases`}
              className="block px-4 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              View Cases
            </Link>
            <Link 
              to={`/${rolePath}/documents`}
              className="block px-4 py-2 text-sm font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              View Documents
            </Link>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Information</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <p>This page will contain role-specific functionality based on your user type.</p>
            <p>For now, please navigate to other sections of the application.</p>
            <p className="pt-2 text-xs text-gray-500">
              Page ID: {window.location.pathname}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericPage;