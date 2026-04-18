import type { SiteConfig, SiteInfo } from '@/types/site'
import type { NavigationData, NavigationDataRaw, NavigationItem, NavigationSubItem, NavigationSubItemRaw, VideoConfig } from '@/types/navigation'

export function processSiteData(siteDataRaw: SiteInfo): SiteConfig {
    return {
        ...siteDataRaw,
        appearance: {
            ...siteDataRaw.appearance,
            theme: (siteDataRaw.appearance?.theme === 'light' ||
                siteDataRaw.appearance?.theme === 'dark' ||
                siteDataRaw.appearance?.theme === 'system')
                ? siteDataRaw.appearance.theme
                : 'system'
        },
        navigation: {
            linkTarget: (siteDataRaw.navigation?.linkTarget === '_blank' ||
                siteDataRaw.navigation?.linkTarget === '_self')
                ? siteDataRaw.navigation.linkTarget
                : '_blank'
        }
    } as SiteConfig
}

export function processNavigationSubItem(item: NavigationSubItemRaw): NavigationSubItem {
    let videoConfig: VideoConfig | undefined = undefined

    if (item.videoConfig) {
        const validType = (item.videoConfig.type === 'bilibili' || item.videoConfig.type === 'youtube')
            ? item.videoConfig.type as 'bilibili' | 'youtube'
            : 'bilibili' // default fallback

        videoConfig = {
            type: validType,
            videoId: item.videoConfig.videoId,
            bvid: item.videoConfig.bvid,
            aid: item.videoConfig.aid,
            cid: item.videoConfig.cid,
            p: item.videoConfig.p
        }
    }

    return {
        id: item.id,
        title: item.title,
        href: item.href,
        description: item.description,
        icon: item.icon,
        enabled: item.enabled,
        videoConfig
    }
}

export function processNavigationData(navigationDataRaw: NavigationDataRaw): NavigationData {
    const processedItems = navigationDataRaw.navigationItems.map(category => ({
        ...category,
        items: category.items?.map(processNavigationSubItem),
        subCategories: category.subCategories?.map(sub => ({
            ...sub,
            items: sub.items?.map(processNavigationSubItem)
        }))
    }))

    return {
        navigationItems: processedItems as NavigationItem[]
    }
}

export function filterNavigationData(navigationData: NavigationData): NavigationData {
    const filteredItems = navigationData.navigationItems
        .filter(category => category.enabled !== false)
        .map(category => {
            const filteredSubCategories = category.subCategories
                ? category.subCategories
                    .filter((sub) => sub.enabled !== false)
                    .map((sub) => ({
                        ...sub,
                        items: sub.items?.filter((item) => item.enabled !== false)
                    }))
                : undefined

            return {
                ...category,
                items: category.items?.filter((item) => item.enabled !== false),
                subCategories: filteredSubCategories
            }
        }) as NavigationItem[]

    return {
        navigationItems: filteredItems
    }
}

export function getProcessedData(navigationDataRaw: NavigationDataRaw, siteDataRaw: SiteInfo) {
    const siteData = processSiteData(siteDataRaw)
    const processedNavigationData = processNavigationData(navigationDataRaw)
    const navigationData = filterNavigationData(processedNavigationData)

    return {
        siteData,
        navigationData
    }
}
