export interface NavigationSubItem {
    title: string
    titleEn: string
    description: string
    descriptionEn: string
    icon: string
    href: string
}
  
export interface NavigationSubCategory {
    id: string
    title: string
    items: {
        title: string
        href: string
    }[]
}
  
export interface NavigationItem {
    id: string
    title: string
    icon: string
    items: NavigationSubItem[]
    subCategories: NavigationSubCategory[]
}
  
export interface NavigationData {
    navigationItems: NavigationItem[]
}
  
export interface ResourceItem {
    title: string
    description: string
    icon: string
    url: string
}
  
export interface ResourceSection {
    id: string
    title: string
    items: ResourceItem[]
}
  
export interface ResourceData {
    resourceSections: ResourceSection[]
}