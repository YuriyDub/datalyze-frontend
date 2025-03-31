import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DataUploadDialog } from '@/features/data-upload/components/DataUploadDialog';
import { Separator } from '@radix-ui/react-separator';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function DataPage() {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  const handleDialogOpen = (isOpen: boolean) => {
    setDialogIsOpen(() => isOpen);
  };

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Your Data</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="grid h-full grid-cols-1 p-3 lg:grid-cols-3 md:grid-cols-2 ">
        <Card className="h-50 cursor-pointer border-dashed" onClick={() => handleDialogOpen(true)}>
          <CardContent className="h-full flex justify-center items-center">
            <Plus color="#99a1af" />
            <h2 className="text-gray-400">Crete New</h2>
          </CardContent>
        </Card>
      </div>
      <DataUploadDialog open={dialogIsOpen} onOpenChange={handleDialogOpen} />
    </div>
  );
}
