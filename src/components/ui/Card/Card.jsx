import { cn } from '@/lib/cn.js';

/** @param {{ children: import('react').ReactNode, className?: string }} props */
export function Card({ children, className }) {
  return <article className={cn('panel', className)}>{children}</article>;
}

/** @param {{ children: import('react').ReactNode }} props */
function CardHeader({ children }) {
  return <header className="row between">{children}</header>;
}

/** @param {{ children: import('react').ReactNode }} props */
function CardBody({ children }) {
  return <div>{children}</div>;
}

/** @param {{ children: import('react').ReactNode }} props */
function CardFooter({ children }) {
  return <footer className="row" style={{ marginTop: 16 }}>{children}</footer>;
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
