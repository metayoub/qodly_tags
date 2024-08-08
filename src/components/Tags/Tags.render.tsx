import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useState } from 'react';

import { ITagsProps } from './Tags.config';

const Tags: FC<ITagsProps> = ({ attribut, style, className, classNames = [] }) => {
  const { connect } = useRenderer();
  const [value, setValue] = useState(() => attribut);
  const {
    sources: { datasource: ds },
  } = useSources();

  useEffect(() => {
    if (!ds) return;

    const listener = async (/* event */) => {
      const v = await ds.getValue<any>();
      setValue(v || attribut);
    };

    listener();

    ds.addListener('changed', listener);

    return () => {
      ds.removeListener('changed', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ds]);

  return (
    <span ref={connect} style={style} className={cn(className, classNames)}>
      Hello {value}!
    </span>
  );
};

export default Tags;
