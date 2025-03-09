
const UpdateLoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-2"></div>
      <div className="h-12 w-3/4 bg-muted rounded mb-6"></div>
      <div className="h-72 w-full bg-muted rounded mb-6"></div>
      <div className="space-y-4">
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-full bg-muted rounded"></div>
        <div className="h-4 w-5/6 bg-muted rounded"></div>
      </div>
    </div>
  );
};

export default UpdateLoadingSkeleton;
