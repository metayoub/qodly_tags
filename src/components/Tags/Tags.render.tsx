import { DataLoader, useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { ITagsProps } from './Tags.config';

const Tags: FC<ITagsProps> = ({
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
    sources: { datasource: ds },
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

  /*useEffect(() => {
    if (!loader || !ds) return;

    loader.sourceHasChanged().then(updateFromLoader);
  }, []);*/

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

  const loadMore = () => {
    if (loader && fullLength > tags.length) {
      const newStart = loader.end;
      loader?.fetchPage(newStart).then(updateFromLoader);
    }
  };

  const handleAction = () => {
    emit('onclickaction');
  };

  const handleOnclick = () => {
    emit('onclick');
  };

  // TODO: Tag is related can be related to ES and i can select one.
  // TODO: height and width should be more dynamic.
  // TODO: add component width and height.
  // TODO: add an icon for loadmore.
  // TODO: make sur height and width of tag is working.
  // TODO: if the width is fix make sur that you display a part of text.
  // TODO: add an icon and an action related to it.

  return (
    <div ref={connect} className={cn(className, classNames)}>
      {tags.map((tag, index) => (
        <div
          className="cursor-pointer flex items-center space-x-2"
          style={style}
          key={index}
          onClick={handleOnclick}
        >
          <span>{tag[attribut as keyof typeof tag] as string}</span>
          <div className={cn('action cursor-pointer fa', iconAction)} onClick={handleAction} />
        </div>
      ))}
      {fullLength > tags.length && (
        <div
          style={style}
          className={cn('load-more cursor-pointer fa', iconLoader)}
          onClick={loadMore}
        />
      )}
    </div>
  );
};

export default Tags;
