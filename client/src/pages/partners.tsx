import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Trash2,
  Search,
  BookOpen,
  TrendingUp,
  BarChart3,
  FileDown,
  Globe,
  Settings,
  User,
  Hash,
  DollarSign,
  Building,
  TrendingUpDown
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const [newPublicationOpen, setNewPublicationOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Research request dialog state (same as dashboard)
  const [researchStep, setResearchStep] = useState(1);
  const [researchType, setResearchType] = useState("");
  const [researchTarget, setResearchTarget] = useState("");
  const [researchDescription, setResearchDescription] = useState("");

  // Check if user is a partner (userId 0, 1, or 2)
  const isPartner = user?.userId === 0 || user?.userId === 1 || user?.userId === 2;

  // Redirect if not authorized
  useEffect(() => {
    if (!authLoading && (!user || !isPartner)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the Partner Panel.",
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

  // Fetch all users for partner search
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isPartner,
  });

  // Fetch chat conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/chat/conversations"],
    enabled: isPartner,
  });

  // Fetch messages for selected chat
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chat/messages", selectedChat?.conversationId],
    enabled: isPartner && !!selectedChat?.conversationId,
  });

  // Fetch research publications
  const { data: publications, isLoading: publicationsLoading } = useQuery({
    queryKey: ["/api/research-publications/drafts"],
    enabled: isPartner,
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create research request mutation (same as dashboard)
  const createRequestMutation = useMutation({
    mutationFn: async (requestData: { type: string; target: string; description: string }) => {
      await apiRequest("POST", "/api/research-requests", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research-requests"] });
      resetResearchDialog();
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

  // Reset research dialog (same as dashboard)
  const resetResearchDialog = () => {
    setNewRequestOpen(false);
    setResearchStep(1);
    setResearchType("");
    setResearchTarget("");
    setResearchDescription("");
  };

  // Handle research request submit (same as dashboard)
  const handleResearchRequestSubmit = () => {
    if (!researchType || !researchTarget) {
      toast({
        title: "Missing information",
        description: "Please select a research type and specify the target.",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate({
      type: researchType,
      target: researchTarget,
      description: researchDescription || `${researchType} analysis for ${researchTarget}`,
    });
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      await apiRequest("POST", "/api/chat/messages", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", selectedChat?.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
      setChatMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create publication mutation
  const createPublicationMutation = useMutation({
    mutationFn: async (publicationData: any) => {
      await apiRequest("POST", "/api/research-publications", publicationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research-publications/drafts"] });
      setNewPublicationOpen(false);
      toast({
        title: "Research Publication Created",
        description: "Your research publication has been created successfully.",
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

  // Update publication mutation
  const updatePublicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PUT", `/api/research-publications/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research-publications/drafts"] });
      toast({
        title: "Publication Updated",
        description: "Research publication has been updated successfully.",
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
  if (authLoading || requestsLoading || usersLoading || conversationsLoading || publicationsLoading) {
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
      target: formData.get("target"),
      description: formData.get("description"),
      category: formData.get("category"),
      priority: formData.get("priority"),
    };
    createRequestMutation.mutate(requestData);
  };

  const handleCreatePublication = (formData: FormData) => {
    const publicationData = {
      title: formData.get("title"),
      content: formData.get("content"),
      summary: formData.get("summary"),
      category: formData.get("category"),
      tags: formData.get("tags")?.toString().split(",").map(tag => tag.trim()).filter(Boolean) || [],
      isPublished: formData.get("isPublished") === "on",
    };
    createPublicationMutation.mutate(publicationData);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedChat) return;
    
    sendMessageMutation.mutate({
      receiverUserId: selectedChat.otherUser.id,
      message: chatMessage,
    });
  };

  const handleStartChat = (selectedUser: any) => {
    const conversationId = user.id < selectedUser.id 
      ? `${user.id}_${selectedUser.id}` 
      : `${selectedUser.id}_${user.id}`;
    
    setSelectedChat({
      conversationId,
      otherUser: selectedUser,
    });
    setActiveTab("communications");
    setSelectedUser(null);
    setUserSearchQuery("");
  };

  const handlePublishToggle = (publication: any) => {
    updatePublicationMutation.mutate({
      id: publication.id,
      data: { isPublished: !publication.isPublished },
    });
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

  const filteredUsers = allUsers?.filter(u => 
    u.id !== user.id && 
    (u.firstName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
     u.lastName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
     u.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
  ) || [];

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
              <TabsTrigger value="insights">Publish Research</TabsTrigger>
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
                    <CardTitle className="text-sm font-medium">Publications</CardTitle>
                    <BookOpen className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{publications?.length || 0}</div>
                    <p className="text-xs text-gray-500">Research publications</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Published</CardTitle>
                    <Globe className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {publications?.filter(p => p.isPublished).length || 0}
                    </div>
                    <p className="text-xs text-gray-500">Live publications</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{conversations?.length || 0}</div>
                    <p className="text-xs text-gray-500">Active chats</p>
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
                            <p className="font-medium">{request.target}</p>
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
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>
                            {researchStep === 1 ? 'Select Research Type' : 'Research Details'}
                          </DialogTitle>
                          <DialogDescription>
                            {researchStep === 1 
                              ? 'Choose the type of research you need'
                              : 'Provide details for your research request'
                            }
                          </DialogDescription>
                        </DialogHeader>
                        
                        {researchStep === 1 ? (
                          <div className="space-y-4">
                            <RadioGroup value={researchType} onValueChange={setResearchType}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="company" id="company" />
                                <Label htmlFor="company" className="flex items-center">
                                  <Building className="w-4 h-4 mr-2" />
                                  Company Analysis
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sector" id="sector" />
                                <Label htmlFor="sector" className="flex items-center">
                                  <TrendingUpDown className="w-4 h-4 mr-2" />
                                  Sector Analysis
                                </Label>
                              </div>
                            </RadioGroup>
                            
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={resetResearchDialog}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => setResearchStep(2)}
                                disabled={!researchType}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="target">
                                {researchType === 'company' ? 'Company Name/Symbol' : 'Sector Name'}
                              </Label>
                              <Input
                                id="target"
                                value={researchTarget}
                                onChange={(e) => setResearchTarget(e.target.value)}
                                placeholder={researchType === 'company' ? 'e.g., Apple Inc. or AAPL' : 'e.g., Technology, Healthcare'}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="description">Additional Details (Optional)</Label>
                              <Textarea
                                id="description"
                                value={researchDescription}
                                onChange={(e) => setResearchDescription(e.target.value)}
                                placeholder="Any specific areas of focus or questions you'd like addressed..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setResearchStep(1)}>
                                Back
                              </Button>
                              <Button 
                                onClick={handleResearchRequestSubmit}
                                disabled={!researchTarget || createRequestMutation.isPending}
                              >
                                {createRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                              </Button>
                            </div>
                          </div>
                        )}
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
                                <h3 className="font-medium">{request.target}</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Search */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Start New Chat
                    </CardTitle>
                    <CardDescription>
                      Search for users to start a conversation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input
                        placeholder="Search users..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                      />
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {filteredUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleStartChat(user)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Conversations List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Conversations
                    </CardTitle>
                    <CardDescription>
                      Active conversations with clients
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {conversations?.map((conversation) => (
                        <div
                          key={conversation.conversationId}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            selectedChat?.conversationId === conversation.conversationId ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => setSelectedChat(conversation)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{conversation.otherUser.firstName} {conversation.otherUser.lastName}</p>
                              <p className="text-sm text-gray-500 truncate">{conversation.lastMessage.message}</p>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-gray-500">
                          No conversations yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Chat Window */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {selectedChat ? `Chat with ${selectedChat.otherUser.firstName} ${selectedChat.otherUser.lastName}` : 'Select a conversation'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedChat ? (
                      <div className="space-y-4">
                        <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
                          {messages?.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.senderUserId === user.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs px-3 py-2 rounded-lg ${
                                  message.senderUserId === user.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-800'
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <p className="text-xs mt-1 opacity-70">
                                  {new Date(message.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type a message..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <Button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select a conversation to start chatting
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Research Publications
                      </CardTitle>
                      <CardDescription>
                        Create and publish research insights for clients
                      </CardDescription>
                    </div>
                    <Dialog open={newPublicationOpen} onOpenChange={setNewPublicationOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          New Publication
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Research Publication</DialogTitle>
                          <DialogDescription>
                            Create a new research publication or insight
                          </DialogDescription>
                        </DialogHeader>
                        <form action={handleCreatePublication} className="space-y-4">
                          <div>
                            <Label htmlFor="title">Title</Label>
                            <Input 
                              id="title" 
                              name="title" 
                              placeholder="Publication title"
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="summary">Summary</Label>
                            <Textarea 
                              id="summary" 
                              name="summary" 
                              placeholder="Brief summary of the publication"
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="content">Content</Label>
                            <Textarea 
                              id="content" 
                              name="content" 
                              placeholder="Full publication content"
                              className="min-h-32"
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
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input 
                              id="tags" 
                              name="tags" 
                              placeholder="stocks, analysis, research"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="isPublished" 
                              name="isPublished" 
                              className="rounded"
                            />
                            <Label htmlFor="isPublished">Publish immediately</Label>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setNewPublicationOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createPublicationMutation.isPending}>
                              {createPublicationMutation.isPending ? "Creating..." : "Create Publication"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {publications?.length ? (
                      <div className="space-y-4">
                        {publications.map((publication) => (
                          <div key={publication.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium">{publication.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{publication.summary}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{publication.category}</Badge>
                                  <Badge className={publication.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                    {publication.isPublished ? "Published" : "Draft"}
                                  </Badge>
                                  {publication.tags?.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      <Hash className="h-3 w-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handlePublishToggle(publication)}
                                >
                                  {publication.isPublished ? <Eye className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No publications found
                      </div>
                    )}
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