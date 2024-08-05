import { Params } from '@/app/api/building-block/utils/blocks';
import { capitalizeWords } from '@/lib/utils/formatText';
import { createJob, Job, waitForJobCompletion } from '@/lib/utils/jobs';
import { Overview } from '@/types/alphaVantageApi';
import { Dispatch, SetStateAction } from 'react';
import { getRecommendation } from '../../utils/fetchAPI';
