import React from 'react';
import { BarChart3, Clock, FileText, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { getCases, getFIRs } from '../../utils/localStorage';
import { useAuth } from '../../contexts/AuthContext';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const cases = getCases();
  const firs = getFIRs();

  // Calculate analytics based on role
  const getAnalytics = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentCases = cases.filter(c => new Date(c.createdAt) >= thirtyDaysAgo);
    const completedCases = cases.filter(c => ['court_acknowledged', 'accepted', 'locked'].includes(c.status));

    // Calculate average processing time (mock calculation)
    const avgProcessingTime = completedCases.length > 0 
      ? Math.round(completedCases.reduce((acc, c) => {
          const created = new Date(c.createdAt).getTime();
          const completed = new Date(c.updatedAt).getTime();
          return acc + (completed - created);
        }, 0) / completedCases.length / (1000 * 60 * 60 * 24)) 
      : 0;

    // Status distribution
    const statusCounts = cases.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly submissions (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const count = cases.filter(c => {
        const caseDate = new Date(c.createdAt);
        return caseDate.getMonth() === date.getMonth() && caseDate.getFullYear() === date.getFullYear();
      }).length;
      monthlyData.push({ month, count });
    }

    return {
      totalCases: cases.length,
      totalFIRs: firs.length,
      recentCases: recentCases.length,
      completedCases: completedCases.length,
      avgProcessingTime,
      statusCounts,
      monthlyData
    };
  };

  const analytics = getAnalytics();

  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case 'police':
        const userCases = cases.filter(c => c.assignedOfficerId === user?.id);
        return [
          { label: 'My FIRs', value: firs.filter(f => f.officerId === user?.id).length, icon: FileText, color: 'blue' },
          { label: 'My Cases', value: userCases.length, icon: BarChart3, color: 'green' },
          { label: 'Submitted to SHO', value: userCases.filter(c => c.status === 'submitted_to_sho').length, icon: TrendingUp, color: 'yellow' },
          { label: 'Completed', value: userCases.filter(c => ['court_acknowledged', 'accepted'].includes(c.status)).length, icon: CheckCircle, color: 'purple' },
        ];
      case 'sho':
        return [
          { label: 'Pending Reviews', value: cases.filter(c => c.status === 'submitted_to_sho').length, icon: Clock, color: 'yellow' },
          { label: 'Approved', value: cases.filter(c => c.status === 'approved_by_sho').length, icon: CheckCircle, color: 'green' },
          { label: 'Total Cases', value: cases.length, icon: BarChart3, color: 'blue' },
          { label: 'Officers', value: new Set(cases.map(c => c.assignedOfficerId)).size, icon: Users, color: 'purple' },
        ];
      case 'court_clerk':
        return [
          { label: 'New Submissions', value: cases.filter(c => c.status === 'submitted_to_court').length, icon: FileText, color: 'blue' },
          { label: 'Under Review', value: cases.filter(c => c.status === 'under_review').length, icon: Clock, color: 'yellow' },
          { label: 'Accepted', value: cases.filter(c => c.status === 'accepted').length, icon: CheckCircle, color: 'green' },
          { label: 'Avg. Processing Days', value: analytics.avgProcessingTime, icon: TrendingUp, color: 'purple' },
        ];
      case 'judge':
        return [
          { label: 'Total Cases', value: cases.length, icon: BarChart3, color: 'blue' },
          { label: 'Active Cases', value: cases.filter(c => ['under_review', 'accepted'].includes(c.status)).length, icon: Clock, color: 'green' },
          { label: 'Documents', value: cases.reduce((acc, c) => acc + c.documents.length, 0), icon: FileText, color: 'yellow' },
          { label: 'This Month', value: analytics.recentCases, icon: TrendingUp, color: 'purple' },
        ];
      default:
        return [];
    }
  };

  const stats = getRoleSpecificStats();

  const getStatColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-600';
      case 'green': return 'bg-green-600';
      case 'yellow': return 'bg-yellow-600';
      case 'purple': return 'bg-purple-600';
      case 'red': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-gray-400">System performance and case statistics</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${getStatColor(stat.color)}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Case Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 capitalize">
                  {status.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / analytics.totalCases) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Monthly Case Submissions</h3>
          <div className="space-y-3">
            {analytics.monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{data.month}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.max((data.count / Math.max(...analytics.monthlyData.map(d => d.count))) * 100, 5)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-8 text-right">{data.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Performance Metrics */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-6">System Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{analytics.avgProcessingTime}</div>
            <div className="text-sm text-gray-400">Average Processing Days</div>
            <div className="text-xs text-gray-500 mt-1">From FIR to Court Acknowledgment</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{Math.round((analytics.completedCases / analytics.totalCases) * 100)}%</div>
            <div className="text-sm text-gray-400">Completion Rate</div>
            <div className="text-xs text-gray-500 mt-1">Cases reaching court acknowledgment</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{analytics.recentCases}</div>
            <div className="text-sm text-gray-400">Recent Activity</div>
            <div className="text-xs text-gray-500 mt-1">Cases created in last 30 days</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Key Insights</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3"></div>
            <div>
              <p className="font-medium">Processing Efficiency</p>
              <p className="text-gray-400">Average case processing time is {analytics.avgProcessingTime} days from FIR registration to court acknowledgment.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2 mr-3"></div>
            <div>
              <p className="font-medium">Digital Transformation</p>
              <p className="text-gray-400">Digital workflow has streamlined document management and reduced processing bottlenecks.</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3"></div>
            <div>
              <p className="font-medium">Monthly Growth</p>
              <p className="text-gray-400">Case submissions show consistent monthly activity across the platform.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;