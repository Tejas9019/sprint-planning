import React, { forwardRef } from 'react';

type Variant = 'ghost' | 'subtle' | 'solid' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required accessible name — becomes both aria-label and the tooltip. */
  label: string;
  /** Hide the native tooltip if you only want the screen-reader name. */
  hideTitle?: boolean;
  variant?: Variant;
  size?: Size;
}

const SIZES: Record<Size, string> = {
  sm: 'w-7 h-7 [&_svg]:w-3.5 [&_svg]:h-3.5',
  md: 'w-9 h-9 [&_svg]:w-[18px] [&_svg]:h-[18px]',
  lg: 'w-11 h-11 [&_svg]:w-5 [&_svg]:h-5',
};

const VARIANTS: Record<Variant, string> = {
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
  subtle: 'text-text-primary bg-bg-tertiary/60 hover:bg-bg-tertiary',
  solid: 'text-white bg-purple-600 hover:bg-purple-700',
  danger: 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10',
};

/**
 * Accessible icon-only button. `label` is mandatory so an icon button can never
 * ship without an accessible name, and every instance gets a consistent
 * keyboard focus ring.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, hideTitle, variant = 'ghost', size = 'md', type = 'button', className = '', children, ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={hideTitle ? undefined : label}
      className={`inline-flex items-center justify-center rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-bg-secondary disabled:opacity-40 disabled:cursor-not-allowed ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
);

IconButton.displayName = 'IconButton';
