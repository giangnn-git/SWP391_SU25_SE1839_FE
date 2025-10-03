import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertTriangle, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../context/AuthContext';

const Analytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('6months');

  // Mock data for charts
  const failureRateByModel = [
    { model: 'Model 3', failures: 12, total: 1000, rate: 1.2 },
    { model: 'Model Y', failures: 8, total: 800, rate: 1.0 },
    { model: 'Model S', failures: 15, total: 600, rate: 2.5 },
    { model: 'iX', failures: 6, total: 400, rate: 1.5 },
    { model: 'e-tron', failures: 10, total: 500, rate: 2.0 },
    { model: 'Leaf', failures: 4, total: 300, rate: 1.3 }
  ];

  const failureRateByPart = [
    { part: 'Battery Pack', failures: 18, cost: 45000 },
    { part: 'Motor Controller', failures: 12, cost: 28000 },
    { part: 'Charging Port', failures: 15, cost: 12000 },
    { part: 'Infotainment', failures: 8, cost: 8000 },
    { part: 'Cooling System', failures: 6, cost: 15000 }
  ];

  const failureRateByRegion = [
    { region: 'North', failures: 25, claims: 32 },
    { region: 'South', failures: 18, claims: 24 },
    { region: 'East', failures: 22, claims: 28 },
    { region: 'West', failures: 20, claims: 26 },
    { region: 'Central', failures: 15, claims: 20 }
  ];

  const costTrendData = [
    { month: 'Jan', cost: 125000, claims: 45 },
    { month: 'Feb', cost: 138000, claims: 52 },
    { month: 'Mar', cost: 142000, claims: 58 },
    { month: 'Apr', cost: 128000, claims: 48 },
    { month: 'May', cost: 156000, claims: 62 },
    { month: 'Jun', cost: 134000, claims: 51 }
  ];

  const claimsByCategory = [
    { name: 'Battery', value: 35, color: '#8884d8' },
    { name: 'Motor', value: 25, color: '#82ca9d' },
    { name: 'Electronics', value: 20, color: '#ffc658' },
    { name: 'Charging', value: 15, color: '#ff7300' },
    { name: 'Other', value: 5, color: '#00ff00' }
  ];

  const performanceMetrics = [
    {
      title: 'Average Resolution Time',
      value: '3.2 days',
      change: -8,
      changeLabel: 'vs last month',
      icon: Clock,
      trend: 'down'
    },
    {
      title: 'Customer Satisfaction',
      value: '4.6/5.0',
      change: 5,
      changeLabel: 'vs last month',
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Warranty Cost/Vehicle',
      value: '$245',
      change: -12,
      changeLabel: 'vs last month',
      icon: DollarSign,
      trend: 'down'
    },
    {
      title: 'Repeat Claims Rate',
      value: '2.8%',
      change: -15,
      changeLabel: 'vs last month',
      icon: AlertTriangle,
      trend: 'down'
    }
  ];

  const predictiveCostAnalysis = [
    { month: 'Jul', predicted: 145000, historical: 134000 },
    { month: 'Aug', predicted: 152000, historical: 148000 },
    { month: 'Sep', predicted: 148000, historical: 155000 },
    { month: 'Oct', predicted: 158000, historical: null },
    { month: 'Nov', predicted: 162000, historical: null },
    { month: 'Dec', predicted: 155000, historical: null }
  ];

  const getMetricIcon = (trend) => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  const getMetricColor = (trend, positive) => {
    if (positive) {
      return trend === 'up' ? 'text-green-600' : 'text-red-600';
    } else {
      return trend === 'up' ? 'text-red-600' : 'text-green-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Reporting & Analytics</h1>
          <p className="text-muted-foreground">
            {user?.role === 'sc-staff' || user?.role === 'sc-technician'
              ? 'Service center performance and warranty insights'
              : 'Comprehensive warranty analytics and cost predictions'
            }
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
            <SelectItem value="2years">Last 2 Years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const TrendIcon = getMetricIcon(metric.trend);
          const isPositiveTrend = metric.title === 'Customer Satisfaction';

          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center space-x-2">
                  <IconComponent className="w-4 h-4" />
                  <span>{metric.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendIcon className={`w-3 h-3 ${getMetricColor(metric.trend, isPositiveTrend)}`} />
                  <span className={`text-sm ${getMetricColor(metric.trend, isPositiveTrend)}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-sm text-muted-foreground">{metric.changeLabel}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="failures" className="w-full">
        <TabsList>
          <TabsTrigger value="failures">Failure Analysis</TabsTrigger>
          <TabsTrigger value="costs">Cost Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analysis</TabsTrigger>
        </TabsList>

        {/* Failures */}
        <TabsContent value="failures" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1 */}
            <Card>
              <CardHeader>
                <CardTitle>Failure Rate by Vehicle Model</CardTitle>
                <CardDescription>Percentage of vehicles with warranty claims</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={failureRateByModel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'rate' ? `${value}%` : value,
                        name === 'rate' ? 'Failure Rate' : name
                      ]}
                    />
                    <Bar dataKey="rate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 2 */}
            <Card>
              <CardHeader>
                <CardTitle>Claims by Category</CardTitle>
                <CardDescription>Distribution of warranty claims by component type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={claimsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {claimsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 3 */}
            <Card>
              <CardHeader>
                <CardTitle>Failures by Component</CardTitle>
                <CardDescription>Number of failures and associated costs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={failureRateByPart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="part" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="failures" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 4 */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Analysis</CardTitle>
                <CardDescription>Claims and failures by geographic region</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={failureRateByRegion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="failures" fill="#ffc658" name="Failures" />
                    <Bar dataKey="claims" fill="#ff7300" name="Claims" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Costs */}
        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1 */}
            <Card>
              <CardHeader>
                <CardTitle>Warranty Cost Trend</CardTitle>
                <CardDescription>Monthly warranty costs and claim volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={costTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'cost' ? `$${value.toLocaleString()}` : value,
                        name === 'cost' ? 'Cost' : 'Claims'
                      ]}
                    />
                    <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="claims" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Chart 2 */}
            <Card>
              <CardHeader>
                <CardTitle>Cost by Component</CardTitle>
                <CardDescription>Total warranty costs by component type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {failureRateByPart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.part}</p>
                        <p className="text-sm text-muted-foreground">{item.failures} failures</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.cost.toLocaleString()}</p>
                        <Badge variant="outline" className="text-xs">
                          ${(item.cost / item.failures).toLocaleString()} avg
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown Summary</CardTitle>
              <CardDescription>Detailed warranty cost analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">$823K</div>
                  <p className="text-sm text-muted-foreground">Total Warranty Cost</p>
                  <Badge variant="outline" className="mt-1">YTD</Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">$1,245</div>
                  <p className="text-sm text-muted-foreground">Average Cost per Claim</p>
                  <Badge variant="secondary" className="mt-1">-8% vs LY</Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">662</div>
                  <p className="text-sm text-muted-foreground">Total Claims Processed</p>
                  <Badge variant="default" className="mt-1">+12% vs LY</Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">2.1%</div>
                  <p className="text-sm text-muted-foreground">Cost of Sales Ratio</p>
                  <Badge variant="outline" className="mt-1">Target: 2.5%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Center Performance</CardTitle>
                <CardDescription>Top performing service centers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'AutoService Plus', rating: 4.8, claims: 156, satisfaction: 94 },
                    { name: 'Premium EV Service', rating: 4.6, claims: 134, satisfaction: 91 },
                    { name: 'EuroTech Motors', rating: 4.5, claims: 89, satisfaction: 89 },
                    { name: 'QuickFix Auto', rating: 4.2, claims: 67, satisfaction: 85 }
                  ].map((center, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{center.name}</p>
                        <p className="text-sm text-muted-foreground">{center.claims} claims processed</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge variant="default">{center.rating}★</Badge>
                          <Badge variant="secondary">{center.satisfaction}%</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Time Distribution</CardTitle>
                <CardDescription>Claim resolution time breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { range: '< 1 day', percentage: 25, count: 165 },
                    { range: '1-3 days', percentage: 45, count: 298 },
                    { range: '3-7 days', percentage: 20, count: 132 },
                    { range: '> 7 days', percentage: 10, count: 67 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.range}</span>
                        <span>{item.count} claims ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictive */}
        <TabsContent value="predictive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Cost Analysis</CardTitle>
              <CardDescription>Forecast warranty costs based on historical data and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={predictiveCostAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`$${value?.toLocaleString()}`, 'Cost']}
                  />
                  <Area
                    type="monotone"
                    dataKey="historical"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Historical"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stackId="2"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Factors</CardTitle>
                <CardDescription>Key factors affecting warranty costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { factor: 'Battery degradation patterns', impact: 'High', trend: 'Increasing' },
                    { factor: 'Motor bearing wear', impact: 'Medium', trend: 'Stable' },
                    { factor: 'Software reliability issues', impact: 'Low', trend: 'Decreasing' },
                    { factor: 'Charging infrastructure compatibility', impact: 'Medium', trend: 'Increasing' }
                  ].map((risk, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{risk.factor}</p>
                        <p className="text-sm text-muted-foreground">Trend: {risk.trend}</p>
                      </div>
                      <Badge
                        variant={
                          risk.impact === 'High' ? 'destructive' :
                            risk.impact === 'Medium' ? 'secondary' : 'outline'
                        }
                      >
                        {risk.impact} Impact
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>AI-driven insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      recommendation: 'Increase battery inspection frequency',
                      impact: 'Reduce costs by 15%',
                      priority: 'High'
                    },
                    {
                      recommendation: 'Optimize parts inventory levels',
                      impact: 'Improve service time by 2 days',
                      priority: 'Medium'
                    },
                    {
                      recommendation: 'Enhanced technician training program',
                      impact: 'Reduce repeat claims by 8%',
                      priority: 'Medium'
                    },
                    {
                      recommendation: 'Predictive maintenance alerts',
                      impact: 'Prevent 25% of failures',
                      priority: 'High'
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.recommendation}</p>
                          <p className="text-sm text-muted-foreground">{item.impact}</p>
                        </div>
                        <Badge
                          variant={item.priority === 'High' ? 'destructive' : 'secondary'}
                          className="ml-2"
                        >
                          {item.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
