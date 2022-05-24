// import { JupyterFrontEnd } from "@jupyterlab/application";
import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import {
    NotebookPanel,
    INotebookModel
} from '@jupyterlab/notebook';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import { ToolbarButton } from '@jupyterlab/apputils';
import { YCodeCell } from '@jupyterlab/shared-models'; 
  
class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>{
    createNew(widget: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): void | IDisposable {
        function callback(){
            const ydoc = new Y.Doc();

            const websocketProvider = new WebsocketProvider(
                'ws://localhost:1234', 'count-demo', ydoc
            )

            const source = (widget.model!.sharedModel.getCell(2) as YCodeCell).ysource;
            const centralizedSource = ydoc.getText('mysource');
            centralizedSource.delete(0, centralizedSource.length);
            const snapshots: Y.Array<string> = ydoc.getArray('snapshots');
            snapshots.push([""]);
            centralizedSource.applyDelta(source.toDelta());

            source.observe(event => {
                console.log(source.toJSON());
                centralizedSource.applyDelta(event.delta);
                snapshots.push([source.toJSON()]);
                console.log(centralizedSource.toJSON());
            })

            ydoc.on('update', update => {
                console.log('ydoc update');
            })

            console.log(websocketProvider);
        }

        const button = new ToolbarButton({
            className: 'sharing-button',
            label: 'Sharing',
            onClick: callback,
            tooltip: 'Start Sharing'
        });

        widget.toolbar.insertItem(11, 'sharebutton', button);
        return new DisposableDelegate(() => {
            button.dispose();
          });
        // return;
    }
}



/**
 * Initialization data for the observacode_student extension.
 */
const sharingPlugin: JupyterFrontEndPlugin<void> = {
    id: 'observacode_student:sharing-plugin',
    autoStart: true,
    // optional: [ISettingRegistry],
    activate: activate
};
  
function activate(app: JupyterFrontEnd){
    app.docRegistry.addWidgetExtension('Notebook', new ButtonExtension());
    const {shell} = app;
    const nbPanel = shell.currentWidget as NotebookPanel;
    console.log(nbPanel);
    // debugger;
    // const ydoc = nbPanel.content.widgets[2].model.sharedModel
    // Sync clients with the y-websocket provider
    // console.log(websocketProvider);
}

  export default sharingPlugin;