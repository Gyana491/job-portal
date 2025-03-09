import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'internship'],
    required: true
  },
  workType: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String,
    required: true
  }],
  skills: [{
    type: String,
    required: true
  }],
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  benefits: [String],
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  applicationDeadline: Date,
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead'],
    required: true
  },
  applyLink: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  }
}, {
  timestamps: true
});

// Add text index for search
jobSchema.index({
  title: 'text',
  company: 'text',
  location: 'text',
  description: 'text',
  skills: 'text'
});

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
export default Job;

