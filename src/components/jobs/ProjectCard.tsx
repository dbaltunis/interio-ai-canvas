
interface ProjectCardProps {
  project: any;
  onClick: () => void;
}

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  return (
    <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50" onClick={onClick}>
      <h3 className="font-medium">{project.name}</h3>
      <p className="text-sm text-gray-600">{project.description}</p>
      <p className="text-xs text-gray-500">Status: {project.status}</p>
    </div>
  );
};
