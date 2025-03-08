import JobDetails from './JobDetails';

export default function JobPage({ params }) {
  return <JobDetails id={params.id} />;
}
