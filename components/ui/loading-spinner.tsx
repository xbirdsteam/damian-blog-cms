import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
}

export function LoadingSpinner({ size = 16 }: LoadingSpinnerProps) {
  return <Loader2 className="animate-spin" size={size} />;
}
