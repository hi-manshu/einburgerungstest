
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

/**
 * Shows a sponsor dialog, then on cancel, a confirmation dialog.
 *
 * Props:
 * - open: boolean (dialog shown or not)
 * - onSponsor: called if user clicks "Sponsor" (primary donation link)
 * - onCancelSponsor: called when dialog is closed/cancel
 * - onConfirmProceed: user confirms "Yes, download anyway"
 * - onGiveUp: if user confirms cancel twice, i.e. just download
 */
export function SponsorDownloadDialogs({
  open,
  onSponsor,
  onCancelSponsor,
  confirmOpen,
  onConfirmProceed,
  onGiveUp,
}: {
  open: boolean,
  onSponsor: () => void,
  onCancelSponsor: () => void,
  confirmOpen: boolean,
  onConfirmProceed: () => void,
  onGiveUp: () => void,
}) {
  // Helper to open sponsor link safely only once per click
  const openSponsorLink = () => {
    // For safety, in some browsers window.open may be restricted if called asynchronously
    window.open("https://coff.ee/himanshoe", "_blank", "noopener,noreferrer");
  };

  // Visually hidden label for accessibility
  const Hidden = ({ children }: { children: React.ReactNode }) => (
    <span className="sr-only">{children}</span>
  );

  return (
    <>
      {/* Sponsor Prompt Dialog */}
      <Dialog
        open={open}
        onOpenChange={v => {
          if (!v) onCancelSponsor();
        }}
      >
        <DialogContent
          aria-modal="true"
          aria-label="Sponsor this project"
          role="dialog"
          className="outline-none"
        >
          <DialogHeader>
            <Gift className="w-10 h-10 text-yellow-400 mx-auto mb-3" aria-hidden="true" />
            <DialogTitle className="text-center">Like this project?</DialogTitle>
            <DialogDescription className="text-center mt-2">
              If this app has helped you, consider sponsoring or sharing!
              Your support keeps it ad-free and helps with future features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              asChild
              className="w-full"
              variant="default"
              aria-label="Sponsor this project on coff.ee"
              onClick={() => { openSponsorLink(); onSponsor(); }}
            >
              <a
                href="https://coff.ee/himanshoe"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={open ? 0 : -1}
                aria-label="Sponsor this project"
              >
                <span className="inline-flex items-center">
                  Sponsor this project
                  <Hidden> (opens in a new tab)</Hidden>
                </span>
              </a>
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={onCancelSponsor}
              aria-label="Not now"
            >
              Not Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onOpenChange={v => {
          if (!v) onGiveUp();
        }}
      >
        <DialogContent
          aria-modal="true"
          aria-label="Sponsor confirmation"
          role="dialog"
          className="outline-none"
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              Are you sure?
            </DialogTitle>
            <DialogDescription className="text-center mt-1">
              Sponsoring or spreading the word helps keep this project going.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              className="w-full"
              variant="outline"
              onClick={onGiveUp}
              aria-label="Just Download PDF"
            >
              Just Download PDF
            </Button>
            <Button
              className="w-full"
              variant="default"
              aria-label="I'd like to Support"
              onClick={() => { openSponsorLink(); onSponsor(); }}
            >
              I'd like to Support!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
