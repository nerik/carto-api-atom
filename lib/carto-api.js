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
      console.log(sqlText);

      var sqlClient = new CartoDB.SQL({user: 'nerikcarto' });
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

  toggle() {
    console.log('CartoApi was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
