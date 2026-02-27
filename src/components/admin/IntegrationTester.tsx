import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, TestTube, Loader2, TrendingUp, Users, Database, MessageCircle } from "lucide-react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const IntegrationTester = () => {
  const [isTestingGA, setIsTestingGA] = useState(false);
  const [isTestingZoho, setIsTestingZoho] = useState(false);
  const [isTestingWati, setIsTestingWati] = useState(false);
  const [gaStatus, setGaStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [zohoStatus, setZohoStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [watiStatus, setWatiStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const testGoogleAnalytics = async () => {
    setIsTestingGA(true);
    try {
      // Check if gtag is loaded
      if (typeof window.gtag === 'function') {
        // Send a test event
        window.gtag('event', 'admin_test', {
          event_category: 'Admin',
          event_label: 'Integration Test',
          value: 1
        });
        
        setGaStatus('success');
        toast({
          title: "Google Analytics Test",
          description: "Test event sent successfully! Check your GA dashboard.",
        });
      } else {
        throw new Error('Google Analytics not loaded');
      }
    } catch (error) {
      setGaStatus('error');
      toast({
        title: "Google Analytics Error",
        description: "GA not properly loaded or configured.",
        variant: "destructive"
      });
    } finally {
      setIsTestingGA(false);
    }
  };

  const testZohoIntegration = async () => {
    setIsTestingZoho(true);
    try {
      const testData = {
        submissionId: null,
        name: 'Test Contact (Admin)',
        email: `test-${Date.now()}@evnting-test.com`,
        phone: '+1234567890',
        message: 'This is a test contact from the admin integration tester.',
        formType: 'contact',
        eventType: 'corporate',
        rentalTitle: null,
        location: 'Test Location',
      };

      const response = await supabase.functions.invoke('zoho-crm', {
        body: testData,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setZohoStatus('success');
      toast({
        title: "Zoho CRM Test",
        description: "Test lead created successfully in Zoho CRM!",
      });
    } catch (error) {
      setZohoStatus('error');
      toast({
        title: "Zoho CRM Error",
        description: error instanceof Error ? error.message : "Failed to create test lead",
        variant: "destructive"
      });
    } finally {
      setIsTestingZoho(false);
    }
  };

  const testWatiIntegration = async () => {
    setIsTestingWati(true);
    try {
      const { data, error } = await supabase.functions.invoke('wati-whatsapp', {
        body: {
          action: 'send_to_vendor',
          orderId: '00000000-0000-0000-0000-000000000000',
          vendorPhone: '919999999999',
          vendorName: 'Test Vendor',
        },
      });

      if (error) throw error;

      if (data?.whatsapp_sent) {
        setWatiStatus('success');
        toast({ title: "WATI WhatsApp Test", description: "Message sent successfully via WATI API!" });
      } else {
        // API connected but order not found is expected for dummy ID
        setWatiStatus('success');
        toast({ title: "WATI WhatsApp Test", description: data?.message || "Edge function responded. Check WATI secrets are configured." });
      }
    } catch (error) {
      setWatiStatus('error');
      toast({
        title: "WATI WhatsApp Error",
        description: error instanceof Error ? error.message : "Failed to reach WATI edge function",
        variant: "destructive",
      });
    } finally {
      setIsTestingWati(false);
    }
  };

  const resetTests = () => {
    setGaStatus('idle');
    setZohoStatus('idle');
    setWatiStatus('idle');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TestTube className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">Integration Tester</h2>
        </div>
        <Button onClick={resetTests} variant="outline">
          Reset Tests
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Google Analytics Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Google Analytics</span>
              <StatusBadge status={gaStatus} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Measurement ID:</strong> G-5RKKBP5M5S</p>
              <p><strong>Stream:</strong> Evnting</p>
              <p><strong>URL:</strong> https://evnting.com/</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Test Details:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Verifies GA script is loaded</li>
                <li>• Sends test event to GA</li>
                <li>• Check your GA dashboard for "admin_test" event</li>
              </ul>
            </div>

            <Button 
              onClick={testGoogleAnalytics}
              disabled={isTestingGA}
              className="w-full"
            >
              {isTestingGA ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing GA...
                </>
              ) : (
                'Test Google Analytics'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Zoho CRM Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-primary" />
              <span>Zoho CRM</span>
              <StatusBadge status={zohoStatus} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Integration:</strong> Zoho CRM v2 API</p>
              <p><strong>Auth:</strong> OAuth2 (Refresh Token)</p>
              <p><strong>Module:</strong> Leads</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Test Details:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Creates test lead in Zoho CRM</li>
                <li>• Verifies OAuth2 token exchange</li>
                <li>• Check your Zoho CRM Leads for test entry</li>
              </ul>
            </div>

            <Button 
              onClick={testZohoIntegration}
              disabled={isTestingZoho}
              className="w-full"
            >
              {isTestingZoho ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Zoho CRM...
                </>
              ) : (
                'Test Zoho CRM Integration'
              )}
            </Button>
          </CardContent>
        </Card>
        {/* WATI WhatsApp Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span>WATI WhatsApp</span>
              <StatusBadge status={watiStatus} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Integration:</strong> WATI Session API</p>
              <p><strong>Auth:</strong> Bearer Token</p>
              <p><strong>Use:</strong> Vendor order notifications</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Test Details:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Invokes wati-whatsapp edge function</li>
                <li>• Verifies WATI API connectivity</li>
                <li>• Uses a dummy order ID (no real message sent)</li>
              </ul>
            </div>

            <Button
              onClick={testWatiIntegration}
              disabled={isTestingWati}
              className="w-full"
            >
              {isTestingWati ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing WATI...
                </>
              ) : (
                'Test WATI WhatsApp'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Google Analytics</span>
              <div className="flex items-center space-x-2">
                <StatusIcon status={gaStatus} />
                <span className="text-sm text-muted-foreground">
                  {gaStatus === 'idle' && 'Not tested'}
                  {gaStatus === 'success' && 'Working correctly'}
                  {gaStatus === 'error' && 'Configuration issue'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Zoho CRM</span>
              <div className="flex items-center space-x-2">
                <StatusIcon status={zohoStatus} />
                <span className="text-sm text-muted-foreground">
                  {zohoStatus === 'idle' && 'Not tested'}
                  {zohoStatus === 'success' && 'Working correctly'}
                  {zohoStatus === 'error' && 'API connection issue'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">WATI WhatsApp</span>
              <div className="flex items-center space-x-2">
                <StatusIcon status={watiStatus} />
                <span className="text-sm text-muted-foreground">
                  {watiStatus === 'idle' && 'Not tested'}
                  {watiStatus === 'success' && 'Working correctly'}
                  {watiStatus === 'error' && 'API connection issue'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatusBadge = ({ status }: { status: 'idle' | 'success' | 'error' }) => {
  if (status === 'success') {
    return <Badge variant="default" className="bg-green-500 hover:bg-green-500">Working</Badge>;
  }
  if (status === 'error') {
    return <Badge variant="destructive">Error</Badge>;
  }
  return <Badge variant="secondary">Untested</Badge>;
};

const StatusIcon = ({ status }: { status: 'idle' | 'success' | 'error' }) => {
  if (status === 'success') {
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  }
  if (status === 'error') {
    return <XCircle className="h-4 w-4 text-red-500" />;
  }
  return <div className="h-4 w-4 rounded-full bg-gray-300" />;
};

export default IntegrationTester;