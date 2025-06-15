
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

interface SponsorCardProps {
  onClose: () => void;
}

export function SponsorCard({ onClose }: SponsorCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center">
          <Gift className="w-10 h-10 text-yellow-400 mb-2" />
          <CardTitle>Support This Project</CardTitle>
          <CardDescription>
            If this exam app is helping you, consider sponsoring or sharing it! Your support keeps it ad-free and improves the platform for everyone.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button asChild className="w-full" variant="default">
            <a
              href="https://coff.ee/himanshoe"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sponsor this project
            </a>
          </Button>
          <Button variant="secondary" onClick={onClose} className="w-full">
            Continue Exam
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
