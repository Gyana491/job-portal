'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function EditJob() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'full_time',
    workType: 'onsite',
    description: '',
    requirements: [],
    skills: [],
    salary: {
      min: 0,
      max: 0,
      currency: 'USD'
    },
    benefits: [],
    experienceLevel: 'entry'
  });

  const fetchJobDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch job details');
      const data = await res.json();
      
      // Verify ownership
      if (data.employer._id !== session?.user.id) {
        router.push('/dashboard');
        toast.error('Unauthorized to edit this job');
        return;
      }
      
      setJob(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [params.id, router, session?.user.id]);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    fetchJobDetails();
  }, [session, router, fetchJobDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/jobs/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });

      if (!res.ok) throw new Error('Failed to update job');
      
      toast.success('Job updated successfully');
      router.push('/jobs/my-listings');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Job Posting</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-lg p-6">
            <div className="grid gap-4">
              {/* Job Title */}
              <div>
                <label className="block mb-2">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={job.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block mb-2">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={job.company}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={job.location}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              {/* Job Type and Work Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Job Type</label>
                  <select
                    name="jobType"
                    value={job.jobType}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Work Type</label>
                  <select
                    name="workType"
                    value={job.workType}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <label className="block mb-2">Required Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={job.skills.join(', ')}
                  onChange={(e) => {
                    const skills = e.target.value.split(',').map(skill => skill.trim());
                    setJob(prev => ({ ...prev, skills }));
                  }}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              {/* Job Description */}
              <div>
                <label className="block mb-2">Job Description</label>
                <textarea
                  name="description"
                  value={job.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  rows="6"
                  required
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block mb-2">Requirements (one per line)</label>
                <textarea
                  name="requirements"
                  value={job.requirements.join('\n')}
                  onChange={(e) => {
                    const requirements = e.target.value.split('\n').filter(req => req.trim());
                    setJob(prev => ({ ...prev, requirements }));
                  }}
                  className="w-full p-2 border rounded"
                  rows="4"
                  required
                />
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Minimum Salary</label>
                  <input
                    type="number"
                    name="salary.min"
                    value={job.salary.min}
                    onChange={(e) => setJob(prev => ({
                      ...prev,
                      salary: { ...prev.salary, min: parseInt(e.target.value) }
                    }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">Maximum Salary</label>
                  <input
                    type="number"
                    name="salary.max"
                    value={job.salary.max}
                    onChange={(e) => setJob(prev => ({
                      ...prev,
                      salary: { ...prev.salary, max: parseInt(e.target.value) }
                    }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block mb-2">Experience Level</label>
                <select
                  name="experienceLevel"
                  value={job.experienceLevel}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 