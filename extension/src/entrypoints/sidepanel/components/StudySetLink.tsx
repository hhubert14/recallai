import { ArrowRightIcon } from '@/components/Icons';

import { BASE_URL } from '@/lib/constants';

type StudySetLinkProps = {
  studySetPublicId: string | null;
  message: string;
};

export function StudySetLink({ studySetPublicId, message }: StudySetLinkProps) {
  if (!studySetPublicId) {
    return null;
  }

  const url = `${BASE_URL}/dashboard/study-set/${studySetPublicId}`;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-blue-500 hover:text-blue-600 hover:underline"
      >
        {message}
        <ArrowRightIcon className="w-4 h-4" />
      </a>
    </div>
  );
}
