import HomePage from "@/components/pages/HomePage";
import { hasBurmese } from "@/lib/i18n";

export default function Page() {
  return <HomePage lang="en" burmeseAvailable={hasBurmese()} />;
}
