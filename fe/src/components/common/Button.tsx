import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { ButtonProps } from '@/types/button';

const Button: React.FC<ButtonProps> = ({ label, ...props }) => {
  return <MuiButton {...props}>{label}</MuiButton>;
};

export default Button;
