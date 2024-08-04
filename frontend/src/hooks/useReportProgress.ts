import { useState } from 'react';

const messages = [
  'Fetching data from APIs...',
  'Parsing SEC filings...',
  'Fetching web news...',
  'Generating company overview...',
  'Writing report...',
  'Generating summary...',
  'Creating pdf file...',
];

const progressValue = 100 / messages.length;

export const useReportProgress = () => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState(messages[0]);

  const nextStep = () => {
    setStep((val) => (val += 1));
    setProgress((val) => val + progressValue);
    setProgressMessage(messages[step]);
  };

  const finalStep = () => {
    setProgress((val) => val + progressValue);
  };

  return { progress, progressMessage, nextStep, finalStep };
};
