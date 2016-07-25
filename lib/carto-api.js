'use babel';

import { CompositeDisposable } from 'atom';
import CartoDB from 'cartodb';
import geocode from 'carto-geocoding-sql';

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'carto-api:sql-get-geojson': () => this.sql('geojson'),
      'carto-api:sql-get-csv': () => this.sql('csv'),
      'carto-api:import': event => {
        this.import(event.target.dataset.path, event.target.dataset.name)
      },
      'carto-api:geocode': () => this.geocode()
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
      cartoSQL(editor.getText(), format).done(data => {
        this.log('success', 'success! 👍');
        editor.insertText(data);
      }).error(err => {
        this.log('error', err);
      });
    }
  },

  geocode() {
    if (editor = atom.workspace.getActiveTextEditor()) {
      var locations = editor.getText().split("\n");
      var sql = geocode(locations);
      cartoSQL(sql, 'geojson').done(data => {
        this.log('success', 'success! 👍');
        var coords = JSON.parse(data).features.map(feature => {
          var c = feature.geometry.coordinates;
          return `[${c[1]}, ${c[0]}]`; //do the Leaflet dance
        }).join(', ');
        editor.insertText(coords);
      }).error(err => {
        this.log('error', err);
      });
    };
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

const cartoSQL = (sql, format) => {
  var sqlClient = new CartoDB.SQL(getCredentials());
  return sqlClient.execute(sql, {
    format: format
  });
}

const getCredentials = () => {
  return {
    user: atom.config.get('carto-api.user'),
    api_key: atom.config.get('carto-api.api_key')
  };
}
