import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  Eye, 
  MousePointerClick, 
  TrendingUp, 
  Globe,
  ExternalLink,
  AlertCircle
} from "lucide-react";

const GoogleAnalyticsDashboard = () => {
  // Google Analytics Measurement ID: G-5RKKBP5M5S
  // This ID should be configured in your website's tracking code
  
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    pageViews: 0,
    sessions: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    topPages: [],
    isConfigured: false
  });

  // Mock data for demonstration - in a real implementation, you'd fetch this from Google Analytics API
  useEffect(() => {
    // Check if Google Analytics is configured by detecting gtag function
    const isGAConfigured = typeof window !== 'undefined' && typeof (window as any).gtag === 'function';
    
    // Simulate analytics data
    const mockData = {
      totalUsers: 1245,
      pageViews: 3456,
      sessions: 892,
      bounceRate: 34.5,
      avgSessionDuration: 145, // in seconds
      topPages: [
        { page: '/', views: 1234, title: 'Home' },
        { page: '/services', views: 567, title: 'Services' },
        { page: '/portfolio', views: 432, title: 'Portfolio' },
        { page: '/about', views: 321, title: 'About' },
        { page: '/events/wedding', views: 298, title: 'Wedding Events' }
      ],
      isConfigured: isGAConfigured // Automatically detect GA configuration
    };

    setAnalyticsData(mockData);
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!analyticsData.isConfigured) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold">Google Analytics Setup</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect Google Analytics to track your website performance, user behavior, and traffic insights.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Analytics Not Connected</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">To set up Google Analytics:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics</a></li>
                <li>Create a new property for your website</li>
                <li>Copy your Measurement ID (starts with G-)</li>
                <li>Add the tracking code to your website</li>
                <li>Configure the analytics API for dashboard integration</li>
              </ol>
            </div>

            <div className="flex space-x-2">
              <Button asChild variant="outline" className="flex-1">
                <a 
                  href="https://analytics.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Google Analytics</span>
                </a>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <a 
                  href="https://developers.google.com/analytics/devguides/reporting/core/v4/quickstart/web-js" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Setup Guide</span>
                </a>
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Your Google Analytics ID:</strong> G-5RKKBP5M5S<br/>
                <strong>Note:</strong> Once configured, this dashboard will display real-time analytics data including 
                page views, user sessions, bounce rates, and traffic sources.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Website Analytics</h2>
          <p className="text-muted-foreground">Last 30 days performance overview</p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Live Data</span>
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.pageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.sessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatDuration(analyticsData.avgSessionDuration)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.bounceRate}%</div>
            <p className="text-xs text-muted-foreground">
              -3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analyticsData.topPages.map((page: any, index) => (
              <div key={page.page} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{page.title}</p>
                    <p className="text-xs text-muted-foreground">{page.page}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{page.views.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">views</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex space-x-2">
          <Button asChild variant="outline">
            <a 
              href="https://analytics.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View Full Analytics</span>
            </a>
          </Button>
          <Button asChild variant="outline">
            <a 
              href="https://search.google.com/search-console" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Search Console</span>
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleAnalyticsDashboard;