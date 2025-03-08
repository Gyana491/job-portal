'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function MyListings() {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    if (session?.user.role !== 'employer') {
      router.push('/dashboard');
      return;
    }
    fetchMyJobs();
  }, [session, router]);

  const fetchMyJobs = async () => {
    try {
      const res = await fetch('/api/jobs/employer');
      if (!res.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Job Listings</h1>
          <Link
            href="/jobs/create"
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Post New Job
          </Link>
        </div>

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
                    <span className={`px-2 py-1 rounded text-sm ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/jobs/${job._id}/matched-candidates`}
                    className="inline-flex items-center px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    Matched Candidates
                  </Link>
                  <Link
                    href={`/jobs/${job._id}/edit`}
                    className="inline-flex items-center px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-10">
            <p className="text-center text-gray-600">
              You haven&apos;t posted any jobs yet.
            </p>
            <Link href="/jobs/create" className="text-primary hover:underline mt-4 inline-block">
              Post Your First Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 