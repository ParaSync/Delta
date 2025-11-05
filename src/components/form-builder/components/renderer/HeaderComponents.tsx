/**
 * Header components for FormRenderer (runtime/preview mode)
 * These are identical to builder headings since they're non-interactive
 */

import type { InteractiveFieldProps } from '../types';

export function H1Field({ node }: InteractiveFieldProps) {
  return (
    <h1 
      className="text-4xl font-bold mb-4"
      role="heading"
      aria-level={1}
      data-testid="heading-1"
    >
      {String(node.props.text || '')}
    </h1>
  );
}

export function H2Field({ node }: InteractiveFieldProps) {
  return (
    <h2 
      className="text-3xl font-bold mb-3"
      role="heading"
      aria-level={2}
      data-testid="heading-2"
    >
      {String(node.props.text || '')}
    </h2>
  );
}

export function H3Field({ node }: InteractiveFieldProps) {
  return (
    <h3 
      className="text-2xl font-bold mb-2"
      role="heading"
      aria-level={3}
      data-testid="heading-3"
    >
      {String(node.props.text || '')}
    </h3>
  );
}

export function ParagraphField({ node }: InteractiveFieldProps) {
  return (
    <p 
      className="mb-4 text-gray-700"
      role="paragraph"
      data-testid="paragraph"
    >
      {String(node.props.text || '')}
    </p>
  );
}

export function HelpField({ node }: InteractiveFieldProps) {
  return (
    <p 
      className="mb-3 text-sm text-gray-500 italic"
      role="note"
      data-testid="help-text"
    >
      {String(node.props.text || '')}
    </p>
  );
}
