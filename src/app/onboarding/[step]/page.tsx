// src/app/onboarding/[step]/page.tsx (FINAL)
import Step1Metrics from "@/components/onboarding/Step1Metrics";
import Step2Goals from "@/components/onboarding/Step2Goals"; // Import Step 2
import Step3Finish from "@/components/onboarding/Step3Finish"; // Import Step 3
import SignOutButton from "@/components/SignOutButton";

export default async function OnboardingPage({ params }: { params: { step: string } }) {
  const step = parseInt(params.step, 10);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Metrics />;
      case 2:
        return <Step2Goals />; // Add case for Step 2
      case 3:
        return <Step3Finish />; // Add case for Step 3
      default:
        return <div>Step not found. Please start over.</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md mx-auto bg-slate-800 rounded-lg shadow-xl p-8 space-y-8">
        {renderStep()}
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-800 text-slate-500">Or</span></div>
        </div>
        <div className="text-center"><SignOutButton /></div>
      </div>
    </div>
  );
}