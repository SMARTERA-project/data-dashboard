import axios from 'axios';

const axiosGraphQLClient = axios.create({
  baseURL: 'https://smartera.feri.um.si/graphql',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosGraphQLClient;
