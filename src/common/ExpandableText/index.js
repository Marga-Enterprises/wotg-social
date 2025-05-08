import React, { useState } from 'react';

const ExpandableText = ({ text = '', maxLength = 400, className }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => setExpanded(prev => !prev);
  const isLong = text.length > maxLength;
  const display = !isLong || expanded ? text : text.slice(0, maxLength);

  return (
    <div className={className}>
      {display}
      {isLong && (
        <span style={{ color: '#1877f2', cursor: 'pointer', fontWeight: 500 }} onClick={toggle}>
          {expanded ? ' See less' : '... See more'}
        </span>
      )}
    </div>
  );
};

export default ExpandableText;
