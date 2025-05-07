import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Code, LucideIcon, Braces, Server, Terminal, Cpu } from 'lucide-react';

interface CodeLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'code' | 'terminal';
  text?: string;
  showText?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  code: Code,
  braces: Braces,
  server: Server,
  terminal: Terminal,
  cpu: Cpu,
};

export function CodeLoader({
  size = 'md',
  variant = 'code',
  text = 'Loading...',
  showText = true,
  className,
  ...props
}: CodeLoaderProps) {
  // Size mappings
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  // Text size mappings
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Choose a random icon if not explicitly using a variant
  const [IconComponent, setIconComponent] = React.useState<LucideIcon>(
    iconMap[Object.keys(iconMap)[Math.floor(Math.random() * Object.keys(iconMap).length)]]
  );

  React.useEffect(() => {
    if (variant !== 'code' && variant !== 'terminal') {
      return;
    }
    
    // For code and terminal variants, cycle through different icons
    const interval = setInterval(() => {
      const keys = Object.keys(iconMap);
      const randomIcon = keys[Math.floor(Math.random() * keys.length)];
      setIconComponent(iconMap[randomIcon]);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [variant]);

  // Different variants of the loader
  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={cn("relative", sizeClasses[size])}>
            <motion.div 
              className="absolute inset-0 border-t-2 border-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-0 border-t-2 border-primary/30 rounded-full"
              animate={{ rotate: -180 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Code className="h-1/2 w-1/2 text-primary animate-pulse" />
            </div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/10"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 0.9, 0.7]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/5"
              animate={{ 
                scale: [1.1, 1.2, 1.1],
                opacity: [0.5, 0.7, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3
              }}
            />
            <Code className="h-1/2 w-1/2 text-primary" />
          </div>
        );
      
      case 'code':
        return (
          <motion.div 
            className={cn("relative flex items-center justify-center", sizeClasses[size])}
            animate={{ rotate: [0, 10, 0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 border-2 border-dashed border-primary/40 rounded-md"
              animate={{ rotate: [0, 180] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="flex items-center justify-center"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {React.createElement(IconComponent, { 
                className: "h-1/2 w-1/2 text-primary", 
              })}
            </motion.div>
          </motion.div>
        );
      
      case 'terminal':
        return (
          <div className={cn("border-2 border-primary rounded-md overflow-hidden flex flex-col", sizeClasses[size])}>
            <div className="h-1/4 bg-primary flex items-center px-2">
              <div className="flex gap-1">
                <motion.div 
                  className="w-2 h-2 rounded-full bg-red-500"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.div 
                  className="w-2 h-2 rounded-full bg-yellow-500"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div 
                  className="w-2 h-2 rounded-full bg-green-500"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
            <div className="h-3/4 bg-black flex items-center justify-center">
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-primary text-xs"
              >
                {React.createElement(IconComponent, { 
                  className: "h-1/2 w-1/2 text-primary", 
                })}
              </motion.div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className={cn("animate-spin", sizeClasses[size])}>
            <Code className="h-full w-full text-primary" />
          </div>
        );
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)} {...props}>
      {renderLoader()}
      {showText && (
        <motion.p 
          className={cn("text-muted-foreground", textSizeClasses[size])}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}