const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 4001;
const pdfDir = path.join(__dirname, 'public', 'pdf');

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/pdf/:filename', (req, res) => {
  const fileName = req.params.filename;

  if (fileName.includes('..')) {
    return res.status(400).send('Invalid file name.');
  }

  const filePath = path.join(pdfDir, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File does not exists.');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline'); 
  res.sendFile(filePath);
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`PDF strežnik teče na http://localhost:${PORT}`);
});