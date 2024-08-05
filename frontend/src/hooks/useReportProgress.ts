import { useEffect, useState } from 'react';

const messages = [
  'Fetching data from APIs...',
  'Parsing SEC filings...',
  'Fetching web news...',
  'Generating company overview...',
  'Writing report...',
  'Generating summary...',
  'Creating pdf file...',
];

const newMessages = [
  'Aggregating data from SEC filings, earnings call transcripts, and web news...',
  'Calculating target price and generating recommendation...',
  'Generating report (X out of Y sections complete)...',
  'Creating pdf file...',
];

const progressValue = 100 / messages.length;

export const useReportProgress = () => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState(messages[0]);

  const nextStep = () => {
    setStep((val) => ++val);
    setProgress((val) => val + progressValue);
  };

  useEffect(() => {
    setProgressMessage(messages[step]);
  }, [step]);

  const finalStep = () => {
    setProgress((val) => val + progressValue);
  };

  return { progress, progressMessage, nextStep, finalStep };
};
