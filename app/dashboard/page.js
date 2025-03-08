'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

function DashboardCard({ title, description, link, linkText }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link 
        href={link} 
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
      >
        {linkText}
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }
    
    setLoading(false);
  }, [session, status, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) return null;

  const employerCards = [
    {
      title: "Post a Job",
      description: "Create a new job listing to find qualified candidates",
      link: "/jobs/create",
      linkText: "Post Job"
    },
    {
      title: "My Job Listings",
      description: "Manage your existing job listings",
      link: "/jobs/my-listings",
      linkText: "View Jobs"
    },
    
  ];

  const candidateCards = [
    {
      title: "My Profile",
      description: "Update your professional profile to increase job match accuracy",
      link: "/profile",
      linkText: "Edit Profile"
    },
    {
      title: "Job Matches",
      description: "View jobs that match your skills and preferences",
      link: "/jobs/matches",
      linkText: "View Matches"
    },
    {
      title: "Browse Jobs",
      description: "Search and browse all available job listings",
      link: "/jobs",
      linkText: "Find Jobs"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {session.user.name}
          </h1>
          <p className="mt-2 text-gray-600">
            {session.user.role === 'employer' 
              ? 'Manage your job listings and find candidates'
              : 'Find your perfect job match'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {session.user.role === 'employer'
            ? employerCards.map((card, index) => (
                <DashboardCard key={index} {...card} />
              ))
            : candidateCards.map((card, index) => (
                <DashboardCard key={index} {...card} />
              ))
          }
        </div>
      </div>
    </div>
  );
}
