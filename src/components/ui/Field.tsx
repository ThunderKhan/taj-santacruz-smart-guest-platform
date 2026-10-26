import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cx } from '@/utils/format';

/** Shared geometry: size, transition and focus ring. Colour comes from `controlSkin`. */
const CONTROL_BASE =
  'w-full rounded-[3px] border text-[14.5px] ' +
  'transition-[border-color,box-shadow] duration-150 ' +
  'focus:outline-none focus:ring-2 focus:ring-gold-500/25 ' +
  'disabled:cursor-not-allowed';

/**
 * Colour skin for a control — light and dark are chosen here, never layered.
 *
 * When two same-property utilities land on one element (say `bg-white` from a
 * base string plus `bg-ink-800` appended for dark mode) Tailwind settles the
 * collision by stylesheet order, not by the order they appear in `class`. The
 * white fill happened to sort last while the text colour went the other way,
 * which left the console fields as white boxes with near-white text. Building
 * one exclusive string per surface removes the ambiguity entirely.
 *
 * `[color-scheme:dark]` keeps native browser parts (select dropdowns, pickers,
 * scrollbars) on dark system colours so option lists stay readable.
 */
function controlSkin({ dark = false, invalid = false }: { dark?: boolean; invalid?: boolean } = {}) {
  return cx(
    invalid
      ? dark
        ? 'border-clay-400'
        : 'border-clay-500'
      : dark
        ? 'border-white/15'
        : 'border-cream-300',
    dark
      ? 'bg-ink-800 text-ivory-100 placeholder:text-warm-400 [color-scheme:dark] ' +
        'focus:border-gold-500 ' +
        'disabled:bg-ink-850 disabled:text-warm-500'
      : 'bg-white text-ink-900 placeholder:text-warm-400 ' +
        'focus:border-gold-600 ' +
        'disabled:bg-warm-50 disabled:text-warm-500',
    // Hover lift only when there is no error to keep visible.
    !invalid && dark && 'hover:border-white/25',
  );
}

/** Label + control + hint/error, with correct association for screen readers. */
export function Field({
  label,
  hint,
  error,
  required,
  dark = false,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  dark?: boolean;
  children: (props: { id: string; 'aria-describedby': string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const messageId = `${id}-message`;
  const invalid = Boolean(error);

  return (
    <div className={cx('w-full', className)}>
      <label
        htmlFor={id}
        className={cx(
          'eyebrow-sm mb-2 block',
          // One colour only — layering `text-clay-600` over the muted tone is
          // the same stylesheet-order gamble as the control skins above.
          error
            ? dark
              ? 'text-clay-400'
              : 'text-clay-600'
            : dark
              ? 'text-warm-400'
              : 'text-warm-600',
        )}
      >
        {label}
        {required ? <span className="ml-1 text-clay-500">*</span> : null}
      </label>
      {children({
        id,
        'aria-describedby': error || hint ? messageId : undefined,
        invalid,
      })}
      {error || hint ? (
        <p
          id={messageId}
          className={cx(
            'mt-1.5 text-[12.5px] leading-snug',
            // clay-600 is tuned for ivory pages; on ink it collapses to ~2:1.
            error
              ? dark
                ? 'text-clay-400'
                : 'text-clay-600'
              : dark
                ? 'text-warm-500'
                : 'text-warm-600',
          )}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  invalid,
  dark = false,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; dark?: boolean }) {
  return (
    <input className={cx(CONTROL_BASE, controlSkin({ dark, invalid }), 'h-11 px-3.5', className)} {...rest} />
  );
}

export function TextArea({
  invalid,
  dark = false,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean; dark?: boolean }) {
  return (
    <textarea
      className={cx(
        CONTROL_BASE,
        controlSkin({ dark, invalid }),
        'min-h-[104px] resize-y px-3.5 py-2.5 leading-relaxed',
        className,
      )}
      {...rest}
    />
  );
}

export function SelectInput({
  invalid,
  dark = false,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; dark?: boolean }) {
  return (
    <div className="relative">
      <select
        className={cx(CONTROL_BASE, controlSkin({ dark, invalid }), 'h-11 appearance-none pl-3.5 pr-9', className)}
        {...rest}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 8"
        className={cx(
          'pointer-events-none absolute right-3.5 top-1/2 h-2 w-3 -translate-y-1/2 fill-none stroke-[1.5]',
          dark ? 'stroke-warm-400' : 'stroke-warm-500',
        )}
      >
        <path d="M1 1.5 6 6.5 11 1.5" />
      </svg>
    </div>
  );
}

/** Search field with an inline icon and a clear affordance. */
export function SearchInput({
  value,
  onValueChange,
  placeholder = 'Search',
  className,
  dark = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div className={cx('relative', className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className={cx(
          'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
          dark ? 'stroke-warm-400' : 'stroke-warm-500',
        )}
        fill="none"
        strokeWidth="1.6"
      >
        <circle cx="9" cy="9" r="6" />
        <path d="m13.5 13.5 3.5 3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cx(CONTROL_BASE, controlSkin({ dark }), 'h-10 pl-9 pr-9 text-sm')}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onValueChange('')}
          aria-label="Clear search"
          className={cx(
            'absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors',
            dark ? 'text-warm-400 hover:bg-white/10' : 'text-warm-500 hover:bg-warm-100',
          )}
        >
          <svg viewBox="0 0 14 14" className="h-3 w-3 stroke-current" strokeWidth="1.6" fill="none">
            <path d="m2 2 10 10M12 2 2 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

/** Underlined segmented control — used for dashboard status filters. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  dark = false,
  className,
  ariaLabel,
}: {
  value: T;
  options: Array<{ value: T; label: string; count?: number }>;
  onChange: (value: T) => void;
  dark?: boolean;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cx(
        'flex items-center gap-1 overflow-x-auto no-scrollbar',
        dark ? 'border-b border-white/10' : 'border-b border-cream-300',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cx(
              'relative -mb-px whitespace-nowrap px-3 py-2.5 text-[13px] font-medium tracking-[0.01em]',
              'transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
              active
                ? dark
                  ? 'text-ivory-50'
                  : 'text-ink-900'
                : dark
                  ? 'text-warm-400 hover:text-cream-200'
                  : 'text-warm-600 hover:text-ink-800',
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              {option.label}
              {typeof option.count === 'number' && option.count > 0 ? (
                <span
                  className={cx(
                    'rounded-full px-1.5 py-[1px] text-[10.5px] font-semibold tabular-nums',
                    active
                      ? dark
                        ? 'bg-gold-500 text-ink-950'
                        : 'bg-ink-900 text-ivory-50'
                      : dark
                        ? 'bg-white/10 text-warm-300'
                        : 'bg-cream-300 text-warm-600',
                  )}
                >
                  {option.count}
                </span>
              ) : null}
            </span>
            {active ? (
              <span
                aria-hidden="true"
                className={cx(
                  'absolute inset-x-2 -bottom-px h-[2px]',
                  dark ? 'bg-gold-500' : 'bg-gold-600',
                )}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Selectable pill used for categories, ratings and quick options. */
export function ChoiceChip({
  selected,
  onClick,
  children,
  dark = false,
  disabled = false,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  dark?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cx(
        'rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
        'disabled:cursor-not-allowed disabled:opacity-45',
        selected
          ? dark
            ? 'border-gold-500 bg-gold-500 text-ink-950'
            : 'border-ink-900 bg-ink-900 text-ivory-50'
          : dark
            ? 'border-white/20 text-cream-200 hover:border-white/40 hover:bg-white/[0.07]'
            : 'border-warm-300 bg-white text-warm-700 hover:border-warm-400 hover:bg-warm-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Quantity stepper with accessible buttons and bounds. */
export function Stepper({
  value,
  onChange,
  min = 1,
  max = 20,
  dark = false,
  label = 'Quantity',
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  dark?: boolean;
  label?: string;
}) {
  const button =
    'flex h-9 w-9 items-center justify-center border text-[17px] leading-none transition-colors ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 disabled:opacity-35';
  const border = dark ? 'border-white/20 text-cream-200 hover:bg-white/10' : 'border-warm-300 text-ink-800 hover:bg-warm-50';

  return (
    <div className="inline-flex items-center" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cx(button, border, 'rounded-l-[3px]')}
      >
        −
      </button>
      <span
        className={cx(
          'flex h-9 w-11 items-center justify-center border-y text-sm font-semibold tabular-nums',
          dark ? 'border-white/20 text-ivory-50' : 'border-warm-300 text-ink-900',
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cx(button, border, 'rounded-r-[3px]')}
      >
        +
      </button>
    </div>
  );
}
