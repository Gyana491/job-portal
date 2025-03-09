/**
 * Calculate match score between a job and a candidate profile
 * @param {Object} job - Job listing object
 * @param {Object} profile - Candidate profile object
 * @returns {number} Score between 0 and 1
 */
export function calculateMatchScore(job, profile) {
  let score = 0;
  const weights = {
    skills: 0.4,        // Reduced from 0.5 to make room for salary match
    location: 0.2,      
    jobType: 0.15,      
    experienceLevel: 0.15,
    salary: 0.1         // Added salary match weight
  };

  // Match skills - normalize skill names and count matches
  if (job.skills && profile.skills) {
    const normalizedJobSkills = job.skills.map(s => s.toLowerCase().trim());
    const normalizedProfileSkills = profile.skills.map(s => s.toLowerCase().trim());
    
    const matchingSkills = normalizedJobSkills.filter(skill => 
      normalizedProfileSkills.includes(skill)
    );
    
    // Use Jaccard similarity for skills match
    const union = new Set([...normalizedJobSkills, ...normalizedProfileSkills]).size;
    const intersection = matchingSkills.length;
    score += (intersection / union) * weights.skills;
  }

  // Match location - check if job location matches any preferred locations
  if (job.location && profile.preferredLocations) {
    const normalizedJobLocation = job.location.toLowerCase().trim();
    const hasMatch = profile.preferredLocations.some(loc => 
      normalizedJobLocation.includes(loc.toLowerCase().trim())
    );
    if (hasMatch) {
      score += weights.location;
    }
  }

  // Match job type
  if (job.jobType && profile.preferredJobTypes) {
    if (profile.preferredJobTypes.includes(job.jobType)) {
      score += weights.jobType;
    }
  }

  // Match experience level - more nuanced calculation
  if (job.experienceLevel && profile.experience) {
    const experienceLevels = ['entry', 'junior', 'mid', 'senior', 'lead'];
    const profileExperience = profile.experience.length;
    
    // Convert years of experience to level
    const profileLevel = Math.min(Math.floor(profileExperience / 2), 4);
    const jobLevel = experienceLevels.indexOf(job.experienceLevel.toLowerCase());
    
    // Calculate experience match score using Gaussian function
    const levelDifference = Math.abs(jobLevel - profileLevel);
    const experienceScore = Math.exp(-Math.pow(levelDifference, 2) / 2);
    score += experienceScore * weights.experienceLevel;
  }

  // Add salary match calculation
  if (job.salary && profile.expectedSalary) {
    const jobMin = job.salary.min || 0;
    const jobMax = job.salary.max || Infinity;
    const profileMin = profile.expectedSalary.min || 0;
    const profileMax = profile.expectedSalary.max || Infinity;
    
    // Calculate overlap percentage
    const overlap = Math.min(jobMax, profileMax) - Math.max(jobMin, profileMin);
    if (overlap > 0) {
      const jobRange = jobMax - jobMin;
      const profileRange = profileMax - profileMin;
      const salaryScore = overlap / Math.min(jobRange, profileRange);
      score += salaryScore * weights.salary;
    }
  }

  // Normalize final score between 0 and 1
  return Math.min(Math.max(score, 0), 1);
}

/**
 * Get experience level label based on years of experience
 * @param {number} years - Years of experience
 * @returns {string} Experience level label
 */
export function getExperienceLevel(years) {
  if (years < 1) return 'entry';
  if (years < 3) return 'junior';
  if (years < 5) return 'mid';
  if (years < 8) return 'senior';
  return 'lead';
}

/**
 * Calculate salary match score
 * @param {Object} jobSalary - Job salary range object
 * @param {Object} profileSalary - Profile expected salary object
 * @returns {number} Score between 0 and 1
 */
export function calculateSalaryMatch(jobSalary, profileSalary) {
  if (!jobSalary || !profileSalary) return 0;

  // Normalize currencies (assuming same currency for now)
  const jobMin = parseInt(jobSalary.min);
  const jobMax = parseInt(jobSalary.max);
  const profileMin = parseInt(profileSalary.min);
  const profileMax = parseInt(profileSalary.max);

  // Check for overlap in ranges
  const overlap = Math.min(jobMax, profileMax) - Math.max(jobMin, profileMin);
  if (overlap < 0) return 0;

  // Calculate match score based on overlap percentage
  const jobRange = jobMax - jobMin;
  const profileRange = profileMax - profileMin;
  const overlapScore = overlap / Math.min(jobRange, profileRange);

  return Math.min(overlapScore, 1);
}

/**
 * Calculate skills relevance score
 * @param {string[]} jobSkills - Required job skills
 * @param {string[]} profileSkills - Candidate skills
 * @returns {number} Score between 0 and 1
 */
export function calculateSkillsRelevance(jobSkills, profileSkills) {
  if (!jobSkills?.length || !profileSkills?.length) return 0;

  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase());
  const normalizedProfileSkills = profileSkills.map(s => s.toLowerCase());

  const matchingSkills = normalizedJobSkills.filter(skill =>
    normalizedProfileSkills.includes(skill)
  );

  return matchingSkills.length / jobSkills.length;
} 