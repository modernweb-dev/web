const { createSocialImage } = require('@rocket/cli');

module.exports = async () => {
  const socialMediaImage = await createSocialImage({
    createSocialImageSvg: async ({ logo }) => {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" style="fill: #ecedef;">
          <defs/>
          <rect width="100%" height="100%" fill="#38393e"/>
          <g transform="matrix(0.45, 0, 0, 0.45, 300, 60)">${logo}</g>
          <g style="
            font-size: 70px;
            text-anchor: middle;
            font-family: 'Bitstream Vera Sans','Helvetica',sans-serif;
            font-weight: 700;
          ">
            <text x="50%" y="470">
              Modern Web
            </text>
            <text x="50%" y="520" style="font-size: 30px;">
              Guides, tools and libraries for modern web development.
            </text>
          </g>
        </svg>
      `;
    },
  });
  return {
    socialMediaImage,
  };
};
