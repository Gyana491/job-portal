/**
 * Calculate match score between a job and a candidate profile
 * @param {Object} job - Job listing object
 * @param {Object} profile - Candidate profile object
 * @returns {number} Score between 0 and 1
 */
export function calculateMatchScore(job, profile) {
  let score = 0;
  const weights = {
    skills: 0.5,        // 50% weight for skills match
    location: 0.2,      // 20% weight for location match
    jobType: 0.15,      // 15% weight for job type match
    experienceLevel: 0.15  // 15% weight for experience level match
  };

  // Match skills
  if (job.skills && profile.skills) {
    const matchingSkills = job.skills.filter(skill => 
      profile.skills.some(profileSkill => 
        profileSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    score += (matchingSkills.length / job.skills.length) * weights.skills;
  }

  // Match location
  if (job.location && profile.preferredLocations) {
    if (profile.preferredLocations.some(loc => 
      job.location.toLowerCase().includes(loc.toLowerCase())
    )) {
      score += weights.location;
    }
  }

  // Match job type
  if (job.jobType && profile.preferredJobTypes) {
    if (profile.preferredJobTypes.includes(job.jobType)) {
      score += weights.jobType;
    }
  }

  // Match experience level
  if (job.experienceLevel && profile.experience) {
    const experienceLevels = ['entry', 'junior', 'mid', 'senior', 'lead'];
    const profileExperience = profile.experience.length;
    const jobLevel = experienceLevels.indexOf(job.experienceLevel.toLowerCase());
    const profileLevel = Math.min(Math.floor(profileExperience / 2), 4);
    
    // Calculate experience match score (1 - normalized difference)
    score += (1 - Math.abs(jobLevel - profileLevel) / 4) * weights.experienceLevel;
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