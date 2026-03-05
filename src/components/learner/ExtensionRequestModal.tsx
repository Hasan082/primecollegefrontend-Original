import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, CreditCard, CalendarPlus, ShieldCheck, Lock } from "lucide-react";
import { EXTENSION_PLANS, type ExtensionPlan, formatDateDDMMYYYY } from "@/lib/deadlines";
import { addMonths } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qualificationTitle: string;
  currentExpiry: string;
}

const ExtensionRequestModal = ({ open, onOpenChange, qualificationTitle, currentExpiry }: Props) => {
  const [selectedPlan, setSelectedPlan] = useState<ExtensionPlan | null>(null);
  const [step, setStep] = useState<"select" | "payment" | "success">("select");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const newExpiry = selectedPlan
    ? formatDateDDMMYYYY(addMonths(new Date(), selectedPlan.months))
    : "";

  const handleProceedToPayment = () => {
    if (!selectedPlan) return;
    setStep("payment");
  };

  const handlePay = () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setStep("success");
      toast({ title: "Payment successful!", description: `Your deadline has been extended by ${selectedPlan?.label}.` });
    }, 1500);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setSelectedPlan(null); setStep("select"); setProcessing(false); }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5" /> Extend Deadline
          </DialogTitle>
        </DialogHeader>

        {step === "success" ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <h3 className="text-lg font-semibold">Extension Activated!</h3>
            <p className="text-sm text-muted-foreground">
              Your {selectedPlan?.label} extension is now active. New expiry: <span className="font-semibold text-foreground">{newExpiry}</span>
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground mt-2">
              A receipt has been sent to your email address.
            </div>
            <Button onClick={handleClose} className="mt-4">Close</Button>
          </div>
        ) : step === "payment" ? (
          <div className="space-y-4 pt-2">
            {/* Order Summary */}
            <Card className="p-4 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Order Summary</p>
              <div className="flex justify-between text-sm">
                <span>{selectedPlan?.label} Extension</span>
                <span className="font-semibold">£{selectedPlan?.price}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{qualificationTitle}</p>
              <div className="border-t border-border mt-3 pt-2 flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>£{selectedPlan?.price}</span>
              </div>
            </Card>

            {/* Payment Form (Demo) */}
            <div className="space-y-3">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" /> Payment Details
              </p>
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name on Card</Label>
                  <Input placeholder="John Smith" defaultValue="John Smith" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Card Number</Label>
                  <Input placeholder="4242 4242 4242 4242" defaultValue="•••• •••• •••• 4242" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Expiry</Label>
                    <Input placeholder="MM/YY" defaultValue="12/27" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">CVV</Label>
                    <Input placeholder="123" defaultValue="•••" type="password" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Your payment is secured with 256-bit SSL encryption.</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("select")}>Back</Button>
              <Button className="flex-1 gap-1.5" onClick={handlePay} disabled={processing}>
                {processing ? (
                  <>Processing...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> Pay £{selectedPlan?.price}</>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Qualification</p>
              <p className="text-sm font-medium">{qualificationTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">Current expiry: {currentExpiry}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Select Extension Plan</p>
              <div className="space-y-2">
                {EXTENSION_PLANS.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`p-3 cursor-pointer transition-all border-2 ${
                      selectedPlan?.id === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:border-muted-foreground/20"
                    }`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedPlan?.id === plan.id ? "border-primary" : "border-muted-foreground/30"
                        }`}>
                          {selectedPlan?.id === plan.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{plan.label}</p>
                          <p className="text-xs text-muted-foreground">{plan.months} month{plan.months > 1 ? "s" : ""} additional access</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-sm font-semibold">£{plan.price}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Pay now and your extension is activated instantly — no approval wait.</span>
            </div>

            <Button className="w-full gap-1.5" disabled={!selectedPlan} onClick={handleProceedToPayment}>
              <CreditCard className="w-4 h-4" />
              Proceed to Payment {selectedPlan && `— £${selectedPlan.price}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExtensionRequestModal;
