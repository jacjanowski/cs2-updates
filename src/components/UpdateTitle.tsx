
import { format } from 'date-fns';

interface UpdateTitleProps {
  title: string;
  date: string;
}

const UpdateTitle = ({ title, date }: UpdateTitleProps) => {
  const formattedDate = date 
    ? format(new Date(date), 'MMMM d, yyyy').toUpperCase() 
    : '';

  return (
    <div>
      {formattedDate && (
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase px-6 pt-6 pb-1">
          {formattedDate}
        </p>
      )}
      <h1 className="text-3xl font-bold px-6 pb-4">{title}</h1>
    </div>
  );
};

export default UpdateTitle;
