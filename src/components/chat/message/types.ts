import { ReactNode } from 'react';

export interface CustomComponentProps {
  children?: ReactNode;
  className?: string;
}

export interface CodeProps extends CustomComponentProps {
  inline?: boolean;
  language?: string;
  filepath?: string;
}

export interface TableProps extends CustomComponentProps {
  title?: string;
}

export interface AccordionProps extends CustomComponentProps {
  title: string;
}

export interface TabProps extends CustomComponentProps {
  name: string;
}

export interface TabGroupProps extends CustomComponentProps {
  children: ReactNode[];
}

export interface ErrorBlockProps extends CustomComponentProps {
  code?: string;
  description?: string;
  solution?: string;
  reference?: string;
}

export interface I18nBlockProps extends CustomComponentProps {
  code: string;
}

export interface AriaProps extends CustomComponentProps {
  label: string;
} 