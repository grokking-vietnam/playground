import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Cpu, Zap, TrendingUp, Play, Settings, Upload, Download } from "lucide-react"

export default function VertexAIApp() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vertex AI</h1>
          <p className="text-muted-foreground">Machine learning and AI model management</p>
        </div>
        <Button className="gap-2">
          <Brain className="h-4 w-4" />
          Create Model
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Models in production</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Jobs</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2M</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">Average model accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Models */}
      <Card>
        <CardHeader>
          <CardTitle>ML Models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Customer Churn Prediction",
                type: "Classification",
                status: "deployed",
                accuracy: "96.3%",
                lastTrained: "2024-01-10",
                predictions: "45.2K",
              },
              {
                name: "Sales Forecasting",
                type: "Regression",
                status: "training",
                accuracy: "92.1%",
                lastTrained: "2024-01-15",
                predictions: "12.8K",
              },
              {
                name: "Fraud Detection",
                type: "Anomaly Detection",
                status: "deployed",
                accuracy: "98.7%",
                lastTrained: "2024-01-12",
                predictions: "156.3K",
              },
              {
                name: "Recommendation Engine",
                type: "Collaborative Filtering",
                status: "testing",
                accuracy: "89.4%",
                lastTrained: "2024-01-14",
                predictions: "89.1K",
              },
            ].map((model, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{model.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {model.type} • Last trained: {model.lastTrained}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {model.accuracy} accuracy
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {model.predictions} predictions
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    model.status === 'deployed' 
                      ? 'bg-green-100 text-green-800' 
                      : model.status === 'training'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {model.status}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center space-y-2 p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">Upload Dataset</div>
              <div className="text-sm text-muted-foreground">Train new models</div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center space-y-2 p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">AutoML</div>
              <div className="text-sm text-muted-foreground">Automated training</div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center space-y-2 p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">Batch Prediction</div>
              <div className="text-sm text-muted-foreground">Run predictions</div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center space-y-2 p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Download className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">Export Model</div>
              <div className="text-sm text-muted-foreground">Download trained models</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Training Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Training Time</span>
                <span className="font-medium">2.4 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="font-medium">98.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Resource Utilization</span>
                <span className="font-medium">87%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cost per Model</span>
                <span className="font-medium">$24.50</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prediction Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Requests/Day</span>
                <span className="font-medium">45.2K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Response Time</span>
                <span className="font-medium">120ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Error Rate</span>
                <span className="font-medium">0.03%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cost per 1K Predictions</span>
                <span className="font-medium">$0.85</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
