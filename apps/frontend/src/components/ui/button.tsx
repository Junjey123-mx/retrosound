import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rs-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:     'bg-rs-primary text-white shadow-sm hover:bg-rs-primary-hover hover:shadow-md disabled:bg-rs-border disabled:text-slate-400 disabled:hover:bg-rs-border',
        primary:     'bg-rs-primary text-white shadow-sm hover:bg-rs-primary-hover hover:shadow-md disabled:bg-rs-border disabled:text-slate-400 disabled:hover:bg-rs-border',
        destructive: 'bg-rs-error text-white shadow-sm hover:bg-red-600 disabled:bg-rs-border disabled:text-slate-400 disabled:hover:bg-rs-border',
        danger:      'bg-rs-error text-white shadow-sm hover:bg-red-600 disabled:bg-rs-border disabled:text-slate-400 disabled:hover:bg-rs-border',
        success:     'bg-rs-success text-white shadow-sm hover:bg-emerald-600 disabled:bg-rs-border disabled:text-slate-400 disabled:hover:bg-rs-border',
        outline:     'border border-rs-border bg-white text-rs-text hover:border-rs-primary hover:bg-orange-50 hover:text-rs-primary-hover disabled:bg-rs-border disabled:text-slate-400 disabled:hover:border-rs-border',
        secondary:   'bg-rs-secondary text-white shadow-sm hover:bg-rs-secondary-hover disabled:bg-rs-border disabled:text-slate-400 disabled:hover:bg-rs-border',
        ghost:       'bg-transparent text-rs-muted hover:bg-rs-bg-soft hover:text-rs-text disabled:bg-transparent disabled:text-slate-400',
        link:        'text-rs-primary underline-offset-4 hover:text-rs-primary-hover hover:underline disabled:text-slate-400',
      },
      size: {
        default: 'h-10 px-4 py-2',
        md:      'h-10 px-4 py-2',
        sm:      'h-9 rounded-xl px-3',
        lg:      'h-11 rounded-xl px-8',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...(!asChild ? { type: props.type ?? 'button' } : {})}
        {...props}
      >
        {asChild ? children : (
          <>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
