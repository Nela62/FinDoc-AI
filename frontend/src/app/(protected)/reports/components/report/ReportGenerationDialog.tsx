import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { useBoundStore } from '@/providers/store-provider';
import { useEffect, useState } from 'react';

const progressMessages = [
  'Retrieving context from SEC filings...',
  'Fetching data from financial APIs...',
  'Searching the web for financial news...',
  'Generating sections ',
  'Generating charts and tables...',
];

type DialogProps = {
  cancelReportFn: () => void;
  downloadReportFn: () => void;
  editReportFn: () => void;
  isOpen: boolean;
};

export const ReportGenerationDialog = ({
  cancelReportFn,
  downloadReportFn,
  editReportFn,
  isOpen,
}: DialogProps) => {
  const { message, progress } = useBoundStore((state) => state);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {progress === 100 ? 'Report Generated' : 'Generating Report'}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>{message}</AlertDialogDescription>
        <Progress value={progress} className="" />
        <AlertDialogFooter>
          {progress !== 100 ? (
            <AlertDialogCancel onClick={cancelReportFn}>
              Cancel
            </AlertDialogCancel>
          ) : (
            <>
              <AlertDialogAction onClick={downloadReportFn}>
                Download Report
              </AlertDialogAction>
              <AlertDialogAction onClick={editReportFn}>
                Edit Report
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
