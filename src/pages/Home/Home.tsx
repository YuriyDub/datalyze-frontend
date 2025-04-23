import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import heroImage from '@/assets/hero-image.png';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>Home</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-col gap-5 mx-5 w-auto mt-5 md:flex-row md:gap-10 md:mx-50 md:mt-30 mb-10">
        <img className="rounded-3xl w-auto h-auto md:w-75 md:h-75" src={heroImage} />
        <div className="flex flex-col gap-8 justify-center">
          <h1 className="text-2xl mt-5 font-semibold text-wrap md:text-4xl">
            Datalyze: Your Interactive Data Analytics Companion
          </h1>
          <p className="text-xl font-light">
            Datalyze is an AI-powered data analytics platform that transforms your data into
            actionable insights. With its intuitive interface and advanced algorithms, Datalyze
            empowers users to explore, visualize, and understand their data like never before.
          </p>
          <p className="text-xl font-light">
            Whether you're a data scientist, business analyst, or just someone who wants to make
            sense of their data, Datalyze has the tools you need to succeed.
          </p>
          <Button
            onClick={() => navigate('/chats')}
            size="lg"
            className="w-full ml-auto cursor-pointer md:w-60">
            Try Now
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
