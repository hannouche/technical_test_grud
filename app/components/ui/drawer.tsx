'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const DrawerContext = React.createContext<{ 
  direction?: 'right' | 'top' | 'bottom' | 'left',
  width?: string | number,
}>({
  direction: 'right',
  width: undefined,
})

const Drawer = ({
  shouldScaleBackground = true,
  direction = 'right',
  width,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & { width?: string | number }) => (
  <DrawerContext.Provider value={{ direction, width }}>
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      direction={direction}
      {...props}
    />
  </DrawerContext.Provider>
);
Drawer.displayName = 'Drawer';

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/80', className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const drawerContentVariants = cva(' fixed z-50 flex h-auto flex-col border bg-background', {
  variants: {
    direction: {
      right: 'ml-24 right-0 rounded-l-[8px] inset-y-0',
      top: 'mb-24 top-0 rounded-b-[8px] inset-x-0',
      bottom: 'mt-24 rounded-t-[8px] bottom-0 inset-x-0',
      left: 'mr-24 left-0 rounded-r-[8px] inset-y-0',
    },
  },
  defaultVariants: {
    direction: 'right',
  },
});

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, style, ...props }, ref) => {
  const { direction, width } = React.useContext(DrawerContext);
  
  const combinedStyle = width 
    ? { ...style, width: typeof width === 'number' ? `${width}px` : width }
    : style;

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(drawerContentVariants({ direction, className }), "flex flex-col")}
        style={combinedStyle}
        {...props}
      >
        {/* <div className='mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted' /> */}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('sticky top-0 z-50 bg-background border-b', className)} {...props} />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('sticky bottom-0 z-50 bg-background border-t mt-auto', className)} {...props} />
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
