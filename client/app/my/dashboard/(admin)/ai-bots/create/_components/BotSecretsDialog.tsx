"use client";

import { useState } from "react";
import { Copy, Check, AlertTriangle, Eye, EyeOff } from "lucide-react";
// Ensure these paths match your project structure exactly
import { Button } from "@/app/ui/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/ui/shadcn/dialog";
import { Input } from "@/app/ui/shadcn/input";
import { Textarea } from "@/app/ui/shadcn/textarea";
import { Label } from "@/app/ui/shadcn/label";
import { BotSecretResponse } from "@/services/interfaces/botInterfaces";

interface Props {
  open: boolean;
  data: BotSecretResponse | null;
  onClose: () => void;
}

export function BotSecretsDialog({ open, data, onClose }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  if (!data) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent
        // 1. FIXED: Constrain max width (w-[95vw]) and ensure vertical scrolling (max-h-[90vh])
        // This prevents the modal from growing off-screen on small devices
        className="sm:max-w-xl w-[95vw] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5 flex-shrink-0" />
            <span>Bot Created Successfully</span>
          </DialogTitle>
          <DialogDescription className="text-left">
            The bot <strong className="break-words">{data.name}</strong> has
            been registered.
            <br />
            <span
              className="mt-3 block rounded-md bg-amber-50 p-3 text-amber-900
                border border-amber-200 text-sm"
            >
              <AlertTriangle
                className="mb-1 h-4 w-4 inline mr-2 align-text-bottom"
              />
              <strong>Important:</strong> Please copy these credentials now. The{" "}
              <strong>API Secret</strong> will NOT be shown again.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Webhook URL */}
          <div className="grid gap-2">
            <Label className="text-base font-semibold">
              Webhook URL (For your Python Bot)
            </Label>
            <div className="flex items-start gap-2">
              <Textarea
                readOnly
                value={data.webhookUrl}
                // 2. FIXED: 'break-all' forces the long URL to wrap instead of overflowing horizontally
                className="font-mono text-xs sm:text-sm bg-muted resize-none
                  h-auto min-h-[80px] p-3 break-all"
              />
              <Button
                size="icon"
                variant="outline"
                className="mt-1 flex-shrink-0" // 3. FIXED: Prevents button from being squashed
                onClick={() => copyToClipboard(data.webhookUrl, "webhookUrl")}
                title="Copy Webhook URL"
              >
                {copiedField === "webhookUrl" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* API Key */}
          <div className="grid gap-2">
            <Label className="text-base font-semibold">API Key</Label>
            <div className="flex items-start gap-2">
              <Textarea
                readOnly
                value={data.webhookToken}
                // 2. FIXED: 'break-all' here too for long keys
                className="font-mono text-xs sm:text-sm bg-muted resize-none
                  h-auto min-h-[60px] p-3 break-all"
                rows={2}
              />
              <Button
                size="icon"
                variant="outline"
                className="mt-1 flex-shrink-0"
                onClick={() => copyToClipboard(data.webhookToken, "apiKey")}
                title="Copy API Key"
              >
                {copiedField === "apiKey" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* API Secret */}
          <div className="grid gap-2">
            <Label className="text-base font-semibold text-destructive">
              API Secret
            </Label>
            <div className="flex items-start gap-2">
              {/* 4. FIXED: 'min-w-0' is crucial for flex children to shrink properly */}
              <div className="relative flex-1 min-w-0">
                <Input
                  readOnly
                  type={showSecret ? "text" : "password"}
                  value={data.apiSecret}
                  className="font-mono text-xs sm:text-sm h-12 sm:h-14 p-3
                    sm:p-4 bg-red-50 border-red-200 text-red-900 pr-10 sm:pr-12
                    text-ellipsis overflow-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-red-700 hover:text-red-900"
                >
                  {showSecret ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="h-12 w-12 sm:h-14 sm:w-14 border-red-200
                  hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                onClick={() => copyToClipboard(data.apiSecret, "apiSecret")}
                title="Copy Secret"
              >
                {copiedField === "apiSecret" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter
          className="flex-col sm:flex-row sm:justify-between gap-4 items-center"
        >
          <p
            className="text-sm text-muted-foreground font-medium text-center
              sm:text-left"
          >
            Make sure you have copied the API Secret.
          </p>
          <Button onClick={onClose} size="lg" className="w-full sm:w-auto">
            I have saved these credentials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
