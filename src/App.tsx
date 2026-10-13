import { MotionConfig } from "framer-motion";
import { ExperienceProvider } from "@/app/ExperienceState";
import ExperienceShell from "@/app/ExperienceShell";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ExperienceProvider>
        <ExperienceShell />
      </ExperienceProvider>
    </MotionConfig>
  );
}
