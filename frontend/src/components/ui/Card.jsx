import React from 'react';
export default function Card({ as:Tag='section', className='', children, ...props }) { return <Tag className={`ui-card ${className}`} {...props}>{children}</Tag>; }
