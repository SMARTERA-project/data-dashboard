<div align="center">
  <img
    src="fe/src/assets/images/smartera-logo.svg"
    alt="SMART ERA Logo"
    width="80"
  />

# SMART ERA Data Dashboard

[![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://www.python.org/)
[![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Apollo-GraphQL](https://img.shields.io/badge/-ApolloGraphQL-311C87?style=for-the-badge&logo=apollo-graphql)](https://www.apollographql.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MaterialUI](https://img.shields.io/badge/Material%20UI-%23FFFFFF?style=for-the-badge&logo=MUI&logoColor=%23007FFF)](https://mui.com/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

The **SMART ERA Data Dashboard** provides an interactive data platform for six European rural regions (i.e., SMART ERA pilot areas) to support local rural communities in their digital transformation. It was designed, implemented, and deployed as a core digital component of the SMART ERA project to support the assessment of rural smartness and digital maturity, while facilitating data-driven decision-making in each pilot area. The dashboard presents, visualizes, and aggregates key rural smartness indicators and related data at different territorial levels.

A live demo of the dashboard is available at **[https://data.smartera-project.eu](https://data.smartera-project.eu)**.

![SMART ERA Data Dashboard](fe/public/SMART%20ERA%20Data%20Dashboard.png)

## Features

- Search by pilot region
- Filter by SESAM dimensions
- Adjust granularity for multi-scale data exploration
- Search for specific indicators or datasets
- Interact with data visualizations (maps, charts, tables)
- Select municipalities/cities/towns/villages within pilot regions
- View indicator explanations and metadata
- Compare municipalities/cities/towns/villages side-by-side
- Export analysis results as PDF
- Use a multilingual interface (English, Bulgarian, Bosnian, Spanish, Finnish, Italian, Slovenian)

## Demo Screenshots

![SMART ERA Data Dashboard Demo – Dashboard](fe/public/SMART%20ERA%20Data%20Dashboard%20-%20Dashboard%20demo1.png)

![SMART ERA Data Dashboard Demo – Dashboard](fe/public/SMART%20ERA%20Data%20Dashboard%20-%20Dashboard%20demo2.png)

![SMART ERA Data Dashboard Demo – Analysis](fe/public/SMART%20ERA%20Data%20Dashboard%20-%20Dashboard%20demo3.png)

## Installation & Setup

Please configure the `.env` file before running the dashboard.

### Environment variables

- `MONGODB_HOST`  
  Address of the MongoDB server (hostname or service in Docker/Kubernetes).

- `MONGODB_PORT`  
  Port MongoDB listens on (default `27017`).

- `MONGODB_DB_NAME`  
  Name of the database used by the application.

- `MONGODB_COLLECTION_NAME`  
  Name of the collection within the database (e.g., for storing datapoints).

- `MONGODB_ROOT_USERNAME`  
  MongoDB root user (used for administration).

- `MONGODB_ROOT_PASSWORD`  
  Password for the root user.

- `MONGODB_APP_USERNAME`  
  Application user with privileges on the database.

- `MONGODB_APP_PASSWORD`  
  Password for the application user.

- `MONGODB_URI`  
  Full URI that the application/driver can use directly, e.g.:

  ```text
  mongodb://APP_USER:APP_PASSWORD@HOST:PORT/DB_NAME?authSource=AUTH_DB
  ```

### Example `.env` (redacted)

```env
MONGODB_HOST=smartera-mongo
MONGODB_PORT=27017
MONGODB_DB_NAME=smarteradb
MONGODB_COLLECTION_NAME=datapoints

MONGODB_ROOT_USERNAME=root
MONGODB_ROOT_PASSWORD=REDACTED_ROOT_PASSWORD

MONGODB_APP_USERNAME=smartera
MONGODB_APP_PASSWORD=REDACTED_APP_PASSWORD

MONGODB_URI=mongodb://smartera:REDACTED_APP_PASSWORD@smartera-mongo:27017/smarteradb?authSource=smarteradb
```

## Citation

For academic use, please cite our work as:

```bibtex
@misc{smartera2025dashboard,
  title        = {SMART ERA Data Dashboard},
  author       = {Heričko, Tjaša and Brdnik, Saša and Rek, Patrik and Gradišnik, Mitja and Turkanović, Muhamed},
  howpublished = {\url{https://github.com/SMARTERA-project/data-dashboard}},
  note         = {Developed within the SMART ERA project (Grant Agreement No. 101084160), co-funded by the European Union},
  publisher    = {GitHub},
  journal      = {GitHub repository},
  year         = {2025}
}
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgement

This work is part of the SMART ERA (SMART community-led transition for Europe's Rural Areas) project ([https://smartera-project.eu/](https://smartera-project.eu/)), which is co-funded by the European Union’s Horizon Europe Framework Programme under Grant Agreement No. 101084160.
