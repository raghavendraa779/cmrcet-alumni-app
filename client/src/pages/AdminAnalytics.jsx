import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReports, updateReportStatus } from '../store/slices/adminSlice';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { reports, loading } = useSelector((state) => state.admin || { reports: [], loading: false });
  const validReports = Array.isArray(reports) ? reports : (reports?.data || reports?.reports || []);
  const [activeTab, setActiveTab] = useState('reports');
  const [resolutionNote, setResolutionNote] = useState('');

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const handleStatusUpdate = (id, status) => {
    dispatch(updateReportStatus({ id, status, resolutionNotes: resolutionNote }));
    setResolutionNote('');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>

      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Moderation Reports
            </div>
          </button>
        </nav>
      </div>

      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading reports...</div>
          ) : validReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No moderation reports found.</div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {validReports.map((report) => (
                <li key={report._id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Report on {report.reportedType}
                        </span>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        Reported by: {report.reporter?.name || 'Unknown'} | Reason: {report.reason}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mt-2">{report.description}</p>
                    </div>
                  </div>

                  {report.status === 'pending' || report.status === 'reviewed' ? (
                    <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-md p-4">
                      <input
                        type="text"
                        placeholder="Resolution notes (optional)"
                        className="w-full px-3 py-2 border rounded-md mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleStatusUpdate(report._id, 'resolved')}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" /> Resolve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(report._id, 'dismissed')}
                          className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Dismiss
                        </button>
                      </div>
                    </div>
                  ) : (
                    report.resolutionNotes && (
                      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                        <strong>Resolution Notes:</strong> {report.resolutionNotes}
                      </div>
                    )
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
