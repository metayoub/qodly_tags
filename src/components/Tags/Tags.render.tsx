import { DataLoader, updateEntity, useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { ITagsProps } from './Tags.config';

const Tags: FC<ITagsProps> = ({
  enableAction = true,
  iconLoader,
  iconAction,
  attribut,
  style,
  className,
  classNames = [],
}) => {
  const { connect, emit } = useRenderer({
    omittedEvents: [
      'onclick',
      'onclickaction',
      'onblur',
      'onfocus',
      'onmouseenter',
      'onmouseleave',
      'onkeydown',
      'onkeyup',
    ],
  });
  const [tags, setTags] = useState<datasources.IEntity[]>(() => []);
  const [fullLength, setFullLength] = useState<number>(0);
  const {
    sources: { datasource: ds, currentElement },
  } = useSources();

  const loader = useMemo<DataLoader | null>(() => {
    if (!ds) {
      return null;
    }

    return DataLoader.create(ds, [attribut as string]);
  }, [attribut, ds]);

  const updateFromLoader = useCallback(() => {
    if (!loader) {
      return;
    }
    setTags((prev) => [...prev, ...loader.page]);
    setFullLength(loader.length);
  }, [loader]);

  useEffect(() => {
    if (!loader || !ds) {
      return;
    }

    const dsListener = () => {
      loader.sourceHasChanged().then(updateFromLoader);
    };
    ds.addListener('changed', dsListener);
    return () => {
      ds.removeListener('changed', dsListener);
    };
  }, [ds, updateFromLoader]);

  const updateCurrentDsValue = async ({
    index,
    forceUpdate = false,
    fireEvent = true,
  }: {
    index: number;
    forceUpdate?: boolean;
    fireEvent?: boolean;
  }) => {
    if (!ds || !currentElement || !forceUpdate) {
      return;
    }
    await updateEntity({ index, datasource: ds, currentElement, fireEvent });
  };

  const loadMore = () => {
    if (loader && fullLength > tags.length) {
      const newStart = loader.end;
      loader?.fetchPage(newStart).then(updateFromLoader);
    }
  };

  const handleAction = (e: any) => {
    e.stopPropagation();
    emit('onclickaction');
  };

  const handleClick = (index: number) => {
    updateCurrentDsValue({ index, forceUpdate: true });
    emit('onclick');
  };

  // TODO: handle if ds is not defined
  // TODO: to see if we need to change the css of the selected element or not.
  // TODO: height and width should be more dynamic.
  // TODO: add component width and height.
  // TODO: make sur height and width of tag is working.
  // TODO: if the width is fix make sur that you display a part of text.

  return (
    <div ref={connect} className={cn(className, classNames)}>
      {tags.map((tag, index) => (
        <div
          className="cursor-pointer flex items-center space-x-2"
          style={style}
          key={index}
          onClick={() => handleClick(index)}
        >
          <span>{tag[attribut as keyof typeof tag] as string}</span>
          {enableAction && (
            <div className={cn('action cursor-pointer fa', iconAction)} onClick={handleAction} />
          )}
        </div>
      ))}
      {fullLength > tags.length && (
        <div
          style={{ ...style, width: '' }}
          className={cn('load-more cursor-pointer fa leading-normal', iconLoader)}
          onClick={loadMore}
        >
          &#8203;
        </div>
      )}
    </div>
  );
};

export default Tags;
