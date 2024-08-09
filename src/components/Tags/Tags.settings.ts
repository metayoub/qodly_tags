import { ESetting, TSetting } from '@ws-ui/webform-editor';
import { BASIC_SETTINGS, DEFAULT_SETTINGS, load } from '@ws-ui/webform-editor';

const dataAccessSettings: TSetting[] = [
  {
    key: 'datasource',
    label: 'Qodly Source',
    type: ESetting.DS_AUTO_SUGGEST,
  },
  {
    key: 'attribut',
    label: 'Attribut',
    type: ESetting.TEXT_FIELD,
    defaultValue: 'Qodly',
  },
  {
    key: 'currentElement',
    label: 'Selected Element',
    type: ESetting.DS_AUTO_SUGGEST,
  },
  {
    key: 'serverSideRef',
    label: 'Server Side',
    type: ESetting.TEXT_FIELD,
    // hasError: validateServerSide,
    validateOnEnter: true,
  },
];

const componentSettings: TSetting[] = [
  {
    key: 'width',
    label: 'Component Width',
    type: ESetting.DIMENSIONS,
    defaultValue: '100%',
  },
  {
    key: 'height',
    label: 'Component Height',
    type: ESetting.DIMENSIONS,
    defaultValue: 'fit-content',
  },
  {
    key: 'iconLoader',
    label: 'Load More Icon',
    type: ESetting.ICON_PICKER,
    defaultValue: 'fa-solid fa-circle-chevron-down',
  },
  {
    key: 'iconAction',
    label: 'Action Icon',
    type: ESetting.ICON_PICKER,
    defaultValue: 'fa-solid fa-xmark',
  },
];

const Settings: TSetting[] = [
  {
    key: 'dataAccess',
    label: 'Data Access',
    type: ESetting.GROUP,
    components: dataAccessSettings,
    isStateless: true,
  },
  {
    key: 'componentProperties',
    label: 'Component Properties',
    type: ESetting.GROUP,
    components: componentSettings,
    isStateless: true,
  },
  ...load(DEFAULT_SETTINGS).filter('dataAccess', 'display'),
];

export const BasicSettings: TSetting[] = [
  ...dataAccessSettings,
  ...load(BASIC_SETTINGS).filter('style.overflow', 'serverSideRef', 'display'),
];

export default Settings;
