'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function JobSearch() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    jobType: '',
    workType: '',
    location: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0
  });

  const searchParams = useSearchParams();

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs/search');
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search Jobs</h1>

        {/* Filters */}
        <div className="bg-card p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search jobs..."
              className="p-2 border rounded"
              value={filters.search}
              onChange={handleFilterChange}
            />
            <select
              name="jobType"
              className="p-2 border rounded"
              value={filters.jobType}
              onChange={handleFilterChange}
            >
              <option value="">Job Type</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
            <select
              name="workType"
              className="p-2 border rounded"
              value={filters.workType}
              onChange={handleFilterChange}
            >
              <option value="">Work Type</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
            <input
              type="text"
              name="location"
              placeholder="Location..."
              className="p-2 border rounded"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            <div className="grid gap-6">
              {jobs.map(job => (
                <div key={job._id} className="bg-card p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                      <p className="text-muted-foreground mb-2">{job.company}</p>
                      <div className="flex gap-2 mb-4">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                          {job.jobType.replace('_', ' ')}
                        </span>
                        <span className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded text-sm">
                          {job.workType}
                        </span>
                        <span className="bg-accent/10 text-accent-foreground px-2 py-1 rounded text-sm">
                          {job.location}
                        </span>
                      </div>
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

            {/* Pagination */}
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: i + 1 }))}
                  className={`px-3 py-1 rounded ${
                    pagination.currentPage === i + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
