import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMentorships } from '../redux/slices/mentorshipSlice';

const Mentorship = () => {
  const dispatch = useDispatch();
  const { items = [], loading = false, error = null } = useSelector((state) => state.mentorship || {});
  const validItems = Array.isArray(items) ? items : (items?.data || items?.mentorships || []);

  useEffect(() => {
    dispatch(fetchMentorships());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message || 'Failed to load mentorships'}</div>;

  return (
    <div className="mentorship-page">
      <h2>My Mentorships</h2>
      {validItems.length === 0 ? (
        <p>No mentorship requests yet.</p>
      ) : (
        <ul>
          {validItems.map((m) => (
            <li key={m._id}>
              <p>Mentor: {m.mentor?.name || 'Unknown'}</p>
              <p>Mentee: {m.mentee?.name || 'Unknown'}</p>
              <p>Status: {m.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Mentorship;
