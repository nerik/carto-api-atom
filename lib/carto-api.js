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
        this.import(event.target.dataset.path, event.target.dataset.name)
      }
    }));

    this.statusBarPromise = new Promise(resolve => {
      this.resolveStatusBarPromise = resolve;
    });
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  consumeStatusBar(statusBar) {
    const container = document.createElement('span');
    const logo = document.createElement('span');
    logo.textContent = 'CARTO';
    logo.style.marginRight = '5px';
    container.appendChild(logo);
    const message = document.createElement('span');
    container.appendChild(message);
    const statusBarTile = statusBar.addLeftTile({
      item: container,
      priority: 100
    });
    this.resolveStatusBarPromise({
      logo,
      message
    });
  },

  log(status, text) {
    this.statusBarPromise.then( ({logo, message}) => {
      logo.className = `highlight-${status}`;
      message.className = `text-${status}`;
      message.textContent = text;
    })
  },

  sql(format) {
    this.log('info', 'starting SQL...');
    if (editor = atom.workspace.getActiveTextEditor()) {
      const sqlText = editor.getText();
      var sqlClient = new CartoDB.SQL(getCredentials());
      sqlClient.execute(sqlText, {
        format: format
      }).done(data => {
        this.log('success', 'success! 👍');
        editor.insertText(data);
      }).error(err => {
        this.log('error', err);
      });
    }
  },

  import(path, name) {
    this.log('info', `importing ${name}...`);
    var importer = new CartoDB.Import(getCredentials());
    importer.file(path).done(tableName => {
      this.log('success', `table ${tableName} created 👌`);
    }).error(error => {
      this.log('error', error);
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
