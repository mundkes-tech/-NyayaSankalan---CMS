import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Loader } from '../../components/common/Loader';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';
import { caseApi } from '../../api';
import type { Case } from '../../types/api.types';
import { CaseState } from '../../types/api.types';
import { getCaseStateBadgeVariant, getCaseStateLabel } from '../../utils/caseState';

export const SHOAllCases: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (stateFilter === 'ALL') {
      setFilteredCases(cases);
    } else {
      setFilteredCases(cases.filter(c => c.state?.currentState === stateFilter));
    }
  }, [stateFilter, cases]);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await caseApi.getAllCases();
      setCases(data);
      setFilteredCases(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={error} retry={fetchCases} />;

  return (
    <>
      <Header
        title="All Cases"
        subtitle={`${filteredCases.length} cases in station`}
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <Select
            label="Filter by State"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All States' },
              { value: CaseState.FIR_REGISTERED, label: 'FIR Registered' },
              { value: CaseState.CASE_ASSIGNED, label: 'Case Assigned' },
              { value: CaseState.UNDER_INVESTIGATION, label: 'Under Investigation' },
              { value: CaseState.INVESTIGATION_COMPLETED, label: 'Investigation Completed' },
              { value: CaseState.SUBMITTED_TO_COURT, label: 'Submitted to Court' },
              { value: CaseState.COURT_ACCEPTED, label: 'Court Accepted' },
            ]}
          />
        </div>
      </Card>

      {/* Cases Table */}
      <Card>
        {filteredCases.length === 0 ? (
          <EmptyState message="No cases found with selected filter" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    FIR Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sections
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((c) => {
                  const state = c.state?.currentState || 'UNKNOWN';
                  const activeAssignment = c.assignments?.find(a => !a.unassignedAt);
                  
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/sho/cases/${c.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-blue-600">
                          {c.fir?.firNumber || c.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {c.fir?.sectionsApplied || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getCaseStateBadgeVariant(state)}>
                          {getCaseStateLabel(state)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {activeAssignment?.assignedUser?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/sho/cases/${c.id}`);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
};
