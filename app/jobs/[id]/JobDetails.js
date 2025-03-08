'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function JobDetails({ id }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchJobDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error('Failed to fetch job details');
      const data = await res.json();
      setJob(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!job) {
    return <div className="min-h-screen flex items-center justify-center">Job not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{job.company}</p>
              <div className="flex gap-4 mb-6">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {job.jobType.replace('_', ' ')}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {job.workType}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {job.location}
                </span>
              </div>
            </div>
            {session?.user.id === job.employer && (
              <Link
                href={`/jobs/${job._id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Edit Job
              </Link>
            )}
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 mb-6 whitespace-pre-wrap">{job.description}</p>

            <h2 className="text-xl font-semibold mb-3">Requirements</h2>
            <p className="text-gray-700 mb-6 whitespace-pre-wrap">{job.requirements}</p>

            <div className="mt-8 pt-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Salary Range</p>
                  <p className="font-medium">{job.salaryRange}</p>
                </div>
                <div>
                  <p className="text-gray-600">Experience Level</p>
                  <p className="font-medium">{job.experienceLevel}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Link
              href="/jobs"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 