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
import { DataUploadDialog } from '@/features/data-upload/components/DataUploadDialog';
import {
  getUserDatasets,
  deleteDataset,
  renameDataset,
  clearTempFiles,
  IDatasetInfo,
} from '@/services/api/data';
import { Separator } from '@radix-ui/react-separator';
import { Edit, Database, Plus, Trash2, CircleSlash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function DataPage() {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [datasets, setDatasets] = useState<IDatasetInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<IDatasetInfo | null>(null);
  const [newName, setNewName] = useState('');

  const handleDialogOpen = (isOpen: boolean) => {
    setDialogIsOpen(isOpen);
    if (!isOpen) {
      fetchDatasets();
    }
  };

  const fetchDatasets = async () => {
    setIsLoading(true);
    try {
      const data = await getUserDatasets();
      setDatasets(data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      toast.error('Failed to load datasets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleDeleteClick = (dataset: IDatasetInfo) => {
    setSelectedDataset(dataset);
    setDeleteDialogOpen(true);
  };

  const handleRenameClick = (dataset: IDatasetInfo) => {
    setSelectedDataset(dataset);
    setNewName(dataset.name);
    setRenameDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDataset) return;

    setIsLoading(true);
    try {
      const result = await deleteDataset(selectedDataset.id);
      if (result.success) {
        toast.success(result.message);
        fetchDatasets();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast.error('Failed to delete dataset');
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setSelectedDataset(null);
    }
  };

  const handleRenameConfirm = async () => {
    if (!selectedDataset || !newName.trim()) return;

    setIsLoading(true);
    try {
      const result = await renameDataset(selectedDataset.id, newName);
      if (result.success) {
        toast.success(result.message);
        fetchDatasets();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error renaming dataset:', error);
      toast.error('Failed to rename dataset');
    } finally {
      setIsLoading(false);
      setRenameDialogOpen(false);
      setSelectedDataset(null);
      setNewName('');
    }
  };

  const handleClearTempFiles = async () => {
    try {
      const result = await clearTempFiles();
      if (result.success) {
        toast.success(`${result.message} (${result.count} files cleared)`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error clearing temp files:', error);
      toast.error('Failed to clear temporary files');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
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
                <BreadcrumbPage>Your Data</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button variant="outline" onClick={handleClearTempFiles}>
          Clear Temporary Files
        </Button>
      </header>

      {isLoading && datasets.length === 0 ? (
        <div className="flex justify-center items-center p-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid gap-4 p-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className="h-full min-h-56 cursor-pointer border-dashed"
            onClick={() => handleDialogOpen(true)}>
            <CardContent className="h-full flex justify-center items-center hover:animate-pulse">
              <Plus color="#99a1af" />
              <h2 className="text-gray-400">Create New</h2>
            </CardContent>
          </Card>
          {datasets.length === 0 && (
            <Card className="h-full min-h-56 border-none shadow-none bg-gray-50 opacity-80">
              <CardContent className="h-full flex justify-center items-center gap-2">
                <CircleSlash2 color="#99a1af" />
                <h2 className="text-gray-400">No Datasets</h2>
              </CardContent>
            </Card>
          )}

          {datasets.map((dataset) => (
            <Card
              key={dataset.fileKey}
              className="overflow-hidden transition-shadow hover:shadow-lg ">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {dataset.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground">
                  <p>Type: {dataset.fileType}</p>
                  <p>Size: {formatFileSize(Number(dataset.fileSize))}</p>
                  <p>Created at: {formatDate(dataset.createdAt)}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameClick(dataset);
                  }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(dataset);
                  }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Dataset</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{' '}
            <span className="font-semibold">{selectedDataset?.name}</span>? This action cannot be
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

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Dataset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newName">New Name</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRenameConfirm} disabled={isLoading || !newName.trim()}>
              {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataUploadDialog open={dialogIsOpen} onOpenChange={handleDialogOpen} />
    </div>
  );
}
