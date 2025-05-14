import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getChats, createChat, deleteChat, IChat } from '@/services/api/chat';
import { getUserDatasets, IDatasetInfo } from '@/services/api/data';
import { Separator } from '@radix-ui/react-separator';
import { MessageSquare, MessageSquareOff, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function ChatsPage() {
  const [chats, setChats] = useState<IChat[]>([]);
  const [datasets, setDatasets] = useState<IDatasetInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [chatTitle, setChatTitle] = useState('');
  const navigate = useNavigate();

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const data = await getChats();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDatasets = async () => {
    try {
      const data = await getUserDatasets();
      setDatasets(data);
      if (data.length === 0) {
        toast.error(
          'You need to upload datasets in the "Your Data" section before creating a chat',
        );
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
      toast.error('Failed to load datasets');
    }
  };

  useEffect(() => {
    fetchChats();
    fetchDatasets();
  }, []);

  const handleCreateChat = async () => {
    if (!selectedDatasetId) {
      toast.error('Please select a dataset');
      return;
    }

    setIsLoading(true);
    try {
      const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);
      const title = chatTitle.trim() || `Chat about ${selectedDataset?.name || 'dataset'}`;
      const newChat = await createChat({
        datasetId: selectedDatasetId,
        title,
      });

      toast.success('Chat created successfully');
      setCreateDialogOpen(false);
      setChatTitle('');
      setSelectedDatasetId('');

      // Navigate to the new chat
      navigate(`/chats/${newChat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (chat: IChat) => {
    setSelectedChat(chat);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedChat) return;

    setIsLoading(true);
    try {
      const result = await deleteChat(selectedChat.id);
      if (result.success) {
        toast.success(result.message);
        fetchChats();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setSelectedChat(null);
    }
  };

  const handleChatClick = (chat: IChat) => {
    navigate(`/chats/${chat.id}`);
  };

  const handleCreateDialogOpen = () => {
    if (datasets.length === 0) {
      toast.error('Please upload datasets in the "Your Data" section first');
      navigate('/your-data');
      return;
    }
    setCreateDialogOpen(true);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>AI Chat</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {isLoading && chats.length === 0 ? (
        <div className="flex justify-center items-center p-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid gap-4 p-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className="h-full min-h-56 cursor-pointer border-dashed"
            onClick={handleCreateDialogOpen}>
            <CardContent className="h-full flex justify-center items-center hover:animate-pulse">
              <Plus color="#99a1af" />
              <h2 className="text-gray-400">New Chat</h2>
            </CardContent>
          </Card>	
          {chats.length === 0 && (
            <Card className="h-full min-h-56 border-none shadow-none bg-gray-50 opacity-80">
              <CardContent className="h-full flex justify-center items-center gap-2">
                <MessageSquareOff color="#99a1af" />
                <h2 className="text-gray-400">No Chats</h2>
              </CardContent>
            </Card>
          )}
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className="overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
              onClick={() => handleChatClick(chat)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {chat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground">
                  <p>Dataset: {chat.datasetName}</p>
                  <p>Created: {formatDate(chat.createdAt)}</p>
                  <p>Last updated: {formatDate(chat.updatedAt)}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(chat);
                  }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Chat Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataset">Select Dataset</Label>
              <Select value={selectedDatasetId} onValueChange={setSelectedDatasetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Chat Title (Optional)</Label>
              <Input
                id="title"
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
                placeholder="Enter chat title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateChat} disabled={isLoading || !selectedDatasetId}>
              {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{' '}
            <span className="font-semibold">{selectedChat?.title}</span>? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isLoading}>
              {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
