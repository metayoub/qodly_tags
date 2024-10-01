import {
  IteratorProvider,
  selectResolver,
  useEnhancedEditor,
  useEnhancedNode,
  useDatasourceSub,
} from '@ws-ui/webform-editor';
import { Element } from '@ws-ui/craftjs-core';
import cn from 'classnames';
import { FC } from 'react';
import { MdWarning } from 'react-icons/md';
import { ITagsProps } from './Tags.config';

const Tags: FC<ITagsProps> = ({
  enableAction = true,
  iconAction,
  iconLoader,
  componentHeight,
  componentWidth,
  datasource,
  style,
  className,
  classNames = [],
}) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();
  const { resolver } = useEnhancedEditor(selectResolver);

  useDatasourceSub();
  return (
    <div
      ref={connect}
      className={cn(className, classNames)}
      style={{ width: componentWidth, height: componentHeight }}
    >
      {datasource ? (
        <>
          <div className="items-center space-x-2" style={style}>
            <IteratorProvider>
              <Element is={resolver.Text} id="container" canvas />
            </IteratorProvider>
            {enableAction && <div className={cn('action cursor-pointer fa', iconAction)} />}
          </div>

          <div
            style={{ ...style, width: '' }}
            className={cn('load-more cursor-pointer fa leading-normal', iconLoader)}
          >
            &#8203;
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center rounded-lg border bg-purple-400 py-4 text-white">
          <MdWarning className="mb-1 h-4 w-4" />
          <p>Please attach a datasource</p>
        </div>
      )}
    </div>
  );
};

export default Tags;
