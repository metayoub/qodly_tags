import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';

import { ITagsProps } from './Tags.config';

const Tags: FC<ITagsProps> = ({ iconAction, iconLoader, style, className, classNames = [] }) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  const Tags = [
    {
      name: 'Tag1',
    },
    {
      name: 'Tag2',
    },
    {
      name: 'Tag3',
    },
  ];

  return (
    <div ref={connect} className={cn(className, classNames)}>
      {Tags.map((tag, index) => (
        <div className="cursor-pointer flex items-center space-x-2" style={style} key={index}>
          <span>{tag.name}</span>
          <div className={cn('action cursor-pointer fa', iconAction)} />
        </div>
      ))}

      <div style={style} className={cn('load-more cursor-pointer fa', iconLoader)} />
    </div>
  );
};

export default Tags;
