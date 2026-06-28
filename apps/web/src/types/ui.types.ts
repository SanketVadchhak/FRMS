export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}
