import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { requestAPI } from './handler';
import sharingPlugin from './sharing';

/**
 * Initialization data for the observacode_student extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'observacode_student:plugin',
  autoStart: true,
  optional: [ISettingRegistry],
  activate: (app: JupyterFrontEnd, settingRegistry: ISettingRegistry | null) => {
    console.log('JupyterLab extension observacode_student is activated!');

    if (settingRegistry) {
      settingRegistry
        .load(plugin.id)
        .then(settings => {
          console.log('observacode_student settings loaded:', settings.composite);
        })
        .catch(reason => {
          console.error('Failed to load settings for observacode_student.', reason);
        });
    }

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The observacode_student server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default [plugin, sharingPlugin];
