import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import Logo from "@/components/ui/logo";

const VendorAction = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [vendorResponse, setVendorResponse] = useState("");
  const [orderTitle, setOrderTitle] = useState("");

  const handleSubmit = async () => {
    if (!token || !action) return;
    setLoading(true);
    setError(null);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/vendor-action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            action,
            quote_amount: quoteAmount ? parseFloat(quoteAmount) : undefined,
            vendor_response: vendorResponse || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
      setOrderTitle(data.order_title || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !action) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Link</h2>
            <p className="text-muted-foreground">This link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h2 className="text-xl font-bold mb-2">
              {action === "accept" ? "Order Accepted!" : "Quote Submitted!"}
            </h2>
            {orderTitle && <p className="font-medium mb-2">{orderTitle}</p>}
            <p className="text-muted-foreground">
              {action === "accept"
                ? "The Evnting team will be in touch to finalize the details."
                : "The Evnting team will review your quote and get back to you."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo className="scale-75" />
          </div>
          <CardTitle className="text-xl">
            {action === "accept" ? "Accept This Order" : "Submit Your Quote"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
              {error}
            </div>
          )}

          {action === "quote" && (
            <div>
              <Label>Your Quote Amount (₹)</Label>
              <Input
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          )}

          <div>
            <Label>{action === "accept" ? "Message (optional)" : "Additional Notes"}</Label>
            <Textarea
              value={vendorResponse}
              onChange={(e) => setVendorResponse(e.target.value)}
              placeholder={
                action === "accept"
                  ? "Any notes for the team..."
                  : "Include details about availability, terms, etc."
              }
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || (action === "quote" && !quoteAmount)}
            className="w-full"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
            ) : action === "accept" ? (
              <><CheckCircle className="mr-2 h-4 w-4" />Accept Order</>
            ) : (
              <><MessageSquare className="mr-2 h-4 w-4" />Submit Quote</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAction;
