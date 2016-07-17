'use babel';

import { CompositeDisposable } from 'atom';
import CartoDB from 'cartodb';

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'carto-api:toggle': () => this.toggle(),
      'carto-api:sql-get-geojson': () => this.sql('geojson'),
      'carto-api:sql-get-csv': () => this.sql('csv'),
      'carto-api:import': event => {
        this.import(event.target.dataset.path)
      }
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  sql(format) {
    if (editor = atom.workspace.getActiveTextEditor()) {
      const sqlText = editor.getText();

      var sqlClient = new CartoDB.SQL(getCredentials());
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

  import(path) {
    console.log(path);
    var u = getCredentials();
    console.log(u)
    var importer = new CartoDB.Import(getCredentials());
    importer.file(path).done(tableName => {
      console.log('Table ' + tableName + ' has been created!');
    });
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

const getCredentials = () => {
  return {
    user: atom.config.get('carto-api.user'),
    api_key: atom.config.get('carto-api.api_key')
  };
}
