'use client'

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import ResourceCard from './ResourceCard'
import type { ResourceSection } from '@/types/navigation'

interface ResourceTabsProps {
  resourceSections: ResourceSection[]
}

export function ResourceTabs({ resourceSections }: ResourceTabsProps) {
  return (
    <div className="col-span-3 lg:col-span-4 lg:border-l">
      <div className="h-full px-4 py-6 lg:px-8">
        <Tabs defaultValue="all" className="h-full space-y-6">
          <div className="space-between flex items-center">
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="tools">工具</TabsTrigger>
              <TabsTrigger value="resources">资源</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="all"
            className="border-none p-0 outline-none"
          >
            <div className="space-y-8">
              {resourceSections.map((section) => (
                <div key={section.id} id={section.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {section.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        精选推荐的{section.title}资源
                      </p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <ScrollArea>
                    <div className="flex space-x-4 pb-4">
                      {section.items.map(item => (
                        <ResourceCard
                          key={item.url}
                          {...item}
                          className="w-[250px]"
                        />
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 