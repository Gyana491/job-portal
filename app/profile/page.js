'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({
    title: '',
    skills: [],
    experience: [],
    education: [],
    bio: '',
    location: '',
    contactEmail: '',
    phone: '',
    linkedin: '',
    github: '',
    website: '',
    availability: 'immediate',
    preferredJobTypes: [],
    preferredLocations: [],
    expectedSalary: {
      min: 0,
      max: 0,
      currency: 'USD'
    }
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) {
        if (res.status === 404) {
          setProfile(prev => ({
            ...prev,
            user: session.user.id
          }));
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [session?.user.id]);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    fetchProfile();
  }, [session, router, fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = profile._id ? 'PUT' : 'POST';
      const res = await fetch('/api/profiles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (!res.ok) {
        throw new Error('Failed to save profile');
      }

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      toast.success('Profile saved successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (e, field) => {
    const values = e.target.value.split(',').map(item => item.trim());
    setProfile(prev => ({
      ...prev,
      [field]: values
    }));
  };

  const addExperience = () => {
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        location: '',
        from: '',
        to: '',
        current: false,
        description: ''
      }]
    }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {profile._id ? 'Edit Profile' : 'Create Profile'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={profile.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Brief professional summary"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={profile.skills.join(', ')}
                onChange={(e) => handleArrayChange(e, 'skills')}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., JavaScript, React, Node.js"
              />
            </div>

            {/* Experience */}
            <div className="bg-card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Experience</h2>
              
              {profile.experience.map((exp, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <div className="grid gap-4">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => {
                        const newExp = [...profile.experience];
                        newExp[index].title = e.target.value;
                        setProfile(prev => ({ ...prev, experience: newExp }));
                      }}
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...profile.experience];
                        newExp[index].company = e.target.value;
                        setProfile(prev => ({ ...prev, experience: newExp }));
                      }}
                      className="w-full p-2 border rounded"
                    />
                    {/* Add more experience fields as needed */}
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addExperience}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded"
              >
                Add Experience
              </button>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 