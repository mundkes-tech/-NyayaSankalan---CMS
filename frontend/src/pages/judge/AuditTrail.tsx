import React, { useState } from 'react';
import { Shield, Search, Filter, Eye, Download } from 'lucide-react';
import { getAuditLogs } from '../../utils/localStorage';
import { useAuth } from '../../contexts/AuthContext';
import { AuditLog } from '../../types';

const AuditTrail: React.FC = () => {
  const { user } = useAuth();
  const [auditLogs] = useState<AuditLog[]>(getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  // Filter audit logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    let matchesDate = true;
    if (dateRange !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      switch (dateRange) {
        case 'today':
          matchesDate = logDate.toDateString() === now.toDateString();
          break;
        case 'week':
          matchesDate = (now.getTime() - logDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          matchesDate = (now.getTime() - logDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
          break;
      }
    }

    return matchesSearch && matchesAction && matchesDate;
  });

  const getUniqueActions = () => {
    const actions = Array.from(new Set(auditLogs.map(log => log.action)));
    return actions.sort();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'FIR_CREATED':
      case 'CASE_CREATED':
        return 'text-green-400';
      case 'CASE_UPDATED':
      case 'DOCUMENT_UPLOADED':
        return 'text-blue-400';
      case 'CASE_SUBMITTED':
      case 'CASE_APPROVED':
        return 'text-purple-400';
      case 'CASE_REJECTED':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Audit Trail</h1>
        <p className="text-gray-400">Complete log of all system activities and changes</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="relative">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Actions</option>
            {getUniqueActions().map(action => (
              <option key={action} value={action}>
                {formatAction(action)}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{log.resource}</div>
                      <div className="text-xs text-gray-400">ID: {log.resourceId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {log.userName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {Object.keys(log.details).length > 0 ? (
                        <div className="max-w-xs truncate">
                          {Object.entries(log.details).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="text-gray-400">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">No details</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-gray-600 text-gray-300 hover:bg-gray-700">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No audit logs found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {filteredLogs.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">
            Showing {filteredLogs.length} of {auditLogs.length} audit log entries
          </p>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-100">Security & Compliance</h3>
            <p className="text-xs text-blue-200 mt-1">
              All system activities are logged for security and compliance purposes. 
              Audit logs are immutable and cannot be modified or deleted by users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;