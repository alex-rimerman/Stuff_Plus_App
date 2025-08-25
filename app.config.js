import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      apiUrl: process.env.API_URL,  // 👈 pulled from env
      eas: {
        projectId: config.extra?.eas?.projectId, // keep your EAS project ID intact
      },
    },
  };
};