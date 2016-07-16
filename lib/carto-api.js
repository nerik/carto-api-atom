'use babel';

import CartoApiView from './carto-api-view';
import { CompositeDisposable } from 'atom';
import CartoDB from 'cartodb';

export default {

  cartoApiView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.cartoApiView = new CartoApiView(state.cartoApiViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.cartoApiView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'carto-api:toggle': () => this.toggle(),
      'carto-api:sql-get-geojson': () => this.sql('geojson'),
      'carto-api:sql-get-csv': () => this.sql('csv'),
      'carto-api:import': () => {
        console.log('IMPORT')
      }
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.cartoApiView.destroy();
  },

  serialize() {
    return {
      cartoApiViewState: this.cartoApiView.serialize()
    };
  },

  sql(format) {
    if (editor = atom.workspace.getActiveTextEditor()) {
      const sqlText = editor.getText();

      var sqlClient = new CartoDB.SQL({
        user: atom.config.get('carto-api.user'),
        api_key: atom.config.get('carto-api.api_key')
      });
      sqlClient.execute(sqlText, {
        format: format
      }).done(data => {
        console.log(data)
        editor.insertText(data);
      }).error(err => {
        console.log(err)
      });

    }
  },

  config: {
    user: {
      type: 'string',
      default: 'documentation',
      order: 1
    },
    api_key: {
      type: 'string',
      default: '',
      order: 2
    }
  }
};
