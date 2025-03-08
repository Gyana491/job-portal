'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Jobs() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    workType: '',
    location: ''
  });

  const fetchAllJobs = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams(filters);
      const res = await fetch(`/api/jobs?${queryParams}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data.jobs);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchMatchedJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs/matches');
      if (!res.ok) throw new Error('Failed to fetch matched jobs');
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      if (session?.user.role === 'candidate') {
        await fetchMatchedJobs();
      } else {
        await fetchAllJobs();
      }
    };
    fetchJobs();
  }, [session, filters, fetchMatchedJobs, fetchAllJobs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {session?.user.role === 'candidate' ? 'Matching Jobs' : 'Available Jobs'}
          </h1>
          {session?.user.role === 'employer' && (
            <Link
              href="/jobs/create"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto text-center"
            >
              Post New Job
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-card p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={handleFilterChange}
              className="p-2 border rounded w-full"
            />
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="p-2 border rounded w-full"
            >
              <option value="">All Job Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
            <select
              name="workType"
              value={filters.workType}
              onChange={handleFilterChange}
              className="p-2 border rounded w-full"
            >
              <option value="">All Work Types</option>
              <option value="onsite">Onsite</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <input
              type="text"
              name="location"
              placeholder="Location..."
              value={filters.location}
              onChange={handleFilterChange}
              className="p-2 border rounded w-full"
            />
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid gap-4 sm:gap-6">
          {jobs.map(job => (
            <div key={job._id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold mb-2">{job.title}</h2>
                  <p className="text-muted-foreground mb-2">{job.company}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.matchScore && (
                      <span className="bg-primary/20 text-primary font-medium px-3 py-1.5 rounded-full text-sm sm:text-base shadow-sm flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Match: {Math.round(job.matchScore * 100)}%
                      </span>
                    )}
                    <span className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded text-xs sm:text-sm">
                      {job.jobType.replace('_', ' ')}
                    </span>
                    <span className="bg-accent/10 text-accent-foreground px-2 py-1 rounded text-xs sm:text-sm">
                      {job.location}
                    </span>
                    <span className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded text-xs sm:text-sm">
                      {job.workType}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/jobs/${job._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto text-center"
                  >
                    View Details
                  </Link>
                  {session?.user.role === 'employer' && session.user.id === job.employer && (
                    <Link
                      href={`/jobs/${job._id}/edit`}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto text-center"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-8 sm:py-10">
            <p className="text-base sm:text-lg text-muted-foreground">No jobs found.</p>
            {session?.user.role === 'employer' && (
              <Link href="/jobs/create" className="text-blue-600 hover:underline mt-4 inline-block">
                Post Your First Job
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 