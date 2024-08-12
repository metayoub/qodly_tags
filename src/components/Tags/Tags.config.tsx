import { EComponentKind, T4DComponentConfig } from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { MdCircle } from 'react-icons/md';

import TagsSettings, { BasicSettings } from './Tags.settings';

export default {
  craft: {
    displayName: 'Tags',
    kind: EComponentKind.BASIC,
    props: {
      iterable: true,
      name: '',
      classNames: [],
      events: [],
    },
    related: {
      settings: Settings(TagsSettings, BasicSettings),
    },
  },
  info: {
    displayName: 'Tags',
    sanityCheck: {
      keys: [
        { name: 'datasource', require: true, isDatasource: true },
        { name: 'currentElement', require: false, isDatasource: true },
      ],
    },
    exposed: true,
    icon: MdCircle,
    events: [
      {
        label: 'On Click',
        value: 'onclick',
      },
      {
        label: 'On Click Action',
        value: 'onclickaction',
      },
      {
        label: 'On MouseEnter',
        value: 'onmouseenter',
      },
      {
        label: 'On MouseLeave',
        value: 'onmouseleave',
      },
    ],
    datasources: {
      accept: ['entitysel'],
      declarations: [{ key: 'datasource', iterable: true }, { key: 'currentElement' }],
    },
  },
  defaultProps: {
    iterableChild: true,
    enableAction: true,
    iconAction: 'fa-solid fa-xmark',
    iconLoader: 'fa-solid fa-spinner',
    style: {
      display: 'inline-flex',
      backgroundColor: 'rgb(218, 216, 216)',
      color: 'rgb(48, 48, 48)',
      paddingBottom: '6px',
      paddingLeft: '12px',
      paddingRight: '12px',
      paddingTop: '6px',
      marginRight: '2px',
      marginBottom: '0px',
      marginLeft: '0px',
      marginTop: '0px',
      alignItems: 'center',
      borderRadius: '12px',
    },
  },
} as T4DComponentConfig<ITagsProps>;

export interface ITagsProps extends webforms.ComponentProps {
  enableAction?: boolean;
  iconAction?: string;
  iconLoader?: string;
  componentWidth?: any;
  componentHeight?: any;
}
