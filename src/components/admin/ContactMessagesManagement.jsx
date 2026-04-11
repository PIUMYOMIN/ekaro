import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  EnvelopeIcon,
  EnvelopeOpenIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';

const ContactMessagesManagement = () => {
  const [_toast, _setToast] = useState(null);
  const flash = (msg, type='success') => { _setToast({msg,type}); setTimeout(()=>_setToast(null),3000); };
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMessages = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        search: searchTerm || undefined,
        filter: filter !== 'all' ? filter : undefined,
        per_page: pagination.per_page
      };
      const response = await api.get('/admin/contact-messages', { params });
      setMessages(response.data.data.data);
      setPagination({
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        total: response.data.data.total,
        per_page: response.data.data.per_page
      });
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [searchTerm, filter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handlePageChange = (newPage) => {
    fetchMessages(newPage);
  };

  const handleViewMessage = async (message) => {
    setSelectedMessage(message);
    setShowModal(true);

    // If unread, mark as read
    if (!message.read_at) {
      try {
        await api.put(`/admin/contact-messages/${message.id}/read`);
        // Update local state
        setMessages(prev =>
          prev.map(m =>
            m.id === message.id ? { ...m, read_at: new Date().toISOString() } : m
          )
        );
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/admin/contact-messages/${id}/read`);
      setMessages(prev =>
        prev.map(m => (m.id === id ? { ...m, read_at: new Date().toISOString() } : m))
      );
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    // Inline delete without confirm (admin action)
    try {
      await api.delete(`/admin/contact-messages/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setShowModal(false);
    } catch (err) {
      console.error('Failed to delete message');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'MMM d, yyyy HH:mm');
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Contact Messages</h2>
        <p className="text-sm text-gray-600 mt-1">Manage customer inquiries and feedback</p>
      </div>

      {/* Filters and Search */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'all'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            All ({pagination.total})
          </button>
          <button
            onClick={() => handleFilterChange('unread')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'unread'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Unread
          </button>
          <button
            onClick={() => handleFilterChange('read')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${filter === 'read'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Read
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, subject..."
            className="w-64 pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Messages Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {messages.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No messages found
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr
                  key={message.id}
                  onClick={() => handleViewMessage(message)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {message.read_at ? (
                      <EnvelopeOpenIcon className="h-5 w-5 text-gray-400" title="Read" />
                    ) : (
                      <EnvelopeIcon className="h-5 w-5 text-green-600" title="Unread" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {message.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {message.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {message.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(message.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {!message.read_at && (
                        <button
                          onClick={(e) => handleMarkRead(message.id, e)}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as read"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(message.id, e)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">Page {pagination.current_page} of {pagination.last_page}</span>
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black opacity-30"></div>
            <div
              className="relative bg-white rounded-lg max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Message Details</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="font-medium text-gray-700">From:</div>
                  <div className="col-span-2">{selectedMessage.name}</div>

                  <div className="font-medium text-gray-700">Email:</div>
                  <div className="col-span-2">{selectedMessage.email}</div>

                  {selectedMessage.phone && (
                    <>
                      <div className="font-medium text-gray-700">Phone:</div>
                      <div className="col-span-2">{selectedMessage.phone}</div>
                    </>
                  )}

                  <div className="font-medium text-gray-700">Subject:</div>
                  <div className="col-span-2">{selectedMessage.subject}</div>

                  <div className="font-medium text-gray-700">Received:</div>
                  <div className="col-span-2">{formatDate(selectedMessage.created_at)}</div>

                  {selectedMessage.read_at && (
                    <>
                      <div className="font-medium text-gray-700">Read at:</div>
                      <div className="col-span-2">{formatDate(selectedMessage.read_at)}</div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
                  <div className="bg-gray-50 p-3 rounded-md text-sm whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {!selectedMessage.read_at && (
                  <button
                    onClick={() => {
                      handleMarkRead(selectedMessage.id, { stopPropagation: () => {} });
                      setSelectedMessage(prev => ({ ...prev, read_at: new Date().toISOString() }));
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedMessage.id, { stopPropagation: () => {} });
                    setShowModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessagesManagement;