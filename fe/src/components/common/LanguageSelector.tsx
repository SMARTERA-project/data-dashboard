import { useState } from 'react';
import i18n from '@translations/i18n';
import { useTranslation } from 'react-i18next';
import {
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  MenuProps as MuiMenuProps,
} from '@mui/material';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'bg', label: 'Български' },
  { code: 'bs', label: 'Bosanski' },
  { code: 'es', label: 'Español' },
  { code: 'fi', label: 'Suomi' },
  { code: 'it', label: 'Italiano' },
  { code: 'sl', label: 'Slovenščina' },
];

const menuProps: Partial<MuiMenuProps> = {
  PaperProps: {
    sx: {
      boxShadow: 3,
      maxWidth: 360,
      p: 1,
    },
  },
  MenuListProps: {
    sx: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 1,
    },
  },
  anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
  transformOrigin: { vertical: 'top', horizontal: 'right' },
};

export default function LanguageSelector() {
  const { ready } = useTranslation();
  const [lang, setLang] = useState<string>(i18n.language || 'en');

  const handleChange = (e: SelectChangeEvent<string>) => {
    const newLang = e.target.value;
    setLang(newLang);
    i18n.changeLanguage(newLang);
  };

  if (!ready) return null;

  return (
    <Select
      value={lang}
      onChange={handleChange}
      renderValue={value => {
        const { label } = LANGUAGES.find(l => l.code === value)!;
        return <Typography>{label}</Typography>;
      }}
      MenuProps={menuProps}
      sx={{ minWidth: 130, height: 35, backgroundColor: 'background.paper' }}
    >
      {LANGUAGES.map(({ code, label }) => (
        <MenuItem key={code} value={code}>
          <Typography>{label}</Typography>
        </MenuItem>
      ))}
    </Select>
  );
}
