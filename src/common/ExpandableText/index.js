import React, { useState } from 'react';

const ExpandableText = ({ text = '', maxLength = 400, className }) => {
  const [expanded, setExpanded] = useState(false);

  // Log initial props
  console.log('[ExpandableText] Initial Render');
  console.log('Text length:', text.length);
  console.log('Max length:', maxLength);
  console.log('Class name:', className);

  const toggle = () => {
    console.log('[ExpandableText] Toggle clicked');
    setExpanded((prev) => {
      console.log('Previous expanded state:', prev);
      return !prev;
    });
  };

  const isLong = text.length > maxLength;
  const visibleText = !isLong || expanded ? text : text.slice(0, maxLength);

  console.log('[ExpandableText] isLong:', isLong);
  console.log('[ExpandableText] expanded:', expanded);
  console.log('[ExpandableText] visibleText length:', visibleText.length);

  const formatText = (input) => {
    const linkRegex = /(https:\/\/[^\s]+)/g;
    const hashtagRegex = /#[\w\u00C0-\u017F]+/g;

    console.log('[ExpandableText] Formatting text...');
    console.log('Input text sample:', input.slice(0, 100), '...');

    return input.split(/(\s+)/).map((part, i) => {
      if (linkRegex.test(part)) {
        console.log(`[ExpandableText] Found link: ${part}`);
        return (
          <a
            key={`link-${i}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1877f2', textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      } else if (hashtagRegex.test(part)) {
        console.log(`[ExpandableText] Found hashtag: ${part}`);
        return (
          <span key={`tag-${i}`} style={{ color: '#1877f2' }}>
            {part}
          </span>
        );
      } else {
        return part;
      }
    });
  };

  return (
    <div className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {formatText(visibleText)}
      {isLong && (
        <span
          style={{
            color: '#1877f2',
            cursor: 'pointer',
            fontWeight: 500,
            whiteSpace: 'normal',
          }}
          onClick={toggle}
        >
          {expanded ? ' See less' : '... See more'}
        </span>
      )}
    </div>
  );
};

export default ExpandableText;
