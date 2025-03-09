'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CreateJob() {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobData, setJobData] = useState({
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
    experienceLevel: 'entry',
    applyLink: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!res.ok) {
        throw new Error('Failed to create job posting');
      }

      toast.success('Job posted successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSkillChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setJobData(prev => ({ ...prev, skills }));
  };

  const handleRequirementsChange = (e) => {
    const requirements = e.target.value.split('\n').filter(req => req.trim());
    setJobData(prev => ({ ...prev, requirements }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Post a New Job</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-lg p-6">
            <div className="grid gap-4">
              <div>
                <label className="block mb-2">Job Title</label>
                <input
                  type="text"
                  value={jobData.title}
                  onChange={(e) => setJobData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Company Name</label>
                <input
                  type="text"
                  value={jobData.company}
                  onChange={(e) => setJobData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Location</label>
                <input
                  type="text"
                  value={jobData.location}
                  onChange={(e) => setJobData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Job Type</label>
                  <select
                    value={jobData.jobType}
                    onChange={(e) => setJobData(prev => ({ ...prev, jobType: e.target.value }))}
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
                    value={jobData.workType}
                    onChange={(e) => setJobData(prev => ({ ...prev, workType: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2">Required Skills (comma-separated)</label>
                <input
                  type="text"
                  value={jobData.skills.join(', ')}
                  onChange={handleSkillChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Job Description</label>
                <textarea
                  value={jobData.description}
                  onChange={(e) => setJobData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded"
                  rows="6"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Requirements (one per line)</label>
                <textarea
                  value={jobData.requirements.join('\n')}
                  onChange={handleRequirementsChange}
                  className="w-full p-2 border rounded"
                  rows="4"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Minimum Salary</label>
                  <input
                    type="number"
                    value={jobData.salary.min}
                    onChange={(e) => setJobData(prev => ({
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
                    value={jobData.salary.max}
                    onChange={(e) => setJobData(prev => ({
                      ...prev,
                      salary: { ...prev.salary, max: parseInt(e.target.value) }
                    }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2">Application Link</label>
                <input
                  type="url"
                  value={jobData.applyLink}
                  onChange={(e) => setJobData(prev => ({ ...prev, applyLink: e.target.value }))}
                  placeholder="https://example.com/apply"
                  className="w-full p-2 border rounded"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Direct link where candidates can apply for this position
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Post Job
          </button>
        </form>
      </div>
    </div>
  );
} 