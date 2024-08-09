import { DataLoader, useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { ITagsProps } from './Tags.config';

const Tags: FC<ITagsProps> = ({ attribut, style, className, classNames = [] }) => {
  const { connect } = useRenderer();
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
    setTags(loader.page);
    setFullLength(loader.length);
  }, [loader]);

  useEffect(() => {
    if (!loader || !ds) return;

    loader.sourceHasChanged().then(updateFromLoader);
  }, []);

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

  // TODO: show the tags
  // TODO: show the pageSize result and add load more.
  // TODO: Tag is related can be related to ES and i can select one.
  // TODO: height and width should be more dynamic.
  // TODO: add ann icon and an action related to it.

  return (
    <span ref={connect} className={cn(className, classNames)}>
      {tags.map((tag, index) => (
        <div style={style} key={index}>
          {tag[attribut as keyof typeof tag] as string}
        </div>
      ))}
      {fullLength > tags.length && <div style={style}>...</div>}
    </span>
  );
};

export default Tags;
