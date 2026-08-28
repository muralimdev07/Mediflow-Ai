import React from 'react';
import LandingPageComponent from '../../components/LandingPage';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();

  return <LandingPageComponent onGetStarted={() => navigate('/login')} />;
};

export default LandingPage;
