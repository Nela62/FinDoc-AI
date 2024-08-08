import { OnboardingForm } from '../components/OnboardingForm';
import { updateUser } from './actions';

export default function OnboardPage() {
  return <OnboardingForm updateUser={updateUser} />;
}
