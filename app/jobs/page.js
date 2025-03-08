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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {session?.user.role === 'candidate' ? 'Matching Jobs' : 'Available Jobs'}
          </h1>
          {session?.user.role === 'employer' && (
            <Link
              href="/jobs/create"
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Post New Job
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-card p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={handleFilterChange}
              className="p-2 border rounded"
            />
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="p-2 border rounded"
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
              className="p-2 border rounded"
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
              className="p-2 border rounded"
            />
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid gap-6">
          {jobs.map(job => (
            <div key={job._id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                  <p className="text-muted-foreground mb-2">{job.company}</p>
                  <div className="flex gap-2 mb-4">
                    {job.matchScore && (
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                        Match Score: {Math.round(job.matchScore * 100)}%
                      </span>
                    )}
                    <span className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded text-sm">
                      {job.jobType.replace('_', ' ')}
                    </span>
                    <span className="bg-accent/10 text-accent-foreground px-2 py-1 rounded text-sm">
                      {job.location}
                    </span>
                    <span className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded text-sm">
                      {job.workType}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>
                </div>
                <Link
                  href={`/jobs/${job._id}`}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">No jobs found.</p>
            {session?.user.role === 'employer' && (
              <Link href="/jobs/create" className="text-primary hover:underline mt-4 inline-block">
                Post Your First Job
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 