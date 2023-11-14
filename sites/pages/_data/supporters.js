const cache = require('@11ty/eleventy-cache-assets');

const url = `https://opencollective.com/modern-web/members/all.json`;

module.exports = async function getSupporters() {
  const supportersRaw = await cache(url, {
    duration: '1d',
    type: 'json',
  });

  const supporters = supportersRaw
    .filter(
      supporter =>
        supporter.role === 'BACKER' &&
        (!supporter.tier || !supporter.tier.includes('Sponsor')) &&
        supporter.isActive,
    )
    .map(supporter => ({
      image: supporter.image || '/_merged_assets/logo.svg',
      name: supporter.name,
      href: supporter.website || supporter.profile,
    }));

  return supporters;
};

module.exports();
