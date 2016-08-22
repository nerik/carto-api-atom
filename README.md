# carto-api-atom
A suite of tools to interact with CARTO APIs (SQL, import, geocode...), from within Atom.

## SQL: CSV

<img src="https://nerik.github.io/carto-api-atom/documentation/atom1.gif" />

## SQL: GeoJSON

<img src="https://nerik.github.io/carto-api-atom/documentation/atom2.gif" />

## SQL: SVG

<img src="https://nerik.github.io/carto-api-atom/documentation/atom3.gif" />

## File import

<img src="https://nerik.github.io/carto-api-atom/documentation/atom-import.gif" />

## Geocoding

<img src="https://nerik.github.io/carto-api-atom/documentation/atom-geocode.gif" />

## setup

```
apm install carto-api
```

All of what you can do with this package will require your CARTO username, and most your CARTO api key.
Get your api key from https://[username].carto.com/your_apps, then in Atom, go to carto-api package settings and paste it there:

<img src="https://nerik.github.io/carto-api-atom/documentation/prefs.png" />

Api key needed for:
write operations (SQL updates, inserts, etc, and file imports) as well as SQL statements involving quotas (geocoding, routing, etc)
