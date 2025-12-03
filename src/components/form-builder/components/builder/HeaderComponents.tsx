/**
 * Header components for FormElement (builder preview)
 */

import type { BaseFieldProps } from '../types';
import { InlineEdit } from '../InlineEdit';

export function H1Field({ node, onUpdateNode }: BaseFieldProps) {
  const handleChange = (value: string) => {
    onUpdateNode?.(node.id, { text: value });
  };

  return (
    <InlineEdit
      value={String(node.props.text || 'Heading 1')}
      onChange={handleChange}
      as="h1"
      className="text-3xl font-bold"
      placeholder="Heading 1"
      disabled={!onUpdateNode}
    />
  );
}

export function H2Field({ node, onUpdateNode }: BaseFieldProps) {
  const handleChange = (value: string) => {
    onUpdateNode?.(node.id, { text: value });
  };

  return (
    <InlineEdit
      value={String(node.props.text || 'Heading 2')}
      onChange={handleChange}
      as="h2"
      className="text-2xl font-bold"
      placeholder="Heading 2"
      disabled={!onUpdateNode}
    />
  );
}

export function H3Field({ node, onUpdateNode }: BaseFieldProps) {
  const handleChange = (value: string) => {
    onUpdateNode?.(node.id, { text: value });
  };

  return (
    <InlineEdit
      value={String(node.props.text || 'Heading 3')}
      onChange={handleChange}
      as="h3"
      className="text-xl font-bold"
      placeholder="Heading 3"
      disabled={!onUpdateNode}
    />
  );
}

export function ParagraphField({ node, onUpdateNode }: BaseFieldProps) {
  const handleChange = (value: string) => {
    onUpdateNode?.(node.id, { text: value });
  };

  return (
    <InlineEdit
      value={String(node.props.text || 'Paragraph text')}
      onChange={handleChange}
      as="p"
      className="text-base"
      placeholder="Paragraph text"
      disabled={!onUpdateNode}
    />
  );
}

export function HelpField({ node, onUpdateNode }: BaseFieldProps) {
  const handleChange = (value: string) => {
    onUpdateNode?.(node.id, { text: value });
  };

  return (
    <div
      className="flex items-center gap-2 text-sm text-gray-500"
      data-testid="builder-help-text"
      role="note"
      aria-label="Help information"
    >
      <InlineEdit
        value={String(node.props.text || 'Help text')}
        onChange={handleChange}
        as="span"
        placeholder="Help text"
        disabled={!onUpdateNode}
      />
    </div>
  );
}
