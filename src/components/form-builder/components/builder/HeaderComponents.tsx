/**
 * Header components for FormElement (builder preview)
 */

import type { BaseFieldProps } from '../types';

export function H1Field({ node }: BaseFieldProps) {
  return (
    <h1 className="text-3xl font-bold" data-testid="builder-h1" role="heading" aria-level={1}>
      {String(node.props.text || 'Heading 1')}
    </h1>
  );
}

export function H2Field({ node }: BaseFieldProps) {
  return (
    <h2 className="text-2xl font-bold" data-testid="builder-h2" role="heading" aria-level={2}>
      {String(node.props.text || 'Heading 2')}
    </h2>
  );
}

export function H3Field({ node }: BaseFieldProps) {
  return (
    <h3 className="text-xl font-bold" data-testid="builder-h3" role="heading" aria-level={3}>
      {String(node.props.text || 'Heading 3')}
    </h3>
  );
}

export function ParagraphField({ node }: BaseFieldProps) {
  return (
    <p className="text-base" data-testid="builder-paragraph">
      {String(node.props.text || 'Paragraph text')}
    </p>
  );
}

export function HelpField({ node }: BaseFieldProps) {
  return (
    <div
      className="flex items-center gap-2 text-sm text-gray-500"
      data-testid="builder-help-text"
      role="note"
      aria-label="Help information"
    >
      <span>{String(node.props.text || 'Help text')}</span>
    </div>
  );
}
