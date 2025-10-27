import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  MapPin
} from 'lucide-react';

const regions = [
  { value: 'all', label: 'All India' },
  { value: 'raj', label: 'Rajasthan' },
  { value: 'mah', label: 'Maharashtra' },
  { value: 'pun', label: 'Punjab' },
  { value: 'kar', label: 'Karnataka' },
  { value: 'guj', label: 'Gujarat' },
];

const indicators = [
  { value: 'water_table', label: 'Water Table Depth' },
  { value: 'recharge', label: 'Groundwater Recharge' },
  { value: 'extraction', label: 'Extraction Rate' },
  { value: 'quality', label: 'Water Quality Index' },
];

const chartTypes = [
  { id: 'line', label: 'Line Chart', icon: LineChart },
  { id: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { id: 'pie', label: 'Pie Chart', icon: PieChart },
];

export default function AnalysisPage() {
  const [selectedRegion, setSelectedRegion] = useState('raj');
  const [selectedIndicator, setSelectedIndicator] = useState('water_table');
  const [yearRange, setYearRange] = useState([2015, 2023]);
  const [chartType, setChartType] = useState('line');
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonRegion, setComparisonRegion] = useState('mah');

  const handleAnalyze = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleExport = () => {
    // Simulate export
    console.log('Exporting analysis...');
  };

  // Mock data for demonstration
  const mockData = {
    timeSeries: [
      { year: 2015, value: 12.5 },
      { year: 2016, value: 11.8 },
      { year: 2017, value: 13.2 },
      { year: 2018, value: 10.9 },
      { year: 2019, value: 14.1 },
      { year: 2020, value: 13.7 },
      { year: 2021, value: 12.3 },
      { year: 2022, value: 15.2 },
      { year: 2023, value: 14.8 },
    ],
    categories: {
      safe: 45,
      semicritical: 28,
      critical: 18,
      overexploited: 9
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Data Analysis</h1>
          <p className="text-muted-foreground">
            Explore groundwater trends, patterns, and insights across India
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            Analyze
          </Button>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Analysis Parameters</span>
            </CardTitle>
            <CardDescription>
              Configure your analysis settings and parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Region Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Region</span>
                </label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Indicator Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Indicator</span>
                </label>
                <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {indicators.map((indicator) => (
                      <SelectItem key={indicator.value} value={indicator.value}>
                        {indicator.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Chart Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Chart Type</span>
                </label>
                <div className="flex space-x-1">
                  {chartTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={chartType === type.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType(type.id)}
                      className="flex-1"
                    >
                      <type.icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Year Range Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Year Range</span>
                </label>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{yearRange[0]}</Badge>
                  <span className="text-muted-foreground">to</span>
                  <Badge variant="outline">{yearRange[1]}</Badge>
                </div>
              </div>
              <Slider
                value={yearRange}
                onValueChange={setYearRange}
                max={2025}
                min={2004}
                step={1}
                className="w-full"
              />
            </div>

            {/* Comparison Mode Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <h4 className="font-medium">Comparison Mode</h4>
                <p className="text-sm text-muted-foreground">Compare with another region</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={comparisonMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setComparisonMode(!comparisonMode)}
                >
                  {comparisonMode ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
            </div>

            {comparisonMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium">Comparison Region</label>
                <Select value={comparisonRegion} onValueChange={setComparisonRegion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.filter(r => r.value !== selectedRegion).map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="raw-data">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Main Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {indicators.find(i => i.value === selectedIndicator)?.label} - {regions.find(r => r.value === selectedRegion)?.label}
                  </CardTitle>
                  <CardDescription>
                    Trend analysis from {yearRange[0]} to {yearRange[1]}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                        <span>Loading chart data...</span>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Chart visualization would appear here</p>
                        <p className="text-sm">Connected to Recharts/Chart.js</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Categories</CardTitle>
                  <CardDescription>
                    Distribution of groundwater assessment units
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(mockData.categories).map(([category, percentage]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize font-medium">{category.replace(/([A-Z])/g, ' $1')}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              category === 'safe' ? 'bg-green-500' :
                              category === 'semicritical' ? 'bg-yellow-500' :
                              category === 'critical' ? 'bg-orange-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {comparisonMode && (
              <Card>
                <CardHeader>
                  <CardTitle>Regional Comparison</CardTitle>
                  <CardDescription>
                    Side-by-side comparison between {regions.find(r => r.value === selectedRegion)?.label} and {regions.find(r => r.value === comparisonRegion)?.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Comparison chart would appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>
                  AI-generated insights from your analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-medium mb-2">Trend Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Water table depth in {regions.find(r => r.value === selectedRegion)?.label} shows a declining trend from {yearRange[0]} to {yearRange[1]}, with an average decrease of 0.8 meters per year.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-medium mb-2">Critical Observation</h4>
                    <p className="text-sm text-muted-foreground">
                      The data indicates accelerated depletion in the last 3 years, primarily in the western districts. Immediate intervention is recommended.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-medium mb-2">Seasonal Pattern</h4>
                    <p className="text-sm text-muted-foreground">
                      Monsoon recharge patterns show 15% variability, suggesting climate change impacts on groundwater replenishment cycles.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="raw-data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Raw Data Table</CardTitle>
                <CardDescription>
                  Downloadable dataset for your analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Data table would be rendered here</p>
                  <p className="text-sm">Connected to backend data source</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}