# babel-minify

To build `gh-pages` for babel-minify, run this from the babel-minify directory.

```sh
# get babel-minify
git clone git@github.com:boopathi/babel-minify

cd babel-minify
npm install

# get gh-pages
git clone -b gh-pages git@github.com:boopathi/babel-minify ../babel-minify-gh-pages

# build gh-pages
npm run gh-pages

# commit changes & push
cd ../babel-minify-gh-pages
git commit -am "Update Babel-Minify build"
git push
```
