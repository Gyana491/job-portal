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

  // Add a helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleApply = () => {
    if (job.applyLink) {
      window.open(job.applyLink, '_blank');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!job) {
    return <div className="min-h-screen flex items-center justify-center">Job not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/jobs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Back to Jobs
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-4">{job.title}</h1>
              <p className="text-muted-foreground">{job.company}</p>
            </div>
            
            {/* Add Apply Button */}
            {session?.user?.role === 'candidate' && (
              <button
                onClick={handleApply}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Apply Now
              </button>
            )}
          </div>

          {/* Job Metadata */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {job.jobType.replace('_', ' ')}
            </span>
            <span className="bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full text-sm">
              {job.workType}
            </span>
            <span className="bg-accent/10 text-accent-foreground px-3 py-1 rounded-full text-sm">
              {job.location}
            </span>
            {job.salary && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)}
              </span>
            )}
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 mb-6 whitespace-pre-wrap">{job.description}</p>

                <h2 className="text-xl font-semibold mb-3">Requirements</h2>
                <ul className="list-disc pl-5 text-gray-700 mb-6">
                  {job.requirements?.map((req, i) => (
                    <li key={i} className="mb-2">{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600">Experience Level</p>
                    <p className="font-medium capitalize">{job.experienceLevel}</p>
                  </div>
                  
                  {job.benefits?.length > 0 && (
                    <div>
                      <p className="text-gray-600">Benefits</p>
                      <ul className="list-disc pl-5">
                        {job.benefits.map((benefit, i) => (
                          <li key={i} className="text-gray-700">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {job.applicationDeadline && (
                    <div>
                      <p className="text-gray-600">Application Deadline</p>
                      <p className="font-medium">
                        {new Date(job.applicationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-gray-600">Posted On</p>
                    <p className="font-medium">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 