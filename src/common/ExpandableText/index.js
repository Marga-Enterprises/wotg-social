import React, { useState } from 'react';

const ExpandableText = ({ text = '', maxLength = 400, className }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => setExpanded(prev => !prev);
  const isLong = text.length > maxLength;
  const visibleText = !isLong || expanded ? text : text.slice(0, maxLength);

  const formatText = (input) => {
    const linkRegex = /(https:\/\/[^\s]+)/g;
    const hashtagRegex = /#[\w\u00C0-\u017F]+/g;

    return input.split(/(\s+)/).map((part, i) => {
      if (linkRegex.test(part)) {
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
            whiteSpace: 'normal'
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
