'use client';

import { User } from "@/app/layout";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger
} from "@/components/ui/sidebar";
import { Maximize2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Switch } from "../../ui/switch";
import { AppSidebar } from "./app-sidebar";

export default function DashboardLayoutClient({
    children,
    user,
}: {
    children: React.ReactNode;
    user : User
}) {
    const { setTheme } = useTheme()

    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);


    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* <TopBar /> */}
            <SidebarProvider>
                <AppSidebar user={user} />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 justify-between">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                        </div>
                        <div className="px-4 flex items-center gap-4">
                            <Button 
                                title={isFullscreen ? "Minimize" : "Fullscreen"} 
                                variant="outline" 
                                className="h-8 w-8 p-0" 
                                onClick={() => {
                                    if (typeof document !== 'undefined') {
                                        if (document.fullscreenElement) {
                                            document.exitFullscreen();
                                        } else {
                                            document.documentElement.requestFullscreen();
                                        }
                                    }
                                }}
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center space-x-2">
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Switch
                                    checked={useTheme().theme === 'dark'}
                                    onCheckedChange={(checked: boolean) => setTheme(checked ? 'dark' : 'light')}
                                />
                                <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            </div>
                        </div>
                    </header>
                    <div className="mx-4 mb-4 dark:bg-muted/50 bg-gr p-4 rounded-xl h-full">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}