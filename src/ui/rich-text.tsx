import { Em, Link, Span, type SpanProps } from "@chakra-ui/react";
import { Fragment, type ReactNode } from "react";

//------------------------------------------------------------------------------
// Rich Text Pattern
//------------------------------------------------------------------------------

export type RichTextPattern = {
  regex: RegExp;
  render: (val: ReactNode) => ReactNode;
};

//------------------------------------------------------------------------------
// Rich Text
//------------------------------------------------------------------------------

export type RichTextProps = {
  patterns?: RichTextPattern[];
  text: string;
} & Omit<SpanProps, "children">;

export default function RichText({
  patterns = defaultPatterns,
  text,
  ...rest
}: RichTextProps) {
  return (
    <Span {...rest}>
      {isListWithAtLeastOneItem(patterns) ?
        <RichTextRec patterns={patterns} text={text} />
      : text}
    </Span>
  );
}

//------------------------------------------------------------------------------
// Rich Text Rec
//------------------------------------------------------------------------------

export type RichTextRecProps = {
  patterns: readonly [RichTextPattern, ...RichTextPattern[]];
  text: string;
};

function RichTextRec({ patterns, text }: RichTextRecProps) {
  const [{ regex, render }, ...rest] = patterns;
  const parts = text.split(regex);

  const renderPart = (part: string) =>
    isListWithAtLeastOneItem(rest) ?
      <RichTextRec patterns={rest} text={part} />
    : part;

  return parts.map((part, i) => (
    <Fragment key={i}>
      {i & 1 ? render(renderPart(part)) : renderPart(part)}
    </Fragment>
  ));
}

//------------------------------------------------------------------------------
// Is List With At Least One Item
//------------------------------------------------------------------------------

function isListWithAtLeastOneItem<T>(items: T[]): items is [T, ...T[]] {
  return items.length > 0;
}

//------------------------------------------------------------------------------
// Is List With At Least One Item
//------------------------------------------------------------------------------

const defaultPatterns = [
  {
    regex: /##(.+?)##/,
    render: (val: ReactNode) => (
      <Span fontSize="md" fontWeight="bold">
        {val}
      </Span>
    ),
  },
  {
    regex: /\*\*(.+?)\*\*/,
    render: (val: ReactNode) => <b>{val}</b>,
  },
  {
    regex: /_(.+?)_/,
    render: (val: ReactNode) => <Em>{val}</Em>,
  },
  {
    regex: /@@(.+?)@@/,
    render: (val: ReactNode) => <Link href={`mailto:${val}`}>{val}</Link>,
  },
];
