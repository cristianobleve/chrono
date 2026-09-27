const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '..', 'public');

async function run() {
  // 1. Blue Shield Icon for Security Notice (40x40 @2x, displayed at 20x20)
  const shieldSvg = `
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.49 2.23006L5.50003 4.11006C4.35003 4.54006 3.41003 5.90006 3.41003 7.12006V14.5501C3.41003 15.7301 4.19003 17.2801 5.14003 17.9901L9.44003 21.2001C10.85 22.2601 13.17 22.2601 14.58 21.2001L18.88 17.9901C19.83 17.2801 20.61 15.7301 20.61 14.5501V7.12006C20.61 5.89006 19.67 4.53006 18.52 4.10006L13.53 2.23006C12.68 1.92006 11.32 1.92006 10.49 2.23006Z" fill="#eff6ff" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.05005 11.8701L10.66 13.4801L14.96 9.18005" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  await sharp(Buffer.from(shieldSvg))
    .resize(40, 40)
    .png()
    .toFile(path.join(publicDir, 'email-shield.png'));

  // 2. Chrono Footer Logo (88x88 @2x, displayed at 44x44)
  // Use the chrono compass icon or the chrono concentric circles icon
  const chronoIconPath = path.join(publicDir, 'chrono_icon.png');
  if (fs.existsSync(chronoIconPath)) {
    // Resize chrono_icon.png to 88x88 with rounded corners
    const roundedCorners = Buffer.from(
      '<svg><rect x="0" y="0" width="88" height="88" rx="18" ry="18"/></svg>'
    );
    await sharp(chronoIconPath)
      .resize(88, 88)
      .composite([{
        input: roundedCorners,
        blend: 'dest-in'
      }])
      .png()
      .toFile(path.join(publicDir, 'email-footer-logo.png'));
  }

  // 3. Rocket icon for Invite (40x40 @2x, displayed at 20x20)
  const rocketSvg = `
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#eff6ff"/>
    <path d="M14.5 4.5L19.5 9.5M16 3L11 8L6 13L3 21L11 18L16 13L21 8L16 3Z" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  await sharp(Buffer.from(rocketSvg))
    .resize(40, 40)
    .png()
    .toFile(path.join(publicDir, 'email-rocket.png'));

  // 4. Sparkles icon for Welcome (40x40 @2x, displayed at 20x20)
  const sparklesSvg = `
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#eff6ff"/>
    <path d="M12 3V6M12 18V21M3 12H6M18 12H21M5.636 5.636L7.757 7.757M16.243 16.243L18.364 18.364M5.636 18.364L7.757 16.243M16.243 7.757L18.364 5.636" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
  await sharp(Buffer.from(sparklesSvg))
    .resize(40, 40)
    .png()
    .toFile(path.join(publicDir, 'email-sparkles.png'));

  // 5. Key icon for Recovery (40x40 @2x, displayed at 20x20)
  const keySvg = `
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#eff6ff"/>
    <circle cx="8" cy="15" r="4" stroke="#2563eb" stroke-width="1.8"/>
    <path d="M10.85 12.15L19 4M19 4H15M19 4V8M15 8L16.5 9.5" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  await sharp(Buffer.from(keySvg))
    .resize(40, 40)
    .png()
    .toFile(path.join(publicDir, 'email-key.png'));

  console.log('All email icons successfully generated!');
}

run().catch(console.error);
