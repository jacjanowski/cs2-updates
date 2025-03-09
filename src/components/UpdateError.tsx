
interface UpdateErrorProps {
  error: string;
}

const UpdateError = ({ error }: UpdateErrorProps) => {
  return (
    <div className="p-6 rounded-lg bg-destructive/10 text-destructive">
      {error}
    </div>
  );
};

export default UpdateError;
