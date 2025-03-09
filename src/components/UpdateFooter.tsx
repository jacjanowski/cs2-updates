
import { ExternalLink } from "lucide-react";

interface UpdateFooterProps {
  url: string | undefined;
}

const UpdateFooter = ({ url }: UpdateFooterProps) => {
  if (!url) return null;
  
  return (
    <div className="mt-8 flex justify-end">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <ExternalLink size={16} className="mr-2" />
        View on Steam
      </a>
    </div>
  );
};

export default UpdateFooter;
