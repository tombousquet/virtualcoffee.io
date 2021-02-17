exports.handler = (event, context) => {
  const formId = event.queryStringParameters.formId;
  const nunjucks = require('nunjucks');

  const env = nunjucks.configure('./src', { autoescape: false });
  console.log(event);
  env.addFilter('assetPath', function (value) {
    if (process.env.ELEVENTY_ENV === 'production') {
      const manifestPath = '../assets.json';
      const manifest = JSON.parse(fs.readFileSync(manifestPath));
      return manifest[value] ? manifest[value] : value;
    }
    return value;
  });

  env.addFilter('qualifiedUrl', function (path) {
    if (!process.env.NETLIFY) {
      return path;
    }

    const baseUrl =
      process.env.CONTEXT === 'production'
        ? process.env.URL
        : process.env.DEPLOY_PRIME_URL;

    return baseUrl ? baseUrl + path : path;
  });

  const page = {
    // URL can be used in <a href> to link to other templates
    url: event.path,

    // JS Date Object for current page (used to sort collections)
    date: new Date(),
  };

  const content = nunjucks.render('_misc/membership.njk', {
    formId,
    includePath: '_includes/',
    page,
  });
  const body = nunjucks.render('_includes/layouts/base.njk', {
    content,
    includePath: '_includes/',
    page,
  });

  return {
    statusCode: 200,
    body,
  };
};