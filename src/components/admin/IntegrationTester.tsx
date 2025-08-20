import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, TestTube, Loader2, TrendingUp, Users } from "lucide-react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const IntegrationTester = () => {
  const [isTestingGA, setIsTestingGA] = useState(false);
  const [isTestingHubSpot, setIsTestingHubSpot] = useState(false);
  const [gaStatus, setGaStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hubspotStatus, setHubspotStatus] = useState<'idle' | 'success' | 'error'>('idle');
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

  const testHubSpotIntegration = async () => {
    setIsTestingHubSpot(true);
    try {
      const testData = {
        submissionId: null,
        name: 'Test Contact (Admin)',
        email: `test-${Date.now()}@avens-test.com`,
        phone: '+1234567890',
        message: 'This is a test contact from the admin integration tester.',
        formType: 'contact',
        eventType: 'corporate',
        rentalTitle: null,
        location: 'Test Location',
      };

      const response = await supabase.functions.invoke('hubspot-integration', {
        body: testData,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setHubspotStatus('success');
      toast({
        title: "HubSpot Test",
        description: "Test contact created successfully in HubSpot CRM!",
      });
    } catch (error) {
      setHubspotStatus('error');
      toast({
        title: "HubSpot Error",
        description: error instanceof Error ? error.message : "Failed to create test contact",
        variant: "destructive"
      });
    } finally {
      setIsTestingHubSpot(false);
    }
  };

  const resetTests = () => {
    setGaStatus('idle');
    setHubspotStatus('idle');
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <p><strong>Stream:</strong> Avens Expositions</p>
              <p><strong>URL:</strong> https://avens.lovable.app/</p>
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

        {/* HubSpot Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>HubSpot CRM</span>
              <StatusBadge status={hubspotStatus} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>API Key:</strong> pat-na2-c98***7860 (Hidden)</p>
              <p><strong>Portal ID:</strong> 243650365</p>
              <p><strong>App ID:</strong> 18272842</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Test Details:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Creates test contact in HubSpot</li>
                <li>• Verifies API connectivity</li>
                <li>• Check your HubSpot contacts for test entry</li>
              </ul>
            </div>

            <Button 
              onClick={testHubSpotIntegration}
              disabled={isTestingHubSpot}
              className="w-full"
            >
              {isTestingHubSpot ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing HubSpot...
                </>
              ) : (
                'Test HubSpot Integration'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <span className="font-medium">HubSpot CRM</span>
              <div className="flex items-center space-x-2">
                <StatusIcon status={hubspotStatus} />
                <span className="text-sm text-muted-foreground">
                  {hubspotStatus === 'idle' && 'Not tested'}
                  {hubspotStatus === 'success' && 'Working correctly'}
                  {hubspotStatus === 'error' && 'API connection issue'}
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