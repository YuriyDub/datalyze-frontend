import { IQueryResult } from '@/services/api/chat';

interface StrokeDataProps {
  data: IQueryResult;
  title: string | undefined;
}

export const StrokeData = ({ data, title }: StrokeDataProps) => {
  return (
    <div className='flex items-center gap-2'>
      <h2 className='text-2xl'>{title}:</h2>
      <div className="flex items-center justify-center h-12 px-4 bg-primary text-secondary rounded-full text-2xl font-bold mx-auto">
        {
          data.rows[0][
            data.columns[0].replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
          ] as string
        }
      </div>
    </div>
  );
};
