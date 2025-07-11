import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  UserPlus,
  MessageSquare,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Partners() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Check if user is admin or partner
  const isAdmin = user?.userId === 0 || user?.userId === 1 || user?.userId === 2;
  const isPartner = isAdmin; // For now, admins are also partners

  // Redirect if not authorized
  useEffect(() => {
    if (!authLoading && (!user || !isPartner)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [user, isPartner, authLoading, toast, setLocation]);

  // Fetch research requests
  const { data: researchRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/research-requests"],
    enabled: isPartner,
  });

  // Fetch partners
  const { data: partners, isLoading: partnersLoading } = useQuery({
    queryKey: ["/api/partners"],
    enabled: isPartner,
  });

  // Create research request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      await apiRequest("POST", "/api/research-requests", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research-requests"] });
      setNewRequestOpen(false);
      toast({
        title: "Research Request Created",
        description: "Your research request has been submitted successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Show loading state
  if (authLoading || requestsLoading || partnersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  // Don't render anything if not authorized
  if (!isPartner) {
    return null;
  }

  const handleCreateRequest = (formData: FormData) => {
    const requestData = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      priority: formData.get("priority"),
    };
    createRequestMutation.mutate(requestData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerChildren}
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center">
          <h1 className="text-4xl font-bold mb-4">Partner Panel</h1>
          <p className="text-gray-600">Research collaboration and client communication platform</p>
        </motion.div>

        {/* Partner Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="requests">Research Requests</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="insights">Publish Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <FileText className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{researchRequests?.length || 0}</div>
                    <p className="text-xs text-gray-500">All research requests</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {researchRequests?.filter(r => r.status === 'pending').length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Awaiting assignment</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {researchRequests?.filter(r => r.status === 'in_progress').length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Currently active</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {researchRequests?.filter(r => r.status === 'completed').length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Successfully finished</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest research requests and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {researchRequests?.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <FileText className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{request.title}</p>
                            <p className="text-sm text-gray-500">{request.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        No research requests yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="space-y-6">
              {/* Research Requests */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Research Requests
                      </CardTitle>
                      <CardDescription>
                        Manage and track all research requests
                      </CardDescription>
                    </div>
                    <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          New Request
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Research Request</DialogTitle>
                          <DialogDescription>
                            Submit a new research request for the team
                          </DialogDescription>
                        </DialogHeader>
                        <form action={handleCreateRequest} className="space-y-4">
                          <div>
                            <Label htmlFor="title">Title</Label>
                            <Input 
                              id="title" 
                              name="title" 
                              placeholder="Research request title"
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea 
                              id="description" 
                              name="description" 
                              placeholder="Detailed description of the research needed"
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equity_analysis">Equity Analysis</SelectItem>
                                <SelectItem value="market_research">Market Research</SelectItem>
                                <SelectItem value="sector_analysis">Sector Analysis</SelectItem>
                                <SelectItem value="economic_research">Economic Research</SelectItem>
                                <SelectItem value="technical_analysis">Technical Analysis</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select name="priority" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setNewRequestOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createRequestMutation.isPending}>
                              {createRequestMutation.isPending ? "Creating..." : "Create Request"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {researchRequests?.length ? (
                      <div className="space-y-4">
                        {researchRequests.map((request) => (
                          <div key={request.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium">{request.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{request.category}</Badge>
                                  <Badge className={getPriorityColor(request.priority)}>
                                    {request.priority}
                                  </Badge>
                                  <Badge className={getStatusColor(request.status)}>
                                    {request.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No research requests found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communications" className="space-y-6">
              {/* Communications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Client Communications
                  </CardTitle>
                  <CardDescription>
                    Manage conversations with clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Communications Coming Soon</h3>
                    <p className="text-gray-600 mb-4">
                      Real-time messaging system between partners and clients will be available here.
                    </p>
                    <Button variant="outline">
                      Configure Messaging
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              {/* Publish Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Publish Research Insights
                  </CardTitle>
                  <CardDescription>
                    Create and publish research insights for clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Publishing System Coming Soon</h3>
                    <p className="text-gray-600 mb-4">
                      Content management system for publishing research insights and reports.
                    </p>
                    <Button variant="outline">
                      Configure Publishing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}