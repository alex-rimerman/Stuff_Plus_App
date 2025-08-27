import 'dotenv/config';
import fs from 'fs';

function getNextBuildNumber() {
  const filePath = './buildNumber.json';
  let buildNumber = 1;

  // Read previous build number from file
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    buildNumber = (data.iosBuildNumber || 1) + 1;
  }

  // Save new build number back to file
  fs.writeFileSync(filePath, JSON.stringify({ iosBuildNumber: buildNumber }));

  return buildNumber.toString();
}

const iosBuildNumber = getNextBuildNumber();

export default ({ config }) => ({
  ...config,
  name: "Stuff Plus App",
  slug: "Stuff_Plus_App",
  version: "1.0.3",                     // user-facing version
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "stuffplusapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  extra: {
    apiUrl: process.env.API_URL,
    eas: {
      projectId: "4e03cabb-e6c6-4530-898b-908746e7478b",
    },
  },
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: "com.yourname.stuffplus",
    buildNumber: iosBuildNumber,        // dynamically incremented build number
  },
  android: {
    ...config.android,
    package: "com.yourname.stuffplus",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    ...config.web,
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
